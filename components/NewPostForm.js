import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import styles from './NewPostForm.module.css';

export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ★ここが禁止用語リストです
  // ひらがな、カタカナ、漢字など、ブロックしたい表記をすべて書いてください
  const NG_WORDS = ['死ね', '殺す', '馬鹿', 'ばか', 'バカ', 'あほ', 'うんこ'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 入力チェック
    if (!text.trim()) return;
    if (isSubmitting) return;

    // ★デバッグ用: コンソールにチェック内容を表示
    console.log("入力された文字:", text);
    
    // 禁止用語チェック
    const foundNgWord = NG_WORDS.find(word => text.includes(word));

    if (foundNgWord) {
      // 禁止用語が見つかった場合
      console.log("禁止用語を検出しました:", foundNgWord);
      alert(`不適切な言葉が含まれています: 「${foundNgWord}」`);
      return; // ★ここで強制終了（送信させない）
    }

    console.log("禁止用語はありませんでした。送信を開始します。");

    try {
      setIsSubmitting(true);

      // Firebaseへの送信処理
      await addDoc(collection(db, "posts"), {
        text: text,
        claps: 0,
        createdAt: serverTimestamp(),
        uid: auth.currentUser ? auth.currentUser.uid : null, 
      });

      console.log("送信成功！");
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