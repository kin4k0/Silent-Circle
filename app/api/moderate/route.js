import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 安全性フィルターを「最も緩い」設定にする（誤判定防止）
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings 
    });

    // AIへの命令文（プロンプト）を改良
    const prompt = `
  あなたはSNSの単純なフィルターです。

  【ルール】
  1. 投稿内容に「死ね」「殺す」「バカ」「デブ」などの、具体的な個人への直接的な「罵詈雑言」が含まれている場合のみ { "isSafe": false } としてください。
  2. それ以外の「挨拶」「がんばる」「就活」「悩み」「ゲームの感想」などは、たとえ死や暴力に関する言葉が混ざっていても、すべて「isSafe: true」としてください。
  3. 判定に迷う場合は、100%「isSafe: true」にしてください。深読みは厳禁です。

  投稿内容: "${text}"

  回答は以下のJSON形式のみで返してください：
  { "isSafe": boolean, "reason": "理由", "matchedWords": [] }
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // JSONを抽出
    const jsonString = textResponse.replace(/```json|```/g, "").trim();
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonString);
    } catch (e) {
      // AIがJSON形式で返さなかった場合の救済措置
      console.error('JSON Parse Error:', textResponse);
      const isActuallySafe = !textResponse.includes("false"); 
      jsonResponse = { isSafe: isActuallySafe, reason: "判定を補正しました", matchedWords: [] };
    }

    // 最終的な安全確認（AIが安全と言っているのにfalseにならないようチェック）
    if (jsonResponse.reason.includes("安全") || jsonResponse.reason.includes("問題ありません")) {
      jsonResponse.isSafe = true;
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("AI ERROR:", error);
    return NextResponse.json({ error: "判定失敗", details: error.message }, { status: 500 });
  }
}