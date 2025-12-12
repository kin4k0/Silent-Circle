import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();

    // サーバー専用の環境変数を優先して取得
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_KEY || null;

    // ログにフルキーを出さないようにマスクして表示（開発時の確認用）
    if (apiKey) {
      const masked = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
      console.log("Loaded Google Generative AI key:", masked);
    } else {
      console.error("Google Generative AI API key is missing. Set GOOGLE_GENERATIVE_AI_KEY in .env.local and restart the server.");
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // モデル名は "gemini-1.5-flash" を使います
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 追加のデバッグログ: 環境変数がプロセスで読み込まれているか
    console.log('Debug env check:', {
      GOOGLE_GENERATIVE_AI_KEY_present: !!process.env.GOOGLE_GENERATIVE_AI_KEY,
      NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_KEY_present: !!process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_KEY,
    });

    const prompt = `
      あなたはコンテンツモデレーターです。
      以下の投稿が攻撃的、差別的、またはハラスメントを含むか判定してください。
      ゲームの話題（倒す、殺すなど）は安全としてください。
      投稿: "${text}"
      回答は以下のJSON形式のみ:
      { "isSafe": boolean, "reason": "string" }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      // JSONの整形
      const jsonString = textResponse.replace(/```json|```/g, "").trim();
      const jsonResponse = JSON.parse(jsonString);

      return NextResponse.json(jsonResponse);
    } catch (ex) {
      console.error('Model generateContent error:', ex);
      // 可能ならレスポンスボディなど詳細もログ出す
      if (ex?.response) {
        try {
          const body = await ex.response.text();
          console.error('Model response body:', body);
        } catch (e) {
          console.error('Failed to read model response body:', e);
        }
      }
      throw ex;
    }

  } catch (error) {
    // ★エラーの正体をターミナルに詳しく表示する
    console.error("=============== AI ERROR LOG ===============");
    console.error("エラー:", error);
    console.error("メッセージ:", error.message);
    if (error.status) console.error("ステータス:", error.status);
    console.error("============================================");
    
    return NextResponse.json(
      { 
        error: "判定失敗",
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}