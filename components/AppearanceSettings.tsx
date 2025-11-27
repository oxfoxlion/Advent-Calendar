'use client';

import { useState } from 'react';
import { updateCalendarSettings } from '@/app/actions';
import { useRouter } from 'next/navigation';

// 預設主題色碼對照表 (用於初始化)
const THEME_DEFAULTS: Record<string, [string, string]> = {
  classic: ['#450a0a', '#14532d'], // 紅 -> 綠
  winter: ['#0f172a', '#1e293b'],  // 深藍 -> 灰藍
  cozy: ['#FDF6E3', '#FDF6E3'],    // 米白
  sugar: ['#ffe4e6', '#ccfbf1'],   // 粉紅 -> 粉綠
};

const CARD_DEFAULTS: Record<string, string> = {
  classic: '#7f1d1d', // 深紅
  winter: '#1e293b',  // 灰藍
  cozy: '#78350f',    // 焦糖
  sugar: '#fb7185',   // 粉紅
};

type Props = {
  slug: string;
  profile: {
    recipientName: string;
    background: string;
    cardStyle: string;
  };
};

export default function AppearanceSettings({ slug, profile }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // 解析初始背景顏色
  const initBg = profile.background.startsWith('custom-bg:')
    ? profile.background.replace('custom-bg:', '').split(',')
    : THEME_DEFAULTS[profile.background] || THEME_DEFAULTS.classic;

  // 解析初始卡片顏色
  const initCard = profile.cardStyle.startsWith('custom-card:')
    ? profile.cardStyle.replace('custom-card:', '')
    : CARD_DEFAULTS[profile.cardStyle] || CARD_DEFAULTS.classic;

  const [bgStart, setBgStart] = useState(initBg[0]);
  const [bgEnd, setBgEnd] = useState(initBg[1] || initBg[0]);
  const [cardColor, setCardColor] = useState(initCard);
  const [name, setName] = useState(profile.recipientName);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    // 組合自訂格式字串
    formData.set('background', `custom-bg:${bgStart},${bgEnd}`);
    formData.set('cardStyle', `custom-card:${cardColor}`);
    formData.set('themeColor', 'custom'); // 保持相容性

    await updateCalendarSettings(formData);
    setIsPending(false);
    router.refresh();
  };

  return (
    <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-300">
        🎨 外觀風格設定
      </h2>
      
      <form action={handleSubmit} className="space-y-8">
        <input type="hidden" name="slug" value={slug} />

        {/* 1. 背景漸層選擇器 (仿照您提供的圖片樣式) */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
            自訂背景漸層
          </label>
          
          <div className="relative h-16 w-full rounded-xl border border-white/20 shadow-inner flex items-center px-2"
               style={{ background: `linear-gradient(to right, ${bgStart}, ${bgEnd})` }}>
            
            {/* 左端選擇器 */}
            <div className="absolute left-0 -ml-2 top-1/2 -translate-y-1/2 group">
              <input 
                type="color" 
                value={bgStart} 
                onChange={(e) => setBgStart(e.target.value)}
                className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer z-20"
              />
              <div className="w-10 h-10 bg-white rounded-full shadow-lg border-4 border-slate-800 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full" style={{ backgroundColor: bgStart }} />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                起始色
              </div>
            </div>

            {/* 右端選擇器 */}
            <div className="absolute right-0 -mr-2 top-1/2 -translate-y-1/2 group">
              <input 
                type="color" 
                value={bgEnd} 
                onChange={(e) => setBgEnd(e.target.value)}
                className="absolute inset-0 w-10 h-10 opacity-0 cursor-pointer z-20"
              />
              <div className="w-10 h-10 bg-white rounded-full shadow-lg border-4 border-slate-800 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full" style={{ backgroundColor: bgEnd }} />
              </div>
              <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                結束色
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 text-xs text-gray-500 font-mono">
            <span>{bgStart}</span>
            <span>{bgEnd}</span>
          </div>
        </div>

        {/* 2. 卡片顏色與即時預覽 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
              卡片底色
            </label>
            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 shadow-sm shrink-0">
                <input 
                  type="color" 
                  value={cardColor} 
                  onChange={(e) => setCardColor(e.target.value)}
                  className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">點擊色塊調整</span>
                <span className="text-xs text-gray-500 font-mono">{cardColor}</span>
              </div>
            </div>
          </div>

          {/* 預覽區塊：模擬實際顯示效果 */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">
              效果預覽
            </label>
            <div 
              className="h-24 w-full rounded-lg shadow-inner flex items-center justify-center gap-3 border border-white/10"
              style={{ background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})` }}
            >
              <div 
                className="w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-white font-bold text-lg border border-white/10"
                style={{ backgroundColor: cardColor }}
              >
                12
              </div>
              <div 
                className="w-12 h-12 rounded-lg shadow-lg flex items-center justify-center text-white/50 font-bold text-lg border border-white/10"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                🔒
              </div>
            </div>
          </div>
        </div>

        {/* 標題修改 */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">標題名稱</label>
          <input 
            name="recipientName" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 rounded-lg p-3 text-sm border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
          />
        </div>
        
        <button 
          disabled={isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-3 rounded-lg text-sm font-bold transition shadow-lg shadow-indigo-900/20 disabled:opacity-50"
        >
          {isPending ? '儲存中...' : '儲存外觀設定'}
        </button>
      </form>
    </section>
  );
}