'use client';
import { DayContent } from '@/lib/sdk/types';
import { motion} from 'framer-motion';
import { Lock, Star} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

export default function AdventGrid({ days, slug, themeColor }: { days: DayContent[], slug: string, themeColor: string }) {
  // 簡易版 LocalStorage Hook
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

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
      {days.map((day) => {
        const isOpened = opened.includes(day.day);
        
        return (
          <div key={day.day} className="aspect-square relative perspective-1000" onClick={() => handleOpen(day)}>
            <motion.div
              className={clsx("w-full h-full relative preserve-3d transition-all duration-700 cursor-pointer")}
              animate={{ rotateY: isOpened ? 180 : 0 }}
            >
              {/* 正面 (蓋著) */}
              <div className={clsx(
                "absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center border-2 shadow-lg",
                day.isLocked ? "bg-slate-800 border-slate-700 text-gray-500" : `bg-${themeColor}-600 border-${themeColor}-400 text-white hover:brightness-110`
              )}>
                <span className="text-3xl font-bold">{day.day}</span>
                {day.isLocked ? <Lock className="w-4 h-4 mt-2 opacity-50"/> : <Star className="w-4 h-4 mt-2 animate-pulse"/>}
              </div>

              {/* 背面 (內容) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden text-slate-900">
                {day.type === 'image' && day.content ? (
                  <img src={day.content} alt="Gift" className="w-full h-full object-cover rounded" />
                ) : (
                   // 文字內容
                  <div className="overflow-y-auto max-h-full">
                    <h3 className="font-bold mb-2 text-sm">{day.title}</h3>
                    <p className="text-xs whitespace-pre-wrap">{day.content}</p>
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