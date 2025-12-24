import React, { useState, useEffect } from 'react'; //  useEffectを追加
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { onAuthStateChanged } from 'firebase/auth'; // onAuthStateChangedを追加
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false); //  認証状態の管理を追加
  const MAX_LENGTH = 300;


  // 認証状態の監視と設定
  // 匿名ログインが完了するのを待機する
  useEffect(() => {
    // onAuthStateChangedは、ログイン/ログアウトの状態変化を監視するFirebaseの機能
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // userがnullでなければ(匿名ログインが成功していれば) trueにする
      setIsAuthReady(!!user);
    });

    return () => unsubscribe(); // クリーンアップ（コンポーネントが閉じるときに監視を停止）
  }, []); // []で初回レンダリング時のみ実行

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 認証が完了していない場合は、処理を停止
    if (!text.trim() || isSubmitting || !isAuthReady) return;

    try {
      // 1. AIサーバーに問い合わせる (省略不可。安全でない投稿を防ぐため)
      console.log("AIによるチェック中...");
      setIsSubmitting(true);
      
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      // サーバーからのエラー詳細を読み取る
      if (!response.ok) {
        let errBody = null;
        try {
          errBody = await response.json();
        } catch (e) {
          console.error('レスポンスのJSONパースに失敗:', e);
        }
        console.error('AIチェックサーバー エラー:', response.status, errBody);
        throw new Error(errBody?.details || errBody?.error || `AIチェックサーバーエラー(${response.status})`);
      }

      const result = await response.json();
      console.log("AI判定結果:", result);

      // 2. NG判定ならアラートを出して終了
      if (result.isSafe === false) {
        const details = result.matchedWords && result.matchedWords.length > 0 ? `\n検出された語: ${result.matchedWords.join('、')}` : '';
        alert(`投稿できません。\n理由: ${result.reason || '不明な理由'}${details}`);
        setIsSubmitting(false);
        return;
      }

      // 3. 安全ならFirebaseに保存 (この処理は認証済みでないと403エラーになる)
      await addDoc(collection(db, "posts"), {
        text: text,
        claps: 0,
        createdAt: serverTimestamp(),
        // ログインは完了しているはずなので、uidを取得
        uid: auth.currentUser ? auth.currentUser.uid : null, 
      });

      setText('');
      onBackClick();

    } catch (error) {
      console.error("送信エラー:", error);
      // エラーの詳細を表示
      if (error.code) {
        console.error("エラーコード:", error.code);
        console.error("エラーメッセージ:", error.message);
      }
      alert("送信に失敗しました。\n詳細はコンソールをご確認ください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  // フォームの描画部分
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBackClick}>
          <span>&#x2190;</span>
        </button>
      </header>

      <main className={styles.formWrapper}>
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="宣言しよう！"
            // ★追加: 300文字以上入力できないようにする
            maxLength={MAX_LENGTH}
          />
          
          {/* ★追加: 文字数カウント表示 */}
          <div className={styles.charCount}>
            <span style={{ color: text.length >= MAX_LENGTH ? 'red' : 'inherit' }}>
              {text.length}
            </span>
              / {MAX_LENGTH}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            //  認証が完了するまでボタンを無効化する条件を追加！
            disabled={!text.trim() || isSubmitting || !isAuthReady} 
          >
            {isAuthReady 
              ? (isSubmitting ? 'AIチェック中...' : '宣言する')
              : '認証処理中...'} 
          </button>
        </form>
      </main>
    </div>
  );
}