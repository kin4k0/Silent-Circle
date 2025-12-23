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
      あなたは非常に寛容なSNSモデレーターです。投稿内容が「明らかな個人への攻撃・暴言・差別」にあたるか判定してください。

      【判定ルール】
      - 挨拶（こんにちわ等）、意気込み（がんばる等）、日常報告（就活、終活等）はすべて「isSafe: true」です。
      - ゲーム用語、比喩表現、独り言もすべて「isSafe: true」です。
      - 迷った場合は必ず「isSafe: true」と答えてください。
      - 明確な悪意がある攻撃のみ「isSafe: false」にします。

      投稿: "${text}"

      必ず以下のJSON形式でのみ回答してください。余計な文章は一切不要です。
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