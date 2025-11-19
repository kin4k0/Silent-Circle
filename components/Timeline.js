import { useEffect, useState } from 'react';
// ★変更点: deleteDoc を追加
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
// ★変更点: auth を追加
import { db, auth } from "../lib/firebase";
import styles from './Timeline.module.css';

export default function Timeline({ onDeclareClick }) {
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);

  useEffect(() => {
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

  // 拍手機能
  const handleClap = async (id) => {
    if (likedPostIds.includes(id)) return; 

    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
      claps: increment(1)
    });

    const newLikedList = [...likedPostIds, id];
    setLikedPostIds(newLikedList);
    localStorage.setItem('likedPostIds', JSON.stringify(newLikedList));
  };

  // ★変更点: 削除機能を追加
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 拍手ボタンなどが反応しないようにする
    
    const confirmDelete = window.confirm("本当にこの宣言を削除しますか？");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "posts", id));
    } catch (error) {
      console.error("削除エラー:", error);
      alert("削除できませんでした。自分の投稿以外は消せません。");
    }
  };

  // 現在のユーザーIDを取得（ログインしていない場合は undefined になる）
  const currentUserId = auth.currentUser?.uid;

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
          const isLiked = likedPostIds.includes(post.id);
          
          // ★変更点: この投稿は自分のものか判定する
          const isMyPost = currentUserId && post.uid === currentUserId;

          return (
            <div key={post.id} className={styles.postBubble}>
              <p>{post.text}</p>
              
              {/* ★変更点: 自分の投稿(isMyPost)なら削除ボタンを表示 */}
              {isMyPost && (
                <button 
                  onClick={(e) => handleDelete(e, post.id)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    fontSize: '18px',
                    cursor: 'pointer',
                    padding: '0 5px',
                    lineHeight: '1',
                  }}
                >
                  ×
                </button>
              )}

              {/* 拍手ボタン */}
              <div 
                className={styles.clapButton} 
                onClick={() => handleClap(post.id)}
                style={{ 
                  opacity: isLiked ? 0.5 : 1, 
                  cursor: isLiked ? 'default' : 'pointer',
                  pointerEvents: isLiked ? 'none' : 'auto'
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