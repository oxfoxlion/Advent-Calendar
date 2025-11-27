'use client';

import { createCalendar } from './actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, X, ArrowRight, Palette, Sparkles } from 'lucide-react';
import BackgroundDecoration from '@/components/BackgroundDecoration';

// 定義可用圖樣
const PATTERNS = [
  { id: '', label: '無' },
  { id: '🎄', label: '聖誕樹' },
  { id: '🎁', label: '禮物' },
  { id: '❄️', label: '雪花' },
  { id: '☃️', label: '雪人' },
  { id: '🌸', label: '花朵' },
  { id: '✨', label: '閃亮' },
  { id: '🐱', label: '貓咪' },
];

export default function Home() {
  const router = useRouter();
  
  // 1. 外觀狀態 (預設值：米白 -> 天藍，暖金卡片，雪花圖樣)
  const [bgStart, setBgStart] = useState('#FDF6E3'); 
  const [bgEnd, setBgEnd] = useState('#5997D9');   
  const [cardColor, setCardColor] = useState('#FFCB5C');
  const [pattern, setPattern] = useState('❄️');

  const [isPending, setIsPending] = useState(false);

  // 2. 編輯 Modal 狀態
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState('');

  // 處理建立日曆
  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    // 將顏色與圖樣組合成後端需要的格式: custom-bg:色1,色2,圖樣
    formData.set('background', `custom-bg:${bgStart},${bgEnd},${pattern}`);
    formData.set('cardStyle', `custom-card:${cardColor}`);
    formData.set('themeColor', 'custom'); 
    
    await createCalendar(formData);
  };

  // 處理前往編輯頁面
  const handleGoToEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSlug.trim()) {
      router.push(`/${editSlug}/edit`);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 transition-colors duration-700 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})` }}
    >
      {/* 背景漂浮裝飾 (即時預覽) */}
      <BackgroundDecoration pattern={pattern} />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        
        {/* 右上角：編輯舊日曆按鈕 */}
        <div className="absolute -top-16 right-0 md:-right-4">
          <button 
            type="button"
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 text-slate-700/80 hover:text-slate-900 bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all"
          >
            <Edit className="w-4 h-4" />
            編輯日曆
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">
            Advent Calendar
          </h1>
          <p className="mt-3 text-slate-600 font-medium">為重要的人準備 25 天的驚喜</p>
        </div>

        <form action={handleSubmit} className="mt-8 space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-2xl">
          <div className="space-y-6">
            
            {/* --- 基本資訊 --- */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">降臨曆名稱</label>
                <input name="recipientName" required type="text" placeholder="例如：給小明的聖誕驚喜" 
                  className="block w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">網址代碼 (Slug)</label>
                <input name="slug" required type="text" placeholder="例如：xmas-2024-amy (需唯一)" 
                  className="block w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">編輯密碼</label>
                <input name="adminCode" required type="text" placeholder="你自己用" 
                  className="w-full rounded-xl bg-white border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">訪客密碼 (選填)</label>
                <input name="accessCode" type="text" placeholder="留空則公開" 
                  className="w-full rounded-xl bg-white border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
            </div>

            <hr className="border-slate-200/60 my-2"/>

            {/* --- 1. 背景漸層選擇器 --- */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. 設定背景氛圍 (預設為雪景)</label>
              <div className="relative h-12 w-full rounded-full border border-slate-200 shadow-inner flex items-center px-1 bg-white">
                <div className="absolute inset-1 rounded-full opacity-80" style={{ background: `linear-gradient(to right, ${bgStart}, ${bgEnd})` }} />
                
                {/* 起始色 */}
                <div className="absolute left-1 top-1/2 -translate-y-1/2 group cursor-pointer z-10">
                  <input 
                    type="color" 
                    value={bgStart} 
                    onChange={(e) => setBgStart(e.target.value)} 
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" 
                  />
                  <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgStart }} />
                  </div>
                </div>

                {/* 結束色 */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 group cursor-pointer z-10">
                  <input 
                    type="color" 
                    value={bgEnd} 
                    onChange={(e) => setBgEnd(e.target.value)} 
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" 
                  />
                  <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgEnd }} />
                  </div>
                </div>
              </div>
            </div>

            {/* --- 2. 圖樣選擇器 --- */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2. 選擇裝飾圖樣
              </label>
              <div className="flex flex-wrap gap-2">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPattern(p.id)}
                    className={`
                      w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all border
                      ${pattern === p.id 
                        ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'}
                    `}
                    title={p.label}
                  >
                    {p.id || <X className="w-3 h-3 text-slate-300"/>}
                  </button>
                ))}
              </div>
            </div>

            {/* --- 3. 卡片顏色選擇器 --- */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. 設定卡片主色 (預設為暖金)</label>
              <div className="relative h-12 w-full rounded-xl border border-slate-200 shadow-inner flex items-center px-1 bg-white overflow-hidden group">
                
                {/* 顏色預覽條 */}
                <div 
                  className="absolute inset-1 rounded-lg opacity-100 transition-colors duration-300 border border-black/5" 
                  style={{ backgroundColor: cardColor }} 
                />
                
                {/* 顏色選擇器互動區 */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm pointer-events-none transition-all">
                     <Palette className="w-3 h-3" />
                     <span>點擊更換顏色</span>
                   </div>
                   <input 
                    type="color" 
                    value={cardColor} 
                    onChange={(e) => setCardColor(e.target.value)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                  />
                </div>
              </div>
              {/* 顯示 Hex 代碼供參考 */}
              <div className="flex justify-end mt-1.5 px-1">
                 <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">{cardColor}</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none transform transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : '✨ 開始製作'}
          </button>
        </form>
        
        <p className="text-center text-xs text-slate-500 mix-blend-multiply">
          Made with ❤️ for Christmas 2024
        </p>
      </div>

      {/* --- 編輯日曆 Modal --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">編輯現有日曆</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleGoToEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">輸入網址代碼 (Slug)</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="例如：xmas-2024-amy"
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!editSlug.trim()}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  前往管理介面 <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}