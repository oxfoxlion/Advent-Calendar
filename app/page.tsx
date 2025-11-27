'use client';

import { createCalendar } from './actions';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, X, ArrowRight, Palette, Sparkles, SmilePlus } from 'lucide-react';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

export default function Home() {
  const router = useRouter();

  const [bgStart, setBgStart] = useState('#FDF6E3');
  const [bgEnd, setBgEnd] = useState('#5997D9');
  const [cardColor, setCardColor] = useState('#FFCB5C');
  const [pattern, setPattern] = useState('❄️');

  const [isPending, setIsPending] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState('');

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    formData.set('background', `custom-bg:${bgStart},${bgEnd},${pattern}`);
    formData.set('cardStyle', `custom-card:${cardColor}`);
    formData.set('themeColor', 'custom');
    await createCalendar(formData);
  };

  const handleGoToEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editSlug.trim()) {
      router.push(`/${editSlug}/edit`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-20 p-4 transition-colors duration-700 relative"
      style={{ background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})` }}
    >
      <BackgroundDecoration pattern={pattern} />

      <div className="max-w-xl w-full space-y-8 relative z-10">

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
            2025 聖誕倒數日曆
          </h1>
          <p className="mt-3 text-slate-600 font-medium">為重要的人準備 25 天的驚喜</p>
        </div>

        {/* 修改：加入 relative z-20 確保層級高於 Footer */}
        <form action={handleSubmit} className="mt-8 space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-2xl relative z-20">
          <div className="space-y-6">

            {/* --- 基本資訊 --- */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">降臨曆名稱</label>
                <input name="recipientName" required type="text" placeholder="例如：給米茶的聖誕驚喜"
                  className="block w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">網址代碼 (Slug)</label>
                <input name="slug" required type="text" placeholder="例如：Micha-2025(僅限小寫字母、底線與連字號)"
                  className="block w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">設定管理員密碼</label>
                <input name="adminCode" required type="text" placeholder="自訂管理員登入密碼"
                  className="w-full rounded-xl bg-white border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">訪客密碼 (選填)</label>
                <input name="accessCode" type="text" placeholder="留空則公開"
                  className="w-full rounded-xl bg-white border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
            </div>

            <hr className="border-slate-200/60 my-2" />

            {/* --- 1. 背景漸層 --- */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. 設定背景氛圍 (預設為雪景)</label>
              <div className="relative h-12 w-full rounded-full border border-slate-200 shadow-inner flex items-center px-1 bg-white">
                <div className="absolute inset-1 rounded-full opacity-80" style={{ background: `linear-gradient(to right, ${bgStart}, ${bgEnd})` }} />
                <div className="absolute left-1 top-1/2 -translate-y-1/2 group cursor-pointer z-10">
                  <input type="color" value={bgStart} onChange={(e) => setBgStart(e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" />
                  <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgStart }} />
                  </div>
                </div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2 group cursor-pointer z-10">
                  <input type="color" value={bgEnd} onChange={(e) => setBgEnd(e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" />
                  <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                    <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgEnd }} />
                  </div>
                </div>
              </div>
            </div>

            {/* --- 2. 圖樣選擇器 (Emoji Picker) --- */}
            <div className="relative" ref={pickerRef}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2. 選擇裝飾圖樣
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 px-4 py-2.5 rounded-xl transition shadow-sm w-full text-left group"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-xl group-hover:scale-110 transition-transform">
                    {pattern || <SmilePlus className="w-5 h-5 text-slate-400" />}
                  </span>
                  <span className="flex-1 text-sm text-slate-600 font-medium">
                    {pattern ? '點擊更換圖樣' : '選擇一個裝飾 Emoji...'}
                  </span>
                </button>

                {pattern && (
                  <button
                    type="button"
                    onClick={() => setPattern('')}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200"
                    title="清除圖樣"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* 修改重點：
                1. 移除 absolute / top-full (不再懸浮)
                2. 改用 mt-4 (增加間距)
                3. 設定寬度 100% 填滿容器
                這樣選擇器出現時，會把下方的按鈕和 Footer 往下推，頁面就會變長，可以滑動。
              */}
              {showEmojiPicker && (
                // 1. 加入 w-full max-w-[340px] 限制寬度
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 w-full max-w-[340px]">
                  <EmojiPicker
                    onEmojiClick={(e) => {
                      setPattern(e.emoji);
                      setShowEmojiPicker(false);
                    }}
                    emojiStyle={EmojiStyle.NATIVE}
                    width="100%" // 讓它填滿上面設定的 340px
                    height={350} // 高度也稍微調小，比例較協調
                    searchPlaceHolder="搜尋表情符號..."
                    previewConfig={{ showPreview: false }} // 隱藏底部預覽列，讓介面更簡潔 (選填)
                  />
                </div>
              )}
            </div>

            {/* --- 3. 卡片顏色選擇器 --- */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. 設定卡片主色 (預設為暖金)</label>
              <div className="relative h-12 w-full rounded-xl border border-slate-200 shadow-inner flex items-center px-1 bg-white overflow-hidden group">
                <div className="absolute inset-1 rounded-lg opacity-100 transition-colors duration-300 border border-black/5" style={{ backgroundColor: cardColor }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm pointer-events-none transition-all">
                    <Palette className="w-3 h-3" />
                    <span>點擊更換顏色</span>
                  </div>
                  <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
              </div>
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
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : '✨ 開始製作'}
          </button>
        </form>

        {/* Footer: relative z-10，層級低於 Form (z-20)，所以即使重疊也會在下面，但因為上面的 picker 變成了區塊元素，這裡實際上會被推到更下面去 */}
        <p className="text-center text-xs text-slate-500 mix-blend-multiply relative z-10">
          Made with ❤️ for Christmas 2024
        </p>
      </div>

      {/* ... (Modal 保持不變) ... */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Content */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">編輯現有日曆</h3>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition">
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