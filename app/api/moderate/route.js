import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text } = await request.json();

    // サーバー専用の環境変数を優先して取得
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || null;

    // ログにフルキーを出さないようにマスクして表示（開発時の確認用）
    if (apiKey) {
      const masked = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
      console.log("Loaded Gemini API key:", masked);
    } else {
      console.error("Gemini API key is missing. Set GEMINI_API_KEY in .env.local and restart the server.");
      return NextResponse.json({ error: "APIキーが設定されていません" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 追加のデバッグログ: 環境変数がプロセスで読み込まれているか
    console.log('Debug env check:', {
      GEMINI_API_KEY_present: !!process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_GEMINI_API_KEY_present: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });

    // 優先モデルリスト（環境変数で上書き可能）
    let candidateModels = (process.env.GENERATIVE_MODEL_CANDIDATES || 'gemini-1.5,gemini-1.5-pro,gpt-4o-mini,gpt-4o,gpt-3.5-mini').split(',');

    // 試行前に利用可能モデルを問い合わせ（可能なら client API → REST フォールバック）して、動的候補を先頭に追加
    try {
      if (typeof genAI.listModels === 'function') {
        const modelsList = await genAI.listModels();
        console.log('listModels result (client):', modelsList);
        const detected = (modelsList || []).map(m => m?.name || m?.model || m?.id || m?.modelId).filter(Boolean);
        candidateModels = [...new Set([...detected, ...candidateModels])];
      } else {
        console.log('genAI.listModels not available on this client; trying REST endpoint');
      }
    } catch (e) {
      console.warn('listModels (client) failed:', e?.message || e);
    }

    // REST API でモデル一覧を直接問い合わせ（APIキー方式）して候補を拡張
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      const listResp = await fetch(listUrl);
      if (listResp.ok) {
        const body = await listResp.json();
        console.log('listModels result (REST):', body);
        const restModels = (body?.models || []).map(m => m.name).filter(Boolean);
        // 例: models/text-bison-001 -> 追加形式: 'models/text-bison-001' と 'text-bison-001' と 'text-bison'
        const normalized = [];
        for (const nm of restModels) {
          normalized.push(nm);
          const short = nm.replace(/^models\//, '');
          normalized.push(short);
          const base = short.split('-').slice(0, 2).join('-');
          normalized.push(base);
        }
        candidateModels = [...new Set([...normalized, ...candidateModels])];
      } else {
        console.warn('REST list models failed:', listResp.status, await listResp.text());
      }
    } catch (e) {
      console.warn('REST listModels failed:', e?.message || e);
    }

    const prompt = `
      あなたはコンテンツモデレーターです。
      以下の投稿が攻撃的、差別的、またはハラスメントを含むか判定してください。
      ゲームの話題（倒す、殺すなど）は安全としてください。
      投稿: "${text}"
      回答は以下のJSON形式のみ（必ず厳密にこの形式で返してください）:
      { "isSafe": boolean, "reason": "string", "matchedWords": ["string", ...] }

      - "isSafe" は投稿が安全なら true、問題があれば false。
      - "reason" は判定の簡潔な理由。
      - "matchedWords" は問題と判断した語句の配列（該当なしなら空配列）
    `;

    // モデル候補を順に試すユーティリティ
    async function tryModels(models, prompt) {
      let lastError = null;
      for (const modelName of models) {
        try {
          console.log('Trying model:', modelName);
          const model = genAI.getGenerativeModel({ model: modelName.trim() });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const textResponse = response.text();
          return { modelName, textResponse };
        } catch (err) {
          console.warn(`Model ${modelName} failed:`, err?.message || err);
          lastError = err;
          // 続けて別モデルを試す
        }
      }
      throw lastError || new Error('No available models');
    }

    try {
      const { modelName, textResponse } = await tryModels(candidateModels, prompt);
      console.log('Model succeeded:', modelName);

      // JSONの整形
      const jsonString = textResponse.replace(/```json|```/g, "").trim();
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(jsonString);
      } catch (e) {
        console.error('JSONパース失敗。生レスポンス:', textResponse);
        throw new Error('AIの応答の解析に失敗しました');
      }

      // フォールバック: フィールドを確保
      jsonResponse.isSafe = typeof jsonResponse.isSafe === 'boolean' ? jsonResponse.isSafe : false;
      jsonResponse.reason = jsonResponse.reason || '';
      jsonResponse.matchedWords = Array.isArray(jsonResponse.matchedWords) ? jsonResponse.matchedWords : [];

      return NextResponse.json({ ...jsonResponse, usedModel: modelName });
    } catch (ex) {
      console.error('Model generateContent error:', ex);
      if (ex?.response) {
        try {
          const body = await ex.response.text();
          console.error('Model response body:', body);
        } catch (e) {
          console.error('Failed to read model response body:', e);
        }
      }
      return NextResponse.json({ error: '判定失敗', details: ex?.message || String(ex) }, { status: 500 });
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