// 必要なFirebaseの機能をインポート
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAuth, signInAnonymously } from "firebase/auth";
// .env.local に保存した鍵をここで読み込む
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebaseアプリを初期化（重複起動を防ぐ処理付き）
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// データベースと認証機能を使えるように準備
const db = getFirestore(app);
export const auth = getAuth(app);
const auth = getAuth(app);

// 他のファイルから「db」や「auth」を使えるようにエクスポート
export { db, auth };
signInAnonymously(auth).catch((error) => {
  console.error("匿名ログインエラー:", error);
});