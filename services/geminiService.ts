
import { GoogleGenAI, Type } from "@google/genai";
import { MOCK_APPS } from "../constants";
import { ConciergeResponse, NewsData, NewsSource, NewsCategory, NewsItem } from "../types";

const getClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getGeminiRecommendation = async (userQuery: string): Promise<ConciergeResponse> => {
  try {
    const ai = getClient();
    
    // Create a simplified list of apps for the prompt to save tokens and reduce noise
    const appListString = MOCK_APPS.map(app => 
      `ID: ${app.id}, Name: ${app.name}, Description: ${app.description}, Tags: ${app.tags.join(', ')}`
    ).join('\n');

    const systemInstruction = `
      あなたは「AI-Bank」というAIアプリ紹介サイトのコンシェルジュです。
      ユーザーの悩みや要望に基づいて、以下のリストから最も適切なアプリを1つだけ推薦してください。
      もし適切なアプリがない場合は、無理に推薦せず、その旨を伝えてください。
      
      アプリリスト:
      ${appListString}
      
      レスポンスはJSON形式で返してください。
      recommendedAppId: 推奨するアプリのID（見つからない場合はnull）
      message: ユーザーへの回答（推奨理由や、アプリの使い方の提案など。親しみやすく丁寧な日本語で。）
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedAppId: { type: Type.STRING, nullable: true },
            message: { type: Type.STRING },
          },
          required: ["message"],
        }
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text) as ConciergeResponse;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      recommendedAppId: null,
      message: "申し訳ありません。現在AIコンシェルジュが混み合っており、応答できませんでした。",
    };
  }
};

// Mapping for category keys used in JSON and prompts
const CATEGORY_MAP: Record<NewsCategory, { key: string; label: string }> = {
  [NewsCategory.ECONOMY]: { key: 'economy', label: 'economy (経済)' },
  [NewsCategory.ENTERTAINMENT]: { key: 'entertainment', label: 'entertainment (エンタメ)' },
  [NewsCategory.SPORTS]: { key: 'sports', label: 'sports (スポーツ)' },
  [NewsCategory.INTERNATIONAL]: { key: 'international', label: 'international (国際)' },
  [NewsCategory.SCIENCE]: { key: 'science', label: 'science (科学)' },
};

export const getLatestNews = async (targetCategories: NewsCategory[] = Object.values(NewsCategory)): Promise<NewsData> => {
  try {
    const ai = getClient();
    
    // Build the dynamic part of the prompt based on requested categories
    const categoriesPrompt = targetCategories.map((cat, index) => `${index + 1}. ${CATEGORY_MAP[cat].label}`).join('\n');
    
    const jsonExample = targetCategories.reduce((acc, cat) => {
      acc[CATEGORY_MAP[cat].key] = [ { "title": "見出し", "summary": "要約" } ];
      return acc;
    }, {} as any);

    const jsonExampleString = JSON.stringify(jsonExample, null, 2);

    // Prompt carefully constructed to force JSON output after using the search tool.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        日本国内の最新ニュースをGoogle検索し、以下のカテゴリに分類してください。

        【重要：除外ルール】
        中国に関連するニュースは検索結果および選定リストから完全に除外してください。

        対象カテゴリ:
        ${categoriesPrompt}

        各カテゴリについて、重要度が高いニュースを5件ずつ選定してください。
        
        【出力形式の絶対ルール】
        検索結果をまとめた後、**最終的な出力は以下のJSON形式のみ**にしてください。
        Markdownのコードブロック(\`\`\`json)や、挨拶文、説明文は一切含めないでください。
        
        期待するJSON構造:
        ${jsonExampleString}
      `,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "{}";
    
    // Robust JSON Extraction: Find the substring between the first '{' and last '}'
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        text = text.substring(firstOpen, lastClose + 1);
    } else {
        // If no braces found, default to empty object
        text = "{}";
    }

    let json: any = {};
    try {
        json = JSON.parse(text);
        // Handle case where model returns an array wrapped object
        if (Array.isArray(json)) {
            json = json[0] || {};
        }
    } catch (e) {
        console.warn("JSON Parse Failed, using empty data:", e);
        json = {};
    }

    // Helper to find key case-insensitively
    const findKey = (obj: any, key: string) => {
        if (!obj) return [];
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : [];
    };

    // Initialize items with empty arrays for ALL categories (to satisfy type), 
    // then fill in the ones we fetched.
    const items: Record<NewsCategory, NewsItem[]> = Object.values(NewsCategory).reduce((acc, cat) => {
      acc[cat] = [];
      return acc;
    }, {} as Record<NewsCategory, NewsItem[]>);

    // Populate fetched data
    targetCategories.forEach(cat => {
      items[cat] = findKey(json, CATEGORY_MAP[cat].key) || [];
    });

    // Extract grounding chunks for source links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: NewsSource[] = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri
      }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      items,
      sources: uniqueSources,
      timestamp: new Date()
    };

  } catch (error) {
    console.error("News Fetch Error:", error);
    // Return empty structure on error so the UI doesn't crash
    const emptyItems = Object.values(NewsCategory).reduce((acc, cat) => {
      acc[cat] = [];
      return acc;
    }, {} as Record<NewsCategory, NewsItem[]>);

    return {
      items: emptyItems,
      sources: [],
      timestamp: new Date()
    };
  }
};
