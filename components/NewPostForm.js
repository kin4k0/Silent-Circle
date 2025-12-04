import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_LENGTH = 300;

  // ※手動のNG_WORDSリストはもう使いません

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true); // ボタンを連打できないように早めにロック

    try {
      // 1. AIサーバーに問い合わせる
      console.log("AIによるチェック中...");
      
      const response = await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error("AIチェックサーバーのエラー");
      }

      const result = await response.json();
      console.log("AI判定結果:", result);

      // 2. NG判定ならアラートを出して終了
      if (result.isSafe === false) {
        alert(`投稿できません。\n理由: ${result.reason}`);
        setIsSubmitting(false); // ロック解除
        return;
      }

      // 3. 安全ならFirebaseに保存
      await addDoc(collection(db, "posts"), {
        text: text,
        claps: 0,
        createdAt: serverTimestamp(),
        uid: auth.currentUser ? auth.currentUser.uid : null, 
      });

      setText('');
      onBackClick();

    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            placeholder="宣言しよう！（300文字以内）"
            maxLength={MAX_LENGTH}
          />
          
          <div className={styles.charCount}>
            <span style={{ color: text.length >= MAX_LENGTH ? 'red' : 'inherit' }}>
              {text.length}
            </span>
             / {MAX_LENGTH}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!text.trim() || isSubmitting} 
          >
            {/* AIチェック中は時間がかかるので表示を変える */}
            {isSubmitting ? 'AIチェック中...' : '宣言する'}
          </button>
        </form>
      </main>
    </div>
  );
}