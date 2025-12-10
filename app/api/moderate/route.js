import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();

    // ★重要: ここに、さっき取得した「AI Studio」のキーを貼り付けてください
    const apiKey = "AIzaSyA84RIYR5UJAkAGoZvSWuPJm96SwMevrms"; 

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
    console.error(error);
    console.error("============================================");
    
    return NextResponse.json({ error: "判定失敗" }, { status: 500 });
  }
}