"use client"; // ← Next.jsで動き（useState）を使うために必ず必要です

import { useState } from "react";
// さっき作った部品を読み込みます
import Timeline from "../components/Timeline";
import NewPostForm from "../components/NewPostForm";

export default function Home() {
  // 画面の状態を管理する ("timeline" か "form" か)
  const [currentView, setCurrentView] = useState("timeline");

  return (
    // 画面中央に配置するためのスタイル (Tailwind CSSを使用)
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      
      {/* 条件分岐: currentViewが "timeline" ならタイムラインを表示 */}
      {currentView === "timeline" && (
        <Timeline 
          onDeclareClick={() => setCurrentView("form")} 
        />
      )}

      {/* 条件分岐: currentViewが "form" なら投稿画面を表示 */}
      {currentView === "form" && (
        <NewPostForm 
          onBackClick={() => setCurrentView("timeline")} 
        />
      )}

    </main>
  );
}