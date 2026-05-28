
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CVAnalysisResult, JobComparisonResult, SalaryAdvice } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCV = async (cvText: string): Promise<CVAnalysisResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sen çift kişilikli bir kariyer koçusun. CV'yi analiz et.
    Özellikle 'actionCards' alanında 3 kart döndür: 
    1. 'fix' (Acil düzeltme - Kırmızı), 
    2. 'improve' (Geliştirme - Sarı), 
    3. 'great' (İyi özellik - Yeşil).
    Radar Data: Teknik, İletişim, Liderlik, Adaptasyon, Analitik kategorilerinde (0-100).
    CV METNİ: ${cvText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          roast: { type: Type.STRING },
          mentorAdvice: { type: Type.STRING },
          atsScore: { type: Type.NUMBER },
          radarData: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                current: { type: Type.NUMBER },
                target: { type: Type.NUMBER }
              },
              required: ["subject", "current", "target"]
            }
          },
          actionCards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                message: { type: Type.STRING }
              },
              required: ["type", "title", "message"]
            }
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                level: { type: Type.NUMBER }
              },
              required: ["name", "level"]
            }
          },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          educationRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                platform: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "platform", "url"]
            }
          },
          sideHustleIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
          sentimentScore: { type: Type.STRING }
        },
        required: ["roast", "mentorAdvice", "atsScore", "radarData", "skills", "missingSkills", "educationRecommendations", "sideHustleIdeas", "sentimentScore", "actionCards"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const compareWithJob = async (cvText: string, jobDescription: string): Promise<JobComparisonResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `CV ve İş İlanını kıyasla. 
    İş ilanındaki 'Red Flag'leri tespit et.
    'roadmap' alanında 4-5 adımlık, gerçekçi bir metro hattı gibi sıralı yol haritası oluştur.
    CV: ${cvText}
    İŞ İLANI: ${jobDescription}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchRate: { type: Type.NUMBER },
          gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
          redFlags: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING }
              },
              required: ["type", "title", "description", "severity"]
            }
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["title", "description", "type"]
            }
          },
          actionPlan: { type: Type.STRING }
        },
        required: ["matchRate", "gaps", "roadmap", "actionPlan", "redFlags"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const getSalaryAdvice = async (role: string, location: string): Promise<SalaryAdvice> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Türkiye pazarı için ${role} pozisyonuna (${location}) yönelik maaş tavsiyesi ve pazarlık senaryoları üret.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          range: { type: Type.STRING },
          marketContext: { type: Type.STRING },
          scripts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["title", "text"]
            }
          }
        },
        required: ["range", "marketContext", "scripts"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateLinkedInPost = async (cvData: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Aşağıdaki CV verilerinden viral olabilecek, samimi ve teknik bir LinkedIn postu yaz. Emojiler kullan. CV: ${cvData}`,
  });
  return response.text;
};

export const generatePortfolioCode = async (cvData: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bu CV'deki bilgilerle tek dosyadan oluşan (inline CSS/JS), Tailwind CDN kullanan, modern, dark-mode bir portfolyo web sitesi HTML kodu yaz. Sadece kodu ver. CV: ${cvData}`,
  });
  return response.text;
};

export const speakInterviewQuestion = async (mode: 'mentor' | 'roast') => {
  const prompt = mode === 'roast' 
    ? "Bana mülakatta sorulacak en zor, agresif bir stres mülakatı sorusu sor. Kısa olsun."
    : "Bana mülakatta sorulacak yapıcı bir soru sor. Kısa olsun.";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: mode === 'roast' ? 'Puck' : 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};
