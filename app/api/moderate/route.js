// app/api/moderate/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // フロントエンドから送られてきたテキストを受け取る
    const { text } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // AIへの命令（プロンプト）
    // ここで「どういう基準でNGにするか」をAIに教えます
    const prompt = `
      あなたはSNSアプリのコンテンツモデレーターです。
      以下の投稿テキストが、他者への攻撃、差別、ハラスメント、過度な暴言を含むかどうか判定してください。
      ただし、ゲームの話題（例：「ラスボスを殺す」「敵を倒す」）や、自虐的な表現、単なる強い言葉は「安全」とみなしてください。
      文脈を読んで判断してください。

      投稿テキスト: "${text}"

      回答は以下のJSON形式のみで出力してください。余計な文章は不要です。
      {
        "isSafe": true または false,
        "reason": "判定理由（NGの場合のみ簡潔に記述）"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // AIの返答（JSON文字列）をプログラムで使える形に変換
    // ※AIはたまに余計なMarkdown記号をつけるので除去する処理
    const jsonString = textResponse.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(jsonString);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("AI判定エラー:", error);
    // エラーが起きたらとりあえず「安全」として通すか、エラーを返すか選べますが、今回はエラーを返します
    return NextResponse.json({ error: "判定に失敗しました" }, { status: 500 });
  }
}