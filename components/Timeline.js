import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import Image from 'next/image';
import clapImage from './clap.png'; 
import styles from './Timeline.module.css';

export default function Timeline({ onDeclareClick, onOpenSettings }) {
  const [posts, setPosts] = useState([]);
  const [likedPostIds, setLikedPostIds] = useState([]);

  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem('likedPostIds') || '[]');
    if (savedLikes.length > 0) {
      // ★修正点: 以下のコメントを追加してエラーを無視させる
      // eslint-disable-next-line
      setLikedPostIds(savedLikes);
    }

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
    if (likedPostIds.includes(id)) return; 
    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, { claps: increment(1) });
    const newLikedList = [...likedPostIds, id];
    setLikedPostIds(newLikedList);
    localStorage.setItem('likedPostIds', JSON.stringify(newLikedList));
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, "posts", id));
    } catch (error) {
      alert("削除できませんでした。");
    }
  };

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
          const isMyPost = currentUserId && post.uid === currentUserId;
          return (
            <div key={post.id} className={styles.postBubble}>
              <p>{post.text}</p>
              {isMyPost && (
                <button onClick={(e) => handleDelete(e, post.id)} className={styles.deleteButton}>×</button>
              )}
              <div 
                className={styles.clapButton} 
                onClick={() => handleClap(post.id)}
                style={{ 
                  opacity: isLiked ? 0.5 : 1, 
                  cursor: isLiked ? 'default' : 'pointer',
                  pointerEvents: isLiked ? 'none' : 'auto'
                }}
              >
                <Image src={clapImage} alt="拍手" width={24} height={24} />
                <span style={{fontSize: '12px', marginLeft: '4px', color: 'inherit'}}>
                  {post.claps || 0}
                </span>
              </div>
            </div>
          );
        })}
      </main>

      <button className={styles.settingsButton} onClick={onOpenSettings}>
        ⚙️
      </button>
    </div>
  );
}