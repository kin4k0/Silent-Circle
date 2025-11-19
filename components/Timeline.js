import styles from './Timeline.module.css';

// onDeclareClick: 「宣言する」ボタンが押されたときに実行される関数を受け取る
export default function Timeline({ onDeclareClick }) {
  const dummyPosts = [
    { id: 1, text: "資格勉強頑張る!!" },
    { id: 2, text: "毎日運動する!!" },
    { id: 3, text: "早起きする!!" },
    { id: 4, text: "受験勉強頑張る!!" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>SILENT CIRCLE</h1>
        {/* ボタンを押したら onDeclareClick を実行 */}
        <button className={styles.declareButton} onClick={onDeclareClick}>
          宣言する
        </button>
      </header>

      <main className={styles.timeline}>
        {dummyPosts.map((post) => (
          <div key={post.id} className={styles.postBubble}>
            <p>{post.text}</p>
            <div className={styles.clapButton}>
              <span>👏</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}