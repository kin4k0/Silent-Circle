import React, { useState } from 'react';
import styles from './NewPostForm.module.css';

// onBackClick: 「戻る」ボタンが押されたときに実行される関数を受け取る
export default function NewPostForm({ onBackClick }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      alert('宣言しました: ' + text);
      setText('');
      onBackClick(); // 投稿したらタイムラインに戻る
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
            placeholder="隣町まで10分で行けるように&#10;頑張って走る!!"
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!text.trim()} 
          >
            宣言する
          </button>
        </form>
      </main>
    </div>
  );
}