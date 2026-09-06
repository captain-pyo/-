import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Enable CORS for all requests (prevents CORS errors in Vercel, dev preview, or reverse proxy)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-api-key"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Helper: Safely extract API Key from Authorization header, request body, or custom header
function extractApiKey(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  if (typeof req.body?.apiKey === "string" && req.body.apiKey.trim()) {
    return req.body.apiKey.trim();
  }
  const customHeader = req.headers["x-goog-api-key"];
  if (typeof customHeader === "string" && customHeader.trim()) {
    return customHeader.trim();
  }
  return null;
}

// Helper: Mask API key for logs (Never log raw keys to console/DB)
function maskApiKey(key: string | null | undefined): string {
  if (!key) return "[none]";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

// Helper: User-friendly Korean error parser for Gemini API errors
function parseGeminiError(error: any): { status: number; message: string } {
  const rawMsg = String(error?.message || "");
  const status = Number(error?.status || error?.code || 500);

  if (
    status === 400 ||
    rawMsg.includes("API_KEY_INVALID") ||
    rawMsg.includes("INVALID_ARGUMENT") ||
    rawMsg.includes("API key not valid")
  ) {
    return {
      status: 400,
      message:
        "제공해주신 Gemini API Key가 유효하지 않습니다. Google AI Studio에서 키를 다시 확인해주세요.",
    };
  }

  if (status === 403 || rawMsg.includes("PERMISSION_DENIED")) {
    return {
      status: 403,
      message: "해당 Gemini API Key의 접근 권한이 없거나 사용이 제한되었습니다.",
    };
  }

  if (status === 429 || rawMsg.includes("RESOURCE_EXHAUSTED")) {
    return {
      status: 429,
      message:
        "API 요청 할당량(Quota)을 초과했습니다. 잠시 후 다시 시도하거나 다른 API Key를 사용해주세요.",
    };
  }

  if (
    rawMsg.includes("ENOTFOUND") ||
    rawMsg.includes("ECONNREFUSED") ||
    rawMsg.includes("fetch failed") ||
    rawMsg.includes("network")
  ) {
    return {
      status: 503,
      message:
        "Google Gemini API 서버에 연결할 수 없습니다. 인터넷 또는 네트워크 연결을 확인해주세요.",
    };
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: "Google Gemini API 통신 중 오류가 발생했습니다. 키 상태를 확인해주세요.",
  };
}

// Helper to create a GoogleGenAI client with the specified key
function createGeminiClient(key: string) {
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasDefaultApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 1. Dedicated Key Verification Endpoint (/api/verify-key)
// Tests the key server-to-server against Google Gemini API with a minimal ping
app.post("/api/verify-key", async (req, res) => {
  const key = extractApiKey(req);
  if (!key) {
    res.status(400).json({
      valid: false,
      error: "검증할 Gemini API Key를 입력해주세요.",
    });
    return;
  }

  // Security: Never log raw API key!
  console.log(`[Verify-Key] Server-to-server validation for key: ${maskApiKey(key)}`);

  try {
    const ai = createGeminiClient(key);

    // Make a lightweight, fast server-to-server check
    const testResult = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "ping",
      config: {
        maxOutputTokens: 3,
        thinkingConfig: { thinkingLevel: "LOW" as any },
      },
    });

    if (testResult) {
      console.log(`[Verify-Key] Key verification succeeded for: ${maskApiKey(key)}`);
      res.json({
        valid: true,
        message: "Gemini API Key가 성공적으로 승인되었습니다.",
        model: "gemini-3.8-flash",
        maskedKey: maskApiKey(key),
      });
      return;
    }

    res.status(400).json({
      valid: false,
      error: "Google API 서버로부터 유효한 응답을 받지 못했습니다.",
    });
  } catch (error: any) {
    console.warn(
      `[Verify-Key] Key verification failed for: ${maskApiKey(key)}`,
      error?.status || error?.message
    );
    const parsed = parseGeminiError(error);
    res.status(parsed.status).json({
      valid: false,
      error: parsed.message,
    });
  }
});

// 2. Generic Gemini Proxy Endpoint (/api/gemini)
// Server-to-server proxy to avoid CORS and keep keys secure
app.post("/api/gemini", async (req, res) => {
  try {
    const key = extractApiKey(req) || process.env.GEMINI_API_KEY;
    if (!key) {
      res.status(401).json({
        error: "Gemini API Key가 제공되지 않았습니다. 랜딩페이지에서 API Key를 활성화해주세요.",
      });
      return;
    }

    const { prompt, contents, model = "gemini-3.8-flash", systemInstruction } = req.body || {};
    const inputContent = contents || prompt || "Hello";

    console.log(`[Proxy-Gemini] Calling ${model} with key: ${maskApiKey(key)}`);

    const ai = createGeminiClient(key);
    const response = await ai.models.generateContent({
      model,
      contents: inputContent,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({
      text: response.text || "",
      candidates: response.candidates,
    });
  } catch (error: any) {
    const parsed = parseGeminiError(error);
    res.status(parsed.status).json({ error: parsed.message });
  }
});

// 3. Diagnosis API endpoint
app.post("/api/diagnose", async (req, res) => {
  try {
    const formData = req.body;
    if (!formData) {
      res.status(400).json({ error: "입력 데이터가 필요합니다." });
      return;
    }

    const effectiveKey = extractApiKey(req) || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      res.status(401).json({
        error:
          "Gemini API Key가 설정되어 있지 않습니다. 랜딩페이지의 'Gemini API Key 활성화' 섹션에서 본인의 API Key를 입력하고 승인받으신 후 이용해주세요.",
      });
      return;
    }

    console.log(`[Diagnose] Processing consultation with key: ${maskApiKey(effectiveKey)}`);
    const ai = createGeminiClient(effectiveKey);

    const systemInstruction = `당신은 대한민국 공무원 퇴직설계 상담을 지원하는 AI입니다.
당신의 목적은 클라이언트를 평가하거나 재무적 우열을 판단하는 것이 아니라,
퇴직 시점과 연금 개시 시점 사이의 소득 공백(소득 크레바스)을 어떻게 준비할 것인지
상담사가 클라이언트와 대화할 수 있도록 구조화하는 것입니다.

입력된 정보만을 근거로 판단하며, 입력되지 않은 사실을 임의로 만들어내지 않습니다.
정보가 부족한 경우 "정보 부족" 또는 "추가 확인 필요"로 명시합니다.

AI 안전 원칙 (반드시 준수):
1. 연금 수급 가능 여부를 확정적으로 판단하지 않는다.
2. 법률·세무·연금제도 관련 세부 내용은 공식 기관(공무원연금공단 등) 확인이 필요하다고 안내한다.
3. 특정 금융상품이나 특정 회사를 추천하지 않는다.
4. 투자수익률을 가정하여 확정적인 미래자산을 제시하지 않는다.
5. 재취업 가능성을 단정하지 않는다.
6. 건강상태를 의학적으로 판단하지 않는다.
7. 입력되지 않은 자산·소득·연금액을 추정하지 않는다.
8. 점수는 평가가 아니라 상담을 위한 출발점임을 명시한다.
9. 불안을 과도하게 자극하는 표현을 사용하지 않는다.
10. 내담자가 준비하지 못한 부분보다 앞으로 선택할 수 있는 행동에 초점을 맞춘다.
11. 용어 원칙 (필수 준수): 공무원 대상 컨설팅이므로 '은퇴'라는 단어는 일절 사용하지 말고, 모든 문맥에서 반드시 '퇴직'으로만 표현한다. (예: 은퇴설계 -> 퇴직설계, 은퇴 후 -> 퇴직 후, 완전 은퇴 -> 완전 퇴직) 또한 대상자를 칭할 때는 '상담 대상자' 대신 '내담자'로 표현한다.

진단 분석 가이드:
1. 소득 크레바스 분석:
 - 소득 공백기간: 퇴직 시점과 연금 개시 예정 시점이 모두 명확한 경우 개월 수 계산(예: "예상 소득 크레바스: 약 36개월"). 날짜나 연령이 불명확하거나 누락된 경우 임의 계산 금지, "정확한 기간 산출을 위해 연금 개시 시점 확인 필요" 등으로 표기.
 - 소득 공백 구조: 연금 개시 시점, 현재 자산, 퇴직금, 예상 생활비, 부채, 가족부담, 배우자 소득, 재취업 가능성, 기타 소득원을 종합 고려(자산 규모만으로 평가 금지).
 - 크레바스 유형: 내담자의 개별적 상황에 맞추어 적절한 명칭을 직접 생성(예: 단기완충형, 장기대응형, 재취업연계형, 현금흐름조정형, 가족부담동반형, 준비탐색형, 고위험미준비형 등).

2. 상황 요약:
 - 50~60대 내담자도 바로 납득할 수 있는 쉽고 따뜻하고 차분한 한국어 3~5문장.

3. 극복 주제 동적 선정 (5~8개):
 - 주제 풀 참고(자유롭게 조합 및 신설 가능): 퇴직 후 현금흐름 설계, 공적연금 활용전략 점검, 개인연금 및 퇴직금 활용, 재취업, 공직경력 활용, 강의·자문·프리랜서, 부업·사이드 인컴, 창업·1인사업, 자산 재배치, 지출 구조조정, 주거비 조정, 가족지원 부담 조정, 근로수명 연장, 건강관리, 퇴직 후 사회적 역할, 정체성 전환, 새로운 생활방식 설계 등.
 - 각 주제마다: 주제명, 왜 이 내담자에게 중요한지(입력 근거 제시), 현재 준비상태 및 판단근거, 실행방향 2~3개, 방치 시 리스크, 가장 먼저 해볼 작은 행동 1개.
 - 절대 특정 상품, 특정 금융사, 특정 구직처, 창업 아이템을 추천하지 말 것.

4. 준비도 점수 (readinessScore) & 시급성 점수 (urgencyScore):
 - 1~5 정수. 준비도: 1=준비없음, 2=관심·인식단계, 3=부분준비, 4=상당한준비, 5=충분한준비.
 - 시급성: 1=즉시 논의 불필요 ~ 5=우선 논의 필요.
 - 입력된 정보가 부족하여 판단이 어려운 경우 억지로 점수를 부여하지 말고 반드시 0 (판단 보류)을 반환할 것.

5. 상담 우선순위 Top 3:
 - 점수뿐 아니라 내담자의 실제 고민과 소득 크레바스에 미치는 영향을 종합하여 가장 시급한 3개 주제를 순위별로 도출하고, "왜 지금 이 주제가 중요한가" 1~2문장 기술.

6. 자각 질문 생성:
 - Top 3 주제마다 현실인식 질문, 감정·의미 질문, 행동전환 질문 각 1개 생성.
 - 규칙: 상담사가 대화에서 바로 읽어줄 수 있는 부드럽고 자연스러운 경어체 한국어 / 하나의 질문에 하나의 생각만 담기 / 평가나 추궁 금지("왜 준비 안 했습니까?" 금지) / 열린 개방형 질문.

7. 상담 진행 가이드:
 - 5~6개 단계(현재 가장 큰 불안 확인 → 소득 크레바스 구조 설명 → 우선순위 Top1 질문 → 생각·감정 탐색 → 첫 행동 합의 → 다음 상담 확인사항 설정 등).

8. 진단 신뢰도:
 - "높음", "보통", "제한적" 중 하나 선택 + 사유 1문장 + 추가 확인하면 좋은 정보 2~5개 목록 제시.`;

    const userPrompt = `다음은 공무원 내담자의 상담 입력 정보입니다. 위 지침과 안전 원칙에 따라 정밀하게 진단해주세요:

[A. 기본정보]
- 내담자: ${formData.clientName || "익명 (미입력)"}
- 성별: ${formData.gender || "미입력"}
- 현재 연령: ${formData.currentAge ? formData.currentAge + "세" : "미입력"}
- 재직 여부: ${formData.employmentStatus || "미입력"}
- 퇴직 예정일 또는 실제 퇴직일: ${formData.retirementDate || "미입력"}
- 공무원연금 예상 개시 시점: ${formData.pensionStartDate || "미입력"}
- 직급 또는 직위: ${formData.rankPosition || "미입력"}
- 직렬 또는 주요 업무분야: ${formData.jobCategory || "미입력"}
- 총 공직 경력: ${formData.serviceYears || "미입력"}

[B. 연금 정보]
- 공무원연금 예상 개시 시점: ${formData.pensionStartDate || "미입력"}
- 예상 월 연금액: ${formData.expectedMonthlyPension || "미입력"}
- 연금액 인지도: ${formData.pensionAwareness || "미입력"}
- 국민연금 또는 타 공적연금 여부: ${formData.hasNationalPension || "미입력"}
- 개인연금 보유 여부: ${formData.hasPersonalPension || "미입력"}
- 기타 정기 소득원: ${formData.otherRegularIncome || "없음 또는 미입력"}

[C. 현재 재정 상황]
- 금융자산 수준: ${formData.assetFinancial || "미입력"}
- 부동산 자산 수준: ${formData.assetRealEstate || "미입력"}
- 기타 자산 수준: ${formData.assetOther || "미입력"}
- 퇴직금/퇴직수당 예상액: ${formData.assetSeverance || "미입력"}
- 부채 형태: ${formData.debts?.length ? formData.debts.join(", ") : "부채 없음 또는 미입력"}
- 예상 월 생활비: ${formData.expectedMonthlyExpense || "미입력"}

[D. 가족·생활 정보]
- 배우자 유무 및 경제활동: ${formData.spouseStatus || "미입력"}
- 부양가족 여부: ${formData.hasDependents || "미입력"}
- 자녀 경제지원 여부: ${formData.childSupport || "미입력"}
- 부모 부양 여부: ${formData.parentSupport || "미입력"}
- 주거형태: ${formData.housingType || "미입력"}
- 가족재정 부담 부분(자유입력): ${formData.familyFinancialBurden || "없음 또는 미입력"}

[E. 퇴직 후 계획]
- 퇴직 후 계획: ${formData.retirementPlans?.length ? formData.retirementPlans.join(", ") : "계획 없음 또는 미입력"}
- 하고 싶은 일이나 생각해본 활동(자유입력): ${formData.desiredActivities || "없음 또는 미입력"}

[F. 근로 지속 가능성]
- 건강 상태 자기인식: ${formData.healthPerception || "미입력"}
- 희망 근로기간: ${formData.desiredWorkDuration || "미입력"}
- 근로 강도 선호: ${formData.workIntensityPreference || "미입력"}

[G. 내담자의 현재 고민 (상담사 기록)]
"${formData.clientConcerns || "특별히 언급된 고민 없음"}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                gapPeriod: {
                  type: Type.STRING,
                  description: "소득 공백기간 (예: 예상 소득 크레바스: 약 36개월 또는 산출 불가 사유)",
                },
                crevasseType: {
                  type: Type.STRING,
                  description: "상황 맞춤형 크레바스 유형 명칭 (예: 단기완충형, 장기대응형 등)",
                },
                mainIssue: {
                  type: Type.STRING,
                  description: "현재 핵심 과제",
                },
                majorUncertainty: {
                  type: Type.STRING,
                  description: "가장 큰 불확실성",
                },
                confidence: {
                  type: Type.STRING,
                  description: "진단 신뢰도 ('높음', '보통', '제한적' 중 하나)",
                },
                confidenceReason: {
                  type: Type.STRING,
                  description: "신뢰도 판단 사유 한 문장",
                },
              },
              required: [
                "gapPeriod",
                "crevasseType",
                "mainIssue",
                "majorUncertainty",
                "confidence",
                "confidenceReason",
              ],
            },
            situationSummary: {
              type: Type.STRING,
              description: "내담자 상황 요약 (쉬운 한국어 3~5문장)",
            },
            topics: {
              type: Type.ARRAY,
              description: "극복 주제 5~8개",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "주제명" },
                  readinessScore: {
                    type: Type.INTEGER,
                    description: "준비도 점수 1~5 정수, 판단 불가시 0",
                  },
                  urgencyScore: {
                    type: Type.INTEGER,
                    description: "시급성 점수 1~5 정수, 판단 불가시 0",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "왜 이 클라이언트에게 중요한지(입력 근거)",
                  },
                  actions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "실행방향 2~3개",
                  },
                  risk: { type: Type.STRING, description: "방치 시 리스크" },
                  firstAction: {
                    type: Type.STRING,
                    description: "가장 먼저 해볼 작은 행동 1개",
                  },
                },
                required: [
                  "name",
                  "readinessScore",
                  "urgencyScore",
                  "reason",
                  "actions",
                  "risk",
                  "firstAction",
                ],
              },
            },
            topPriorities: {
              type: Type.ARRAY,
              description: "상담 우선순위 Top 3",
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.INTEGER },
                  topic: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "선정 이유 1~2문장" },
                },
                required: ["rank", "topic", "reason"],
              },
            },
            reflectionQuestions: {
              type: Type.ARRAY,
              description: "Top 3 주제별 자각 질문 3종",
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  realityQuestion: {
                    type: Type.STRING,
                    description: "현실 인식 질문",
                  },
                  emotionQuestion: {
                    type: Type.STRING,
                    description: "감정·의미 질문",
                  },
                  actionQuestion: {
                    type: Type.STRING,
                    description: "행동 전환 질문",
                  },
                },
                required: [
                  "topic",
                  "realityQuestion",
                  "emotionQuestion",
                  "actionQuestion",
                ],
              },
            },
            counselingGuide: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "상담 진행 가이드 5~6개",
            },
            additionalInformationNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "추가 확인하면 좋은 정보 2~5개",
            },
          },
          required: [
            "summary",
            "situationSummary",
            "topics",
            "topPriorities",
            "reflectionQuestions",
            "counselingGuide",
            "additionalInformationNeeded",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI 응답 내용이 비어 있습니다.");
    }

    // 은퇴 용어를 퇴직으로 일괄 치환
    const sanitizedText = text.replace(/은퇴/g, "퇴직");
    const parsed = JSON.parse(sanitizedText);

    // Convert 0 or missing scores to null (판단 보류) as per prompt requirement
    if (parsed.topics && Array.isArray(parsed.topics)) {
      parsed.topics = parsed.topics.map((t: any) => ({
        ...t,
        readinessScore:
          t.readinessScore && t.readinessScore >= 1 && t.readinessScore <= 5
            ? t.readinessScore
            : null,
        urgencyScore:
          t.urgencyScore && t.urgencyScore >= 1 && t.urgencyScore <= 5
            ? t.urgencyScore
            : null,
      }));
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Diagnosis error:", error?.status, error?.message);
    const parsed = parseGeminiError(error);
    res.status(parsed.status).json({
      error: parsed.message,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
