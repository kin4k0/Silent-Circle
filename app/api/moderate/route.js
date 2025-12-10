import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();

    // 環境変数からAPIキーを取得
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_KEY || "AIzaSyA84RIYR5UJAkAGoZvSWuPJm96SwMevrms";

    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // モデル名は "gemini-1.5-flash" を使います
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      あなたはコンテンツモデレーターです。
      以下の投稿が攻撃的、差別的、またはハラスメントを含むか判定してください。
      ゲームの話題（倒す、殺すなど）は安全としてください。
      投稿: "${text}"
      回答は以下のJSON形式のみ:
      { "isSafe": boolean, "reason": "string" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // JSONの整形
    const jsonString = textResponse.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(jsonString);

    return NextResponse.json(jsonResponse);

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