'use client';
import { DayContent } from '@/lib/sdk/types';
import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

// 定義四種卡片風格 CSS
const CARD_STYLES: Record<string, string> = {
  // 1. 經典聖誕 (Classic): 深紅底 + 金框 + 金字
  classic: "bg-red-900 border-2 border-yellow-500 text-yellow-400 shadow-lg hover:bg-red-800",
  
  // 2. 冰雪奇緣 (Winter): 深灰藍底 + 銀框 + 冰藍字
  winter: "bg-slate-800 border border-slate-500 text-sky-200 shadow-md hover:bg-slate-700",
  
  // 3. 溫馨薑餅 (Cozy): 薑餅色底 + 焦糖框 + 奶油字
  cozy: "bg-amber-900 border-2 border-amber-700 text-orange-100 shadow-md hover:bg-amber-800",
  
  // 4. 夢幻糖果 (Sugar): 粉紅底 + 無框 + 白字 (您想要的粉嫩感)
  sugar: "bg-rose-400 text-white shadow-md hover:bg-rose-300",
};

// 鎖定狀態的統一樣式 (霧面黑玻璃)
const LOCKED_STYLE = "bg-black/60 border border-white/10 text-white/30 cursor-not-allowed backdrop-blur-sm";

export default function AdventGrid({ days, slug, cardStyle }: { 
  days: DayContent[], 
  slug: string, 
  cardStyle: string 
  // themeColor 這裡已經不需要了
}) {
  const [opened, setOpened] = useState<number[]>([]);
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`advent-${slug}`) || '[]');
    setOpened(saved);
  }, [slug]);

  const handleOpen = (day: DayContent) => {
    if (day.isLocked || opened.includes(day.day)) return;
    const newOpened = [...opened, day.day];
    setOpened(newOpened);
    localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
  };

  // 取得當前樣式 class
  const currentStyleClass = CARD_STYLES[cardStyle] || CARD_STYLES.classic;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-20 px-4">
      {days.map((day) => {
        const isOpened = opened.includes(day.day);
        
        return (
          <div key={day.day} className="aspect-square relative perspective-1000 group" onClick={() => handleOpen(day)}>
            <motion.div
              className={clsx("w-full h-full relative preserve-3d transition-all duration-700", !day.isLocked && "cursor-pointer")}
              animate={{ rotateY: isOpened ? 180 : 0 }}
            >
              {/* --- 正面 --- */}
              <div className={clsx(
                "absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center transition-all",
                day.isLocked ? LOCKED_STYLE : currentStyleClass
              )}>
                <span className="text-3xl font-bold drop-shadow-md">{day.day}</span>
                {day.isLocked ? (
                  <Lock className="w-4 h-4 mt-2 opacity-50"/>
                ) : (
                  <Star className="w-4 h-4 mt-2 animate-pulse opacity-80"/>
                )}
              </div>

              {/* --- 背面 --- */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden text-slate-900 border-4 border-white/50">
                {day.type === 'image' && day.content ? (
                  <img src={day.content} alt="Gift" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="overflow-y-auto max-h-full w-full scrollbar-thin scrollbar-thumb-slate-200">
                    <h3 className="font-bold mb-2 text-sm text-slate-700">{day.title}</h3>
                    <p className="text-xs whitespace-pre-wrap leading-relaxed break-words text-slate-600">{day.content}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}