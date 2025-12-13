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

interface GetNewsOptions {
  fastMode?: boolean;
}

export const getLatestNews = async (
  targetCategories: NewsCategory[] = Object.values(NewsCategory),
  options?: GetNewsOptions
): Promise<NewsData> => {
  const { fastMode = false } = options || {};
  const ai = getClient();
  const timestamp = new Date();

  // Initialize empty structure
  const items: Record<NewsCategory, NewsItem[]> = Object.values(NewsCategory).reduce((acc, cat) => {
    acc[cat] = [];
    return acc;
  }, {} as Record<NewsCategory, NewsItem[]>);

  try {
    // ---------------------------------------------------------
    // STRATEGY A: FAST MODE (Text Parsing)
    // Avoids JSON generation overhead for speed.
    // ---------------------------------------------------------
    if (fastMode && targetCategories.length === 1) {
      const targetCategory = targetCategories[0];
      const categoryLabel = CATEGORY_MAP[targetCategory].label;
      
      const prompt = `
        日本国内の最新の「${categoryLabel}」に関するニュースをGoogle検索し、トップニュースを5件抽出してください。
        
        【重要：出力形式】
        JSONは使用しないでください。
        各ニュースを1行ずつ、以下の形式（パイプ区切り）で出力してください。
        
        記事タイトル||記事の要約（30文字以内）
        記事タイトル||記事の要約（30文字以内）
        記事タイトル||記事の要約（30文字以内）
        記事タイトル||記事の要約（30文字以内）
        記事タイトル||記事の要約（30文字以内）

        ※余計な挨拶やMarkdownの装飾は一切不要です。
        ※**タイトルと要約は必ず日本語で記述してください。**
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const lines = text.split('\n').filter(line => line.includes('||'));
      
      const parsedItems: NewsItem[] = lines.map(line => {
        // Handle numbering (1., 1), -) and Markdown bolding
        let cleanLine = line.replace(/^[\d\-\*\.\)]+\s*/, '').trim(); 
        cleanLine = cleanLine.replace(/\*\*/g, ''); // Remove bold markdown
        
        const [title, summary] = cleanLine.split('||');
        return {
          title: title?.trim() || "ニュース取得エラー",
          summary: summary?.trim() || "詳細を取得できませんでした。"
        };
      }).slice(0, 5);

      items[targetCategory] = parsedItems;

      // Extract sources
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: NewsSource[] = chunks
        .filter((c: any) => c.web?.uri && c.web?.title)
        .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

      return {
        items,
        sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()),
        timestamp
      };
    }

    // ---------------------------------------------------------
    // STRATEGY B: STANDARD MODE (JSON Parsing)
    // Used for multiple categories or background fetch.
    // ---------------------------------------------------------
    
    // Build the dynamic part of the prompt based on requested categories
    const categoriesPrompt = targetCategories.map((cat, index) => `${index + 1}. ${CATEGORY_MAP[cat].label}`).join('\n');
    
    const jsonExample = targetCategories.reduce((acc, cat) => {
      acc[CATEGORY_MAP[cat].key] = [ { "title": "見出し", "summary": "要約" } ];
      return acc;
    }, {} as any);

    const jsonExampleString = JSON.stringify(jsonExample, null, 2);

    const prompt = `
      日本国内の最新ニュースをGoogle検索してください。
      以下のカテゴリに分類し、各カテゴリ5件ずつ選定してください。
      中国に関連するニュースは除外してください。
      **出力するタイトルと要約は、必ず日本語で記述してください。**

      対象カテゴリ:
      ${categoriesPrompt}
      
      出力は以下のJSON形式のみにしてください。Markdownコードブロックは不要です。
      ${jsonExampleString}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let text = response.text || "{}";
    
    // Robust JSON Extraction
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        text = text.substring(firstOpen, lastClose + 1);
    } else {
        text = "{}";
    }

    let json: any = {};
    try {
        json = JSON.parse(text);
        if (Array.isArray(json)) json = json[0] || {};
    } catch (e) {
        console.warn("JSON Parse Failed, using empty data");
    }

    const findKey = (obj: any, key: string) => {
        if (!obj) return [];
        const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : [];
    };

    targetCategories.forEach(cat => {
      items[cat] = findKey(json, CATEGORY_MAP[cat].key) || [];
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: NewsSource[] = chunks
      .filter((c: any) => c.web?.uri && c.web?.title)
      .map((c: any) => ({ title: c.web.title, uri: c.web.uri }));

    return {
      items,
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()),
      timestamp
    };

  } catch (error) {
    console.error("News Fetch Error:", error);
    return {
      items,
      sources: [],
      timestamp
    };
  }
};