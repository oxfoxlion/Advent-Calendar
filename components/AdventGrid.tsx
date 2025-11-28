'use client';
import { DayContent } from '@/lib/sdk/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Play, X } from 'lucide-react'; // Youtube icon 未被使用可移除
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

// 舊版相容
const CARD_DEFAULTS: Record<string, string> = {
  classic: 'custom-card:#7f1d1d',
  winter: 'custom-card:#1e293b',
  cozy: 'custom-card:#78350f',
  sugar: 'custom-card:#fb7185',
};

const LOCKED_STYLE = "bg-black/60 border border-white/10 text-white/30 cursor-not-allowed backdrop-blur-sm";

// 提取 YouTube ID 的輔助函式
function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function AdventGrid({ days, slug, cardStyle, isAdmin = false }: { 
  days: DayContent[], 
  slug: string, 
  cardStyle: string,
  isAdmin?: boolean 
}) {
  const [opened, setOpened] = useState<number[]>([]);
  // 用來控制 Modal 顯示的狀態，存的是要播放的 YouTube ID
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`advent-${slug}`) || '[]');
    setOpened(saved);
  }, [slug]);

  const handleOpen = (day: DayContent) => {
    // 1. 如果是被鎖住的卡片 (時間未到且非管理員)，直接略過
    if (day.isLocked) return;

    // 2. 檢查這張卡片是否已經開啟
    if (opened.includes(day.day)) {
      // ★ 關鍵修改：如果是管理員，允許「關閉」(翻轉回去)
      if (isAdmin) {
        const newOpened = opened.filter(d => d !== day.day);
        setOpened(newOpened);
        localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
      }
      // 一般使用者點擊已開啟的卡片不做任何事 (return)
      return;
    }

    // 3. 尚未開啟 -> 執行開啟
    const newOpened = [...opened, day.day];
    setOpened(newOpened);
    localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
  };

  // 處理點擊觀看影片
  const handleWatchVideo = (e: React.MouseEvent, url: string) => {
    e.stopPropagation(); // 防止觸發卡片翻轉或其他事件
    const videoId = getYouTubeId(url);
    if (videoId) {
      setActiveVideoId(videoId);
    } else {
      // 如果解析失敗，就直接開新分頁
      window.open(url, '_blank');
    }
  };

  // 解析卡片顏色
  const normalizedCardStyle = cardStyle.startsWith('custom-card:')
    ? cardStyle
    : (CARD_DEFAULTS[cardStyle] || CARD_DEFAULTS.classic);
    
  const cardColor = normalizedCardStyle.replace('custom-card:', '');

  return (
    <>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-20 px-4">
        {days.map((day) => {
          const isOpened = opened.includes(day.day);
          
          return (
            <div key={day.day} className="aspect-square relative perspective-1000 group" onClick={() => handleOpen(day)}>
              <motion.div
                className={clsx("w-full h-full relative preserve-3d transition-all duration-700", !day.isLocked && "cursor-pointer")}
                animate={{ rotateY: isOpened ? 180 : 0 }}
              >
                {/* --- 正面 (未開啟) --- */}
                <div 
                  className={clsx(
                    "absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center transition-all shadow-lg border border-white/10",
                    day.isLocked ? LOCKED_STYLE : "hover:brightness-110"
                  )}
                  style={!day.isLocked ? { backgroundColor: cardColor, color: 'white' } : {}}
                >
                  <span className="text-3xl font-bold drop-shadow-md">{day.day}</span>
                  {day.isLocked ? (
                    <Lock className="w-4 h-4 mt-2 opacity-50"/>
                  ) : (
                    <Star className="w-4 h-4 mt-2 animate-pulse opacity-80"/>
                  )}
                </div>

                {/* --- 背面 (已開啟) --- */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden text-slate-900 border-4 border-white/50">
                  {/* 標題 (所有類型都顯示) */}
                  {day.title && <h3 className="font-bold mb-2 text-sm text-slate-700 shrink-0">{day.title}</h3>}

                  {/* 根據類型顯示不同內容 */}
                  {day.type === 'image' && day.content ? (
                    <img src={day.content} alt="Gift" className="w-full h-full object-cover rounded" />
                  ) : (day.type === 'video' || day.type === 'youtube') && day.content ? (
                    <div className="flex flex-col items-center justify-center h-full w-full gap-3">
                      <p className="text-xs text-slate-500 line-clamp-2 px-2">
                        {/* 這裡可以放一段引言，或者就單純顯示按鈕 */}
                        點擊下方按鈕播放驚喜影片
                      </p>
                      <button 
                        onClick={(e) => handleWatchVideo(e, day.content!)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold transition shadow-md hover:scale-105 active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        播放影片
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-full w-full scrollbar-thin scrollbar-thumb-slate-200">
                      <p className="text-xs whitespace-pre-wrap leading-relaxed break-words text-slate-600">{day.content}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* --- YouTube Modal --- */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setActiveVideoId(null)} // 點擊背景關閉
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()} // 點擊內容不關閉
            >
              <button 
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}