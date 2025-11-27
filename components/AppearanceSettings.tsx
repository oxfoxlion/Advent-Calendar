'use client';

import { useState, useRef, useEffect } from 'react';
import { updateCalendarSettings } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Palette, Sparkles, X as XIcon, SmilePlus } from 'lucide-react';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

type Props = {
  slug: string;
  profile: { recipientName: string };
  bgStart: string; setBgStart: (v: string) => void;
  bgEnd: string; setBgEnd: (v: string) => void;
  cardColor: string; setCardColor: (v: string) => void;
  pattern: string; setPattern: (v: string) => void;
};

export default function AppearanceSettings({ 
  slug, profile, 
  bgStart, setBgStart, 
  bgEnd, setBgEnd, 
  cardColor, setCardColor,
  pattern, setPattern 
}: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [name, setName] = useState(profile.recipientName);
  
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
    setIsSuccess(false);
    
    formData.set('background', `custom-bg:${bgStart},${bgEnd},${pattern}`);
    formData.set('cardStyle', `custom-card:${cardColor}`);
    formData.set('themeColor', 'custom');

    await updateCalendarSettings(formData);
    
    setTimeout(() => {
      setIsPending(false);
      setIsSuccess(true);
      router.refresh();
      setTimeout(() => setIsSuccess(false), 2000);
    }, 500);
  };

  return (
    <section className="bg-white/80 backdrop-blur-md border border-white/50 p-8 rounded-3xl shadow-xl text-slate-800 relative z-10">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-600">
        🎨 外觀風格設定
      </h2>
      
      <form action={handleSubmit} className="space-y-8">
        <input type="hidden" name="slug" value={slug} />

        {/* 1. 背景漸層 (保持不變) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            背景氛圍
          </label>
          <div className="relative h-12 w-full rounded-full border border-slate-200 shadow-inner flex items-center px-1 bg-white">
            <div className="absolute inset-1 rounded-full opacity-80" style={{ background: `linear-gradient(to right, ${bgStart}, ${bgEnd})` }} />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 group cursor-pointer z-20">
              <input type="color" value={bgStart} onChange={(e) => setBgStart(e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" />
              <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgStart }} />
              </div>
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 group cursor-pointer z-20">
              <input type="color" value={bgEnd} onChange={(e) => setBgEnd(e.target.value)} className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer z-20" />
              <div className="w-8 h-8 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center transform group-hover:scale-110 transition">
                <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: bgEnd }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. 背景圖樣 (改回懸浮 Emoji Picker) */}
        <div className="relative" ref={pickerRef}>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> 裝飾圖樣
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
                <XIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* 修改這裡：改回 absolute 懸浮定位，並固定寬度為 320px (小尺寸) */}
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-2 z-50 shadow-2xl rounded-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
              <EmojiPicker 
                onEmojiClick={(e) => {
                  setPattern(e.emoji);
                  setShowEmojiPicker(false);
                }}
                emojiStyle={EmojiStyle.NATIVE}
                width={320} // 固定寬度，小巧精緻
                height={350} // 高度適中
                searchPlaceHolder="搜尋表情符號..."
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>

        {/* 3. 卡片顏色 (保持不變) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
            卡片主色
          </label>
          <div className="relative h-12 w-full rounded-xl border border-slate-200 shadow-inner flex items-center px-1 bg-white overflow-hidden group">
            <div className="absolute inset-1 rounded-lg opacity-100 transition-colors duration-300 border border-black/5" style={{ backgroundColor: cardColor }} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-black/10 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm pointer-events-none transition-all">
                  <Palette className="w-3 h-3" />
                  <span>點擊更換</span>
                </div>
                <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
            </div>
          </div>
        </div>

        {/* 標題 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">標題名稱</label>
          <input 
            name="recipientName" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm" 
          />
        </div>
        
        <button 
          disabled={isPending || isSuccess}
          className={`
            w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
            shadow-lg active:scale-[0.98]
            ${isSuccess 
              ? 'bg-emerald-600 text-white shadow-emerald-500/30' 
              : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-500/30'}
            ${isPending ? 'opacity-80 cursor-wait' : ''}
          `}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSuccess && <Check className="w-4 h-4" />}
          {isSuccess ? '已儲存設定！' : (isPending ? '儲存中...' : '儲存外觀設定')}
        </button>
      </form>
    </section>
  );
}