import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 文字数制限
  const MAX_LENGTH = 300;

  // 禁止用語リスト
  const NG_WORDS = ['死ね', '殺す', '馬鹿', 'ばか', 'バカ', 'あほ', 'うんこ'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    if (isSubmitting) return;

    // 禁止用語チェック
    const foundNgWord = NG_WORDS.find(word => text.includes(word));
    if (foundNgWord) {
      alert(`不適切な言葉が含まれています: 「${foundNgWord}」`);
      return; 
    }

    try {
      setIsSubmitting(true);

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
            disabled={!text.trim() || isSubmitting} 
          >
            {isSubmitting ? '送信中...' : '宣言する'}
          </button>
        </form>
      </main>
    </div>
  );
}