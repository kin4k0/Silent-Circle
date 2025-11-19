import React, { useState } from 'react';
import styles from './NewPostForm.module.css';

export default function NewPostForm() {
  // テキストエリアの中身を管理するためのState
  const [text, setText] = useState('');

  // フォーム送信時の動作（今はUI確認だけなのでコンソールに出力）
  const handleSubmit = (e) => {
    e.preventDefault(); // ページの再読み込みを防ぐ
    if (text.trim()) {
      alert('「' + text + '」と宣言しました！');
      setText(''); // 送信したらテキストエリアを空にする
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. ヘッダー (戻るボタン) */}
      <header className={styles.header}>
        <button className={styles.backButton}>
          {/* Unicodeの「←」矢印 */}
          <span>&#x2190;</span> 
        </button>
      </header>

      {/* 2. フォーム本体 */}
      <main className={styles.formWrapper}>
        <form onSubmit={handleSubmit}>
          {/* テキスト入力エリア */}
          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            // 企画書の図にあるプレースホルダーを再現 [cite: 64]
            placeholder="隣町まで10分で行けるように&#10;頑張って走る!!"
          />
          
          {/* 宣言するボタン [cite: 65] */}
          <button 
            type="submit" 
            className={styles.submitButton}
            // テキストが空の時はボタンを押せないようにする
            disabled={!text.trim()} 
          >
            宣言する
          </button>
        </form>
      </main>
    </div>
  );
}