// components/NewPostForm.js
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase"; // 設定ファイル読み込み
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // 二重送信防止用

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true); // 送信中はボタンを押せなくする

      // Firestoreの "posts" コレクションにデータを追加
      await addDoc(collection(db, "posts"), {
        text: text,
        claps: 0, // 最初は0
        createdAt: serverTimestamp(), // サーバー側の日時を自動記録
      });

      // 送信成功
      setText('');
      onBackClick(); // タイムラインに戻る

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