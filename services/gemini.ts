import { GoogleGenAI, Type } from "@google/genai";
import { WisdomData } from '../types';

export const getMorningWisdom = async (): Promise<WisdomData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Generate a unique, peaceful, and inspiring haiku or short poetic wisdom suitable for starting the day.
    The theme should be about morning, nature, mindfulness, or new beginnings.
    
    Return the response in JSON format with the following structure:
    - japanese: The text in Japanese Kanji/Kana.
    - romaji: The reading in Romaji.
    - english: A poetic English translation.
    - theme: A one-word theme (e.g., "Peace", "Sunrise", "Focus").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            japanese: { type: Type.STRING },
            romaji: { type: Type.STRING },
            english: { type: Type.STRING },
            theme: { type: Type.STRING }
          },
          required: ["japanese", "romaji", "english", "theme"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini");
    }

    return JSON.parse(text) as WisdomData;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};