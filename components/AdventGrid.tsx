'use client';

import { DayContent } from '@/lib/sdk/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Star,
  Play,
  X,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Youtube,
  Image as ImageIcon,
  Music,
  Map as MapIcon,
  Ticket,
  Feather,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { useState, useEffect, useRef, type SyntheticEvent } from 'react';
import { clsx } from 'clsx';

const CARD_DEFAULTS: Record<string, string> = {
  classic: 'custom-card:#7f1d1d',
  winter: 'custom-card:#1e293b',
  cozy: 'custom-card:#78350f',
  sugar: 'custom-card:#fb7185',
};

const LOCKED_STYLE =
  'bg-black/60 border border-white/10 text-white/30 cursor-not-allowed backdrop-blur-sm';

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getSpotifyEmbedUrl(url: string) {
  if (!url) return '';

  if (url.includes('/embed/')) return url;

  return url
    .replace('open.spotify.com/track', 'open.spotify.com/embed/track')
    .replace('open.spotify.com/playlist', 'open.spotify.com/embed/playlist')
    .replace('open.spotify.com/album', 'open.spotify.com/embed/album')
    .replace('open.spotify.com/episode', 'open.spotify.com/embed/episode');
}

// 解析內容（包含 quiz / map / scratch / typewriter / link）
function parseContent(content: string | null, type: string) {
  if (!content)
    return {
      url: '',
      description: '',
      text: '',
      location: '',
      quiz: null,
      isImage: false,
    };

  try {
    const data = JSON.parse(content);
    if (typeof data !== 'object')
      return {
        url: '',
        description: '',
        text: content,
        location: '',
        quiz: null,
        isImage: false,
      };

    if (type === 'quiz')
      return {
        quiz: data,
        url: '',
        description: '',
        text: '',
        location: '',
        isImage: false,
      };

    if (type === 'map')
      return {
        location: data.location,
        description: data.description,
        url: '',
        text: '',
        quiz: null,
        isImage: false,
      };

    if (type === 'scratch')
      return {
        isImage: data.isImage,
        url: data.url || '',
        text: data.text || '',
        description: '',
        location: '',
        quiz: null,
      };

    // image / video / spotify / typewriter / link 等一般媒體
    return {
      url: data.url,
      description: data.description || '',
      text: data.text || '',
      location: '',
      quiz: null,
      isImage: false,
    };
  } catch (e) {
    return {
      text: content,
      url: '',
      description: '',
      location: '',
      quiz: null,
      isImage: false,
    };
  }
}

// Quiz Card (保持不變)
function QuizCard({ data, onClose }: { data: any; onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selected, setSelected] = useState<string | null>(null);

  const handleAnswer = (option: string) => {
    if (status === 'correct') return;
    setSelected(option);
    if (option === data.answer) {
      setStatus('correct');
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 1000);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-normal">
          {data.question}
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-3 w-full mt-2">
        {data.options?.map((opt: string, i: number) => {
          const isSelected = selected === opt;
          let btnStyle =
            'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-indigo-300';

          if (isSelected && status === 'correct')
            btnStyle =
              'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300';
          else if (isSelected && status === 'wrong')
            btnStyle =
              'bg-rose-500 text-white border-rose-600 animate-shake';
          else if (status === 'correct' && opt === data.answer)
            btnStyle =
              'bg-emerald-100 text-emerald-700 border-emerald-300';

          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={status === 'correct'}
              className={`py-4 px-6 rounded-xl text-base md:text-lg font-bold transition-all border-2 flex items-center justify-between group active:scale-[0.98] ${btnStyle}`}
            >
              <span>{opt}</span>
              {isSelected && status === 'correct' && (
                <CheckCircle2 className="w-6 h-6" />
              )}
              {isSelected && status === 'wrong' && (
                <XCircle className="w-6 h-6" />
              )}
            </button>
          );
        })}
      </div>
      {status === 'correct' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-2xl"
        >
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h4 className="text-2xl font-extrabold text-emerald-600 mb-2">
            答對了！
          </h4>
          <p className="text-slate-500 font-medium mb-6">
            太厲害了，聖誕快樂！
          </p>
          <button
            onClick={onClose}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 transition active:scale-95"
          >
            關閉視窗
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Scratch Card (保持不變)
function ScratchCard({
  data,
}: {
  data: { isImage: boolean; text: string; url: string };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || 0;

    if (canvas.width === 0 || canvas.height === 0) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#909090';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ 刮開我 ✨', canvas.width / 2, canvas.height / 2);

    ctx.globalCompositeOperation = 'destination-out';
  };

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget as HTMLImageElement;
    const container = containerRef.current;
    if (!container) return;
    container.style.height = img.clientHeight + 'px';
    drawOverlay();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    drawOverlay();

    let isDrawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX =
        'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY =
        'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    };

    const start = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      draw(e);
    };

    const end = () => {
      isDrawing = false;
    };

    const handleMouseDown = (e: MouseEvent) => start(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => end();
    const handleMouseLeave = () => end();

    const handleTouchStart = (e: TouchEvent) => start(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => end();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    canvas.addEventListener('touchmove', handleTouchMove, {
      passive: false,
    });
    canvas.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      drawOverlay();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative w-full rounded-xl overflow-hidden bg-white border-2 border-slate-100 shadow-inner',
        !data.isImage && 'h-64'
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
        {data.isImage ? (
          <img
            src={data.url}
            alt="Hidden Prize"
            className="w-full h-auto max-h-[70vh] object-contain"
            onLoad={handleImageLoad}
          />
        ) : (
          <p className="text-xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap text-center p-6">
            {data.text}
          </p>
        )}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair touch-none z-10"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

// Typewriter Card (保持不變)
function TypewriterCard({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [text]);

  // 每次文字更新時，自動捲到最底
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [displayedText]);

  return (
    <div
      ref={containerRef}
      className="
        w-full
        min-h-[200px]
        max-h-[70vh]
        p-6
        bg-slate-50
        rounded-xl
        border
        border-slate-200
        font-mono
        text-slate-700
        leading-loose
        whitespace-pre-wrap
        overflow-y-auto
      "
    >
      {displayedText}
      <span className="animate-pulse ml-1">|</span>
    </div>
  );
}

type ActiveMedia = { type: string; data: any } | null;

export default function AdventGrid({
  days,
  slug,
  cardStyle,
  isAdmin = false,
}: {
  days: DayContent[];
  slug: string;
  cardStyle: string;
  isAdmin?: boolean;
}) {
  const [opened, setOpened] = useState<number[]>([]);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia>(null);

  // Modal 開啟時鎖住背景卷動
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (activeMedia) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow;
    }

    // 保險：元件 unmount 時也恢復
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeMedia]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(`advent-${slug}`) || '[]'
    );
    setOpened(saved);
  }, [slug]);

  const handleOpen = (day: DayContent) => {
    if (day.isLocked) return;

    if (opened.includes(day.day)) {
      if (isAdmin) {
        const newOpened = opened.filter((d) => d !== day.day);
        setOpened(newOpened);
        localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
      }
      return;
    }

    const newOpened = [...opened, day.day];
    setOpened(newOpened);
    localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
  };

  const handleOpenModal = (
    e: React.MouseEvent,
    type: string,
    rawContent: string
  ) => {
    e.stopPropagation();
    const parsed = parseContent(rawContent, type);
    setActiveMedia({ type, data: parsed });
  };

  const normalizedCardStyle = cardStyle.startsWith('custom-card:')
    ? cardStyle
    : CARD_DEFAULTS[cardStyle] || CARD_DEFAULTS.classic;
  const cardColor = normalizedCardStyle.replace('custom-card:', '');

  return (
    <>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 pb-20 px-4">
        {days.map((day) => {
          const isOpened = opened.includes(day.day);

          return (
            <div
              key={day.day}
              className="aspect-square relative perspective-1000 group"
              onClick={() => handleOpen(day)}
            >
              <motion.div
                className={clsx(
                  'w-full h-full relative preserve-3d transition-all duration-700',
                  !day.isLocked && 'cursor-pointer'
                )}
                animate={{ rotateY: isOpened ? 180 : 0 }}
              >
                {/* 正面 */}
                <div
                  className={clsx(
                    'absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center transition-all shadow-lg border border-white/10',
                    day.isLocked
                      ? LOCKED_STYLE
                      : 'hover:brightness-110'
                  )}
                  style={
                    !day.isLocked
                      ? { backgroundColor: cardColor, color: 'white' }
                      : {}
                  }
                >
                  <span className="text-3xl font-bold drop-shadow-md">
                    {day.day}
                  </span>
                  {day.isLocked ? (
                    <Lock className="w-4 h-4 mt-2 opacity-50" />
                  ) : (
                    <Star className="w-4 h-4 mt-2 animate-pulse opacity-80" />
                  )}
                </div>

                {/* 背面 */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden text-slate-900 border-4 border-white/50">
                  <h3 className="font-bold mb-2 text-sm text-slate-700 shrink-0 truncate w-full">
                    {day.title || `Day ${day.day}`}
                  </h3>

                  {day.type === 'quiz' && (
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="w-8 h-8 text-amber-400 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        聖誕大考驗
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'quiz', day.content!)
                        }
                        className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        開始挑戰
                      </button>
                    </div>
                  )}

                  {day.type === 'image' && (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-sky-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        驚喜照片
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'image', day.content!)
                        }
                        className="bg-sky-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        查看
                      </button>
                    </div>
                  )}

                  {(day.type === 'video' || day.type === 'youtube') && (
                    <div className="flex flex-col items-center gap-2">
                      <Youtube className="w-8 h-8 text-red-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        驚喜影片
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'video', day.content!)
                        }
                        className="flex items-center gap-1 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        播放
                      </button>
                    </div>
                  )}

                  {day.type === 'spotify' && (
                    <div className="flex flex-col items-center gap-2">
                      <Music className="w-8 h-8 text-emerald-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        點播歌曲
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'spotify', day.content!)
                        }
                        className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        聆聽
                      </button>
                    </div>
                  )}

                  {day.type === 'map' && (
                    <div className="flex flex-col items-center gap-2">
                      <MapIcon className="w-8 h-8 text-orange-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        神秘地點
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'map', day.content!)
                        }
                        className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        查看地圖
                      </button>
                    </div>
                  )}

                  {day.type === 'scratch' && (
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="w-8 h-8 text-slate-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        刮刮樂
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'scratch', day.content!)
                        }
                        className="bg-slate-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        開始刮
                      </button>
                    </div>
                  )}

                  {day.type === 'typewriter' && (
                    <div className="flex flex-col items-center gap-2">
                      <Feather className="w-8 h-8 text-pink-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        給你的信
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'typewriter', day.content!)
                        }
                        className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        閱讀
                      </button>
                    </div>
                  )}

                  {/* 新增 Link 類型顯示 */}
                  {day.type === 'link' && (
                    <div className="flex flex-col items-center gap-2">
                      <ExternalLink className="w-8 h-8 text-blue-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">
                        外部連結
                      </p>
                      <button
                        onClick={(e) =>
                          handleOpenModal(e, 'link', day.content!)
                        }
                        className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"
                      >
                        打開連結
                      </button>
                    </div>
                  )}

                  {day.type === 'text' && day.content && (
                    <div
                      className="overflow-y-auto max-h-full w-full scrollbar-thin scrollbar-thumb-slate-200 cursor-pointer group"
                      onClick={(e) => handleOpenModal(e, 'text', day.content!)}
                    >
                      <p className="text-xs whitespace-pre-wrap leading-relaxed break-words text-slate-600 line-clamp-6 md:line-clamp-8 group-hover:text-slate-800">
                        {day.content}
                      </p>
                      <p className="mt-2 text-[10px] text-slate-400 italic text-right">
                        點擊卡片放大閱讀
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setActiveMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={clsx(
                'relative w-full max-h-[90vh]',
                (activeMedia.type === 'quiz' || activeMedia.type === 'link')
                  ? 'max-w-lg'
                  : 'max-w-4xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 關閉按鈕：絕對定位，不佔版面、不會擠圖片 */}
              <button
                onClick={() => setActiveMedia(null)}
                className={clsx(
                  'absolute z-50 p-2 rounded-full transition',
                  (activeMedia.type === 'quiz' || activeMedia.type === 'link')
                    ? 'top-4 right-4 text-slate-400 hover:bg-slate-100 bg-white'
                    : '-top-12 right-0 bg-white/20 hover:bg-white/40 text-white'
                )}
              >
                <X className="w-6 h-6" />
              </button>

              {/* 內層才捲動的內容區 */}
              <div
                className={clsx(
                  'flex flex-col gap-4 overflow-y-auto max-h-[90vh]',
                  (activeMedia.type === 'quiz' || activeMedia.type === 'link') &&
                  'bg-white p-8 rounded-3xl'
                )}
              >
                {activeMedia.type === 'quiz' && (
                  <QuizCard
                    data={activeMedia.data.quiz}
                    onClose={() => setActiveMedia(null)}
                  />
                )}

                {/* Link 的確認視窗 */}
                {activeMedia.type === 'link' && (
                  <div className="text-center w-full">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LinkIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      即將前往外部網站
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      您確定要離開此頁面嗎？<br />這將會開啟一個新的視窗。
                    </p>

                    {activeMedia.data.description && (
                      <div className="bg-slate-50 p-4 rounded-xl text-slate-600 text-sm mb-6 border border-slate-100 break-words">
                        {activeMedia.data.description}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => setActiveMedia(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        取消
                      </button>
                      <a
                        href={activeMedia.data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setActiveMedia(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2"
                      >
                        前往 <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}

                {activeMedia.type === 'video' && (
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        activeMedia.data.url
                      )}?autoplay=1&rel=0`}
                      title="YouTube"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      className="absolute inset-0"
                    />
                  </div>
                )}

                {activeMedia.type === 'image' && (
                  <img
                    src={activeMedia.data.url}
                    alt="Surprise"
                    className="w-auto h-auto max-h-[55vh] max-w-full rounded-lg shadow-2xl object-contain mx-auto"
                  />
                )}

                {activeMedia.type === 'spotify' && (
                  <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe
                      style={{ borderRadius: 12 }}
                      src={getSpotifyEmbedUrl(activeMedia.data.url)}
                      width="100%"
                      height="352"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                )}

                {activeMedia.type === 'map' && (
                  <div className="aspect-square md:aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        activeMedia.data.location
                      )}&output=embed`}
                    ></iframe>
                  </div>
                )}

                {activeMedia.type === 'scratch' && (
                  <div className="bg-white p-4 rounded-3xl shadow-2xl">
                    <ScratchCard data={activeMedia.data} />
                    <p className="text-center text-slate-400 text-xs mt-4">
                      用滑鼠或手指刮開銀漆
                    </p>
                  </div>
                )}

                {activeMedia.type === 'typewriter' && (
                  <div className="bg-white p-8 rounded-3xl shadow-2xl min-h-[300px]">
                    <TypewriterCard text={activeMedia.data.text} />
                  </div>
                )}

                {activeMedia.type === 'text' && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl max-h-[70vh] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-base md:text-lg">
                      {activeMedia.data.text}
                    </p>
                  </div>
                )}

                {activeMedia.data.description && activeMedia.type !== 'link' && (
                  <div className="max-h-[20vh] overflow-y-auto bg-white/10 backdrop-blur-md p-4 rounded-xl text-white text-center border border-white/10 shadow-lg mt-4">
                    <p className="text-sm font-medium leading-relaxed">
                      {activeMedia.data.description}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}