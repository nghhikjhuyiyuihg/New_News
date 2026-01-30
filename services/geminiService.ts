
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getApiKey = () => {
  return process.env.API_KEY || (window as any).process?.env?.API_KEY || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function generateNewsSummary(content: string): Promise<string> {
  if (!getApiKey()) return "מפתח API חסר. לא ניתן לייצר תקציר.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `אנא כתוב כותרת משנה קצרה ומושכת (עד 20 מילים) למאמר החדשות הבא: ${content}`,
      config: {
        systemInstruction: "אתה עורך חדשות בכיר ומקצועי. עליך להחזיר אך ורק את כותרת המשנה עצמה. חל איסור מוחלט לכלול משפטי פתיחה, הקדמות, הסברים או מלל נוסף מכל סוג שהוא. התוצאה צריכה להיות בעברית תקנית ומושכת.",
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function suggestArticleTitle(content: string): Promise<string> {
  if (!getApiKey()) return "כותרת (חסר API Key)";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `הצע כותרת ראשית חזקה ומעניינת למאמר הבא: ${content}`,
      config: {
        systemInstruction: "אתה כותב כותרות מבריק. עליך להחזיר אך ורק את הכותרת עצמה. אל תכתוב הקדמות. רק את הכותרת.",
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
}

export async function generateFullArticleContent(title: string): Promise<string> {
  if (!getApiKey()) return "לא ניתן לייצר תוכן ללא מפתח API של Gemini.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `כתוב כתבת חדשות מלאה, מעניינת ומקצועית המבוססת על הכותרת הבאה: "${title}".`,
      config: {
        systemInstruction: "אתה עיתונאי בכיר באתר חדשות מוביל. כתוב בסגנון חדשותי, אובייקטיבי ומרתק בעברית. עליך להחזיר אך ורק את גוף הכתבה עצמה.",
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Article Generation Error:", error);
    return "נכשלה יצירת התוכן. נסה שוב.";
  }
}

export async function generateAiImage(prompt: string): Promise<string | null> {
  if (!getApiKey()) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A professional news photograph of: ${prompt}. Realistic, high quality, detailed, news agency style. ABSOLUTELY NO TEXT.` }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
}

export async function textToSpeech(text: string): Promise<string | null> {
  if (!getApiKey()) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `הקרא בצורה חדשותית וברורה את הכתבה הבאה: ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}
