import styles from './Timeline.module.css';

// タイムラインに表示するダミーデータ
const dummyPosts = [
  { id: 1, text: "資格勉強頑張る!!" },
  { id: 2, text: "毎日運動する!!" },
  { id: 3, text: "早起きする!!" },
  { id: 4, text: "受験勉強頑張る!!" },
];

export default function Timeline() {
  return (
    <div className={styles.container}>
      {/* 1. ヘッダー部分 */}
      <header className={styles.header}>
        <h1 className={styles.title}>SILENT CIRCLE</h1>
        {/* 「宣言する」ボタン (図5へ遷移することを想定) */}
        <button className={styles.declareButton}>宣言する</button>
      </header>

      {/* 2. 宣言タイムライン部分 */}
      <main className={styles.timeline}>
        {dummyPosts.map((post) => (
          <div key={post.id} className={styles.postBubble}>
            <p>{post.text}</p>
            
            {/* ↓ ユーザーが用意する「拍手」アイコンをここに配置します */}
            <div className={styles.clapButton}>
              {/* <Image src="/path/to/your-clap-icon.png" width={24} height={24} alt="拍手" /> */}
              <span>👏</span> {/* 画像が用意できるまでの仮の絵文字 */}
            </div>
            
          </div>
        ))}
      </main>
    </div>
  );
}