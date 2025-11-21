"use client";

import { useState } from "react";
import Timeline from "../components/Timeline";
import NewPostForm from "../components/NewPostForm";

export default function Home() {
  const [currentView, setCurrentView] = useState("timeline");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState({
    darkMode: false,
    fontSize: 'medium',
    fontFamily: 'sans',
  });

  const appStyles = {
    '--bg-color': settings.darkMode ? '#1a1a1a' : '#ffffff',
    '--text-color': settings.darkMode ? '#f0f0f0' : '#333333',
    '--accent-color': '#007aff',
    '--bubble-bg': settings.darkMode ? '#2c2c2c' : '#ffffff',
    '--border-color': settings.darkMode ? '#444' : '#eee',
    '--font-size-base': settings.fontSize === 'small' ? '14px' : settings.fontSize === 'large' ? '20px' : '16px',
    '--font-family': settings.fontFamily === 'serif' ? '"Hiragino Mincho ProN", "Yu Mincho", serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties;

  return (
    <main style={appStyles} className="min-h-screen">
      
      {currentView === "timeline" && (
        <Timeline 
          onDeclareClick={() => setCurrentView("form")} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {currentView === "form" && (
        <NewPostForm 
          onBackClick={() => setCurrentView("timeline")} 
        />
      )}

      {isSettingsOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsSettingsOpen(false)}>
          <div style={{...modalContentStyle, backgroundColor: settings.darkMode ? '#333' : '#fff', color: settings.darkMode ? '#fff' : '#333'}} onClick={(e) => e.stopPropagation()}>
            <h2 style={{fontWeight:'bold', marginBottom:'15px'}}>表示設定</h2>

            <div style={settingRowStyle}>
              <label>モード</label>
              <button onClick={() => setSettings({...settings, darkMode: !settings.darkMode})} style={toggleButtonStyle}>
                {settings.darkMode ? '🌙 ダーク' : '☀️ ライト'}
              </button>
            </div>

            <div style={settingRowStyle}>
              <label>文字サイズ</label>
              <div style={{display:'flex', gap:'5px'}}>
                {['small', 'medium', 'large'].map((size) => (
                  <button 
                    key={size}
                    
                    onClick={() => setSettings({...settings, fontSize: size})}
                    style={{
                      ...sizeButtonStyle,
                      background: settings.fontSize === size ? '#007aff' : '#ddd',
                      color: settings.fontSize === size ? '#fff' : '#000'
                    }}
                  >
                    {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>

            <div style={settingRowStyle}>
              <label>フォント</label>
              <div style={{display:'flex', gap:'5px'}}>
                <button onClick={() => setSettings({...settings, fontFamily: 'sans'})} style={{...sizeButtonStyle, background: settings.fontFamily === 'sans' ? '#007aff' : '#ddd', color: settings.fontFamily === 'sans' ? '#fff' : '#000'}}>ゴシック</button>
                <button onClick={() => setSettings({...settings, fontFamily: 'serif'})} style={{...sizeButtonStyle, background: settings.fontFamily === 'serif' ? '#007aff' : '#ddd', color: settings.fontFamily === 'serif' ? '#fff' : '#000'}}>明朝</button>
              </div>
            </div>

            <button onClick={() => setIsSettingsOpen(false)} style={closeButtonStyle}>閉じる</button>
          </div>
        </div>
      )}

    </main>
  );
}

// ★修正点: any を React.CSSProperties に変更
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
  padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '350px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
};
const settingRowStyle: React.CSSProperties = { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const toggleButtonStyle: React.CSSProperties = { padding: '5px 15px', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer' };
const sizeButtonStyle: React.CSSProperties = { padding: '5px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px' };
const closeButtonStyle: React.CSSProperties = { width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color:'#333' };