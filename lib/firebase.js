import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ↓ 認証機能を追加
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// アプリの初期化（重複防止）
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
// ↓ 認証機能を有効化
const auth = getAuth(app);

// ↓ アプリ起動時に自動で「匿名ログイン」する処理
if (typeof window !== "undefined") {
  signInAnonymously(auth).catch((error) => {
    console.error("匿名ログインエラー:", error);
  });
}

// db と auth を両方エクスポートする
export { db, auth };