import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const base64Data = image.split(',')[1] || image;
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0] || 'image/jpeg';

      const systemInstruction = `너는 전문 퍼스널컬러 컨설턴트이자 이미지 분석 전문가야.
사용자가 업로드한 얼굴 사진을 바탕으로 퍼스널컬러를 분석해줘. 단, 사진의 조명, 화장, 필터, 카메라 색감에 따라 결과가 달라질 수 있으므로 최종 진단이 아니라 참고용 분석으로 안내해줘.

분석 항목:
1. 피부 톤 (밝기, 온도감, 맑기)
2. 전체 인상 (명도, 채도, 대비감, 이미지 느낌)
3. 웜/쿨/중립 판단
4. 4계절 타입 및 세부 타입 추천
5. 추천 컬러 8개 & 피해야 할 컬러 5개
6. 메이크업, 헤어, 패션 추천
7. 친절하고 자연스러운 설명 (단정적이지 않은 표현 사용)

반드시 요청된 JSON 형식으로만 답변해.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          disclaimer: { type: Type.STRING },
          summary: { type: Type.STRING },
          tone_direction: { type: Type.STRING },
          season_type: { type: Type.STRING },
          sub_type: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          analysis: {
            type: Type.OBJECT,
            properties: {
              skin_tone: { type: Type.STRING },
              brightness: { type: Type.STRING },
              saturation: { type: Type.STRING },
              contrast: { type: Type.STRING },
              overall_impression: { type: Type.STRING }
            }
          },
          recommended_colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          avoid_colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                hex: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            }
          },
          makeup_recommendations: {
            type: Type.OBJECT,
            properties: {
              lip: { type: Type.ARRAY, items: { type: Type.STRING } },
              blush: { type: Type.ARRAY, items: { type: Type.STRING } },
              eyeshadow: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          hair_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          fashion_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          style_tip: { type: Type.STRING },
          photo_quality_note: { type: Type.STRING }
        }
      };

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "사용자의 얼굴을 분석하여 퍼스널 컬러 진단 결과를 JSON으로 제공해줘." },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema
        }
      });

      const analysisResult = JSON.parse(result.text || "{}");
      res.json(analysisResult);
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "분석 중 오류가 발생했습니다." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
