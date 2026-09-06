import { GoogleGenAI } from "@google/genai";

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: any;
}

interface ApiResponse {
  setHeader(name: string, value: string): this;
  status(code: number): this;
  json(data: any): this;
  end(): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-api-key"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawAuth = req.headers.authorization;
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    let key = "";
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      key = authHeader.slice(7).trim();
    } else if (typeof req.body?.apiKey === "string") {
      key = req.body.apiKey.trim();
    } else if (typeof req.headers["x-goog-api-key"] === "string") {
      key = (req.headers["x-goog-api-key"] as string).trim();
    }

    if (!key) {
      return res.status(400).json({
        valid: false,
        error: "검증할 Gemini API Key를 입력해주세요.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const testResult = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "ping",
      config: {
        maxOutputTokens: 3,
        thinkingConfig: { thinkingLevel: "LOW" as any },
      },
    });

    if (testResult) {
      const masked = key.length > 8 ? `${key.slice(0, 4)}...${key.slice(-4)}` : "***";
      return res.status(200).json({
        valid: true,
        message: "Gemini API Key가 성공적으로 승인되었습니다.",
        model: "gemini-3.8-flash",
        maskedKey: masked,
      });
    }

    return res.status(400).json({
      valid: false,
      error: "Google API 서버로부터 유효한 응답을 받지 못했습니다.",
    });
  } catch (error: any) {
    const rawMsg = String(error?.message || "");
    const status = Number(error?.status || error?.code || 500);

    let message = "Google Gemini API 통신 중 오류가 발생했습니다. 키 상태를 확인해주세요.";
    if (status === 400 || rawMsg.includes("API_KEY_INVALID") || rawMsg.includes("INVALID_ARGUMENT")) {
      message = "제공해주신 Gemini API Key가 유효하지 않습니다. Google AI Studio에서 키를 다시 확인해주세요.";
    } else if (status === 403 || rawMsg.includes("PERMISSION_DENIED")) {
      message = "해당 Gemini API Key의 접근 권한이 없거나 사용이 제한되었습니다.";
    } else if (status === 429 || rawMsg.includes("RESOURCE_EXHAUSTED")) {
      message = "API 요청 할당량(Quota)을 초과했습니다. 잠시 후 다시 시도하거나 다른 API Key를 사용해주세요.";
    }

    return res.status(status >= 400 && status < 600 ? status : 400).json({
      valid: false,
      error: message,
    });
  }
}
