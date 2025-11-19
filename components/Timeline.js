// components/Timeline.js
import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase"; // さっき作った設定ファイルを読み込み
import styles from './Timeline.module.css';

export default function Timeline({ onDeclareClick }) {
  const [posts, setPosts] = useState([]);

  // 1. 画面が表示されたら、Firestoreのデータを監視する
  useEffect(() => {
    // "posts" というコレクションを、新しい順(createdAtの降順)で取得するクエリ
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    // リアルタイムリスナー: 誰かが投稿したり拍手すると、即座にここが動く
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    // 画面を閉じる時は監視を終了する
    return () => unsubscribe();
  }, []);

  // 2. 拍手ボタンが押された時の処理
  const handleClap = async (id) => {
    const postRef = doc(db, "posts", id);
    // データベースの claps の数字を +1 する
    await updateDoc(postRef, {
      claps: increment(1)
    });
    // ※React側でstateを変える必要はありません。
    //  DBが更新されると、上のonSnapshotが自動で検知して画面を書き換えてくれます。
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>SILENT CIRCLE</h1>
        <button className={styles.declareButton} onClick={onDeclareClick}>
          宣言する
        </button>
      </header>

      <main className={styles.timeline}>
        {/* 投稿がない場合のメッセージ */}
        {posts.length === 0 && (
          <p style={{textAlign: 'center', padding: '20px', color: '#999'}}>
            まだ宣言はありません。<br/>一番乗りで宣言しましょう！
          </p>
        )}

        {posts.map((post) => (
          <div key={post.id} className={styles.postBubble}>
            <p>{post.text}</p>
            
            {/* 拍手ボタン */}
            <div 
              className={styles.clapButton} 
              onClick={() => handleClap(post.id)}
            >
              <span>👏</span>
              {/* 確認用に今の拍手数も小さく表示しておきます */}
              <span style={{fontSize: '10px', marginLeft: '4px'}}>
                {post.claps || 0}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}