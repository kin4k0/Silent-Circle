import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from './Timeline.module.css';

export default function Timeline({ onDeclareClick }) {
  const [posts, setPosts] = useState([]);
  // 追加1: 自分が「拍手」した投稿のIDリストを管理する変数
  const [likedPostIds, setLikedPostIds] = useState([]);

  useEffect(() => {
    // 追加2: 画面を開いたとき、ブラウザに保存された「拍手済みリスト」を読み込む
    const savedLikes = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    setLikedPostIds(savedLikes);

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleClap = async (id) => {
    // 追加3: すでにリストに入っていたら、処理を中断する（これ以上押せない）
    if (likedPostIds.includes(id)) {
      return; 
    }

    // DB更新
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      claps: increment(1)
    });

    // 追加4: 押したIDをリストに追加して、ブラウザ(LocalStorage)に保存
    const newLikedList = [...likedPostIds, id];
    setLikedPostIds(newLikedList);
    localStorage.setItem('likedPostIds', JSON.stringify(newLikedList));
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
        {posts.length === 0 && (
          <p style={{textAlign: 'center', padding: '20px', color: '#999'}}>
            まだ宣言はありません。<br/>一番乗りで宣言しましょう！
          </p>
        )}

        {posts.map((post) => {
          // 追加5: この投稿に既に拍手したかどうか判定
          const isLiked = likedPostIds.includes(post.id);

          return (
            <div key={post.id} className={styles.postBubble}>
              <p>{post.text}</p>
              
              {/* 拍手ボタン */}
              <div 
                className={styles.clapButton} 
                onClick={() => handleClap(post.id)}
                // 追加6: 拍手済みなら薄くして、カーソルも変える
                style={{ 
                  opacity: isLiked ? 0.5 : 1, 
                  cursor: isLiked ? 'default' : 'pointer',
                  pointerEvents: isLiked ? 'none' : 'auto' // CSSでもクリック禁止
                }}
              >
                <span>👏</span>
                <span style={{fontSize: '10px', marginLeft: '4px'}}>
                  {post.claps || 0}
                </span>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}