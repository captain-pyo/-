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

    const effectiveKey = key || process.env.GEMINI_API_KEY;
    if (!effectiveKey) {
      return res.status(401).json({
        error: "Gemini API Key가 제공되지 않았습니다.",
      });
    }

    const { prompt, contents, model = "gemini-3.8-flash", systemInstruction } = req.body || {};
    const inputContent = contents || prompt || "Hello";

    const ai = new GoogleGenAI({
      apiKey: effectiveKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model,
      contents: inputContent,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    return res.status(200).json({
      text: response.text || "",
      candidates: response.candidates,
    });
  } catch (error: any) {
    const status = Number(error?.status || error?.code || 500);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: error?.message || "Gemini API 호출 중 오류가 발생했습니다.",
    });
  }
}
