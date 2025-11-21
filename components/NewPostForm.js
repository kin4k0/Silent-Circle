import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★ここにお好きな禁止用語を追加してください
  const NG_WORDS = ['死ね', '殺す', '馬鹿', 'あほ', 'うんこ'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || isSubmitting) return;

    // ★追加: 禁止用語チェック
    // 「入力されたテキスト」の中に「NGワード」が含まれているか探す
    const hasNgWord = NG_WORDS.some(word => text.includes(word));

    if (hasNgWord) {
      alert("不適切な言葉が含まれているため、投稿できません。");
      return; // ここで処理をストップ（投稿させない）
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
      console.error("Error adding document: ", error);
      alert("送信に失敗しました。通信環境を確認してください。");
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
          />
          
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