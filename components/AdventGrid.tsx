'use client';
// ... (保留 imports)
import { DayContent } from '@/lib/sdk/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Play, X, HelpCircle, CheckCircle2, XCircle, Trophy, Youtube, Image as ImageIcon, Music, Map as MapIcon, Ticket, Feather } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// ... (Card defaults, locked style, getYouTubeId, getSpotifyEmbedUrl 等保持不變) ...
const CARD_DEFAULTS: Record<string, string> = {
  classic: 'custom-card:#7f1d1d',
  winter: 'custom-card:#1e293b',
  cozy: 'custom-card:#78350f',
  sugar: 'custom-card:#fb7185',
};
const LOCKED_STYLE = "bg-black/60 border border-white/10 text-white/30 cursor-not-allowed backdrop-blur-sm";

function getYouTubeId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function getSpotifyEmbedUrl(url: string) {
  if (!url) return '';

  // 1. 如果網址已經包含 /embed/，就直接回傳
  if (url.includes('/embed/')) return url;

  // 2. 將一般網址轉換為 embed 網址
  // 例如: open.spotify.com/track/xxx -> open.spotify.com/embed/track/xxx
  return url
    .replace('open.spotify.com/track', 'open.spotify.com/embed/track')
    .replace('open.spotify.com/playlist', 'open.spotify.com/embed/playlist')
    .replace('open.spotify.com/album', 'open.spotify.com/embed/album')
    .replace('open.spotify.com/episode', 'open.spotify.com/embed/episode');
}

// ★ 修改：解析函式加入刮刮樂資料
function parseContent(content: string | null, type: string) {
  if (!content) return { url: '', description: '', text: '', location: '', quiz: null, isImage: false };
  try {
    const data = JSON.parse(content);
    if (typeof data !== 'object') return { url: '', description: '', text: content, location: '', quiz: null, isImage: false };

    if (type === 'quiz') return { quiz: data, url: '', description: '', text: '', location: '', isImage: false };
    if (type === 'map') return { location: data.location, description: data.description, url: '', text: '', quiz: null, isImage: false };
    // ★ 處理刮刮樂
    if (type === 'scratch') return {
      isImage: data.isImage,
      url: data.url || '',
      text: data.text || '',
      description: '', location: '', quiz: null
    };

    return { url: data.url, description: data.description || '', text: '', location: '', quiz: null, isImage: false };
  } catch (e) {
    return { text: content, url: '', description: '', location: '', quiz: null, isImage: false };
  }
}

// ... (QuizCard 保持不變) ...
function QuizCard({ data, onClose }: { data: any, onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selected, setSelected] = useState<string | null>(null);

  const handleAnswer = (option: string) => {
    if (status === 'correct') return;
    setSelected(option);
    if (option === data.answer) { setStatus('correct'); } else { setStatus('wrong'); setTimeout(() => setStatus('idle'), 1000); }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm"><HelpCircle className="w-6 h-6" /></div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 leading-normal">{data.question}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3 w-full mt-2">
        {data.options?.map((opt: string, i: number) => {
          const isSelected = selected === opt;
          let btnStyle = "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-indigo-300";
          if (isSelected && status === 'correct') btnStyle = "bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300";
          else if (isSelected && status === 'wrong') btnStyle = "bg-rose-500 text-white border-rose-600 animate-shake";
          else if (status === 'correct' && opt === data.answer) btnStyle = "bg-emerald-100 text-emerald-700 border-emerald-300";
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={status === 'correct'} className={`py-4 px-6 rounded-xl text-base md:text-lg font-bold transition-all border-2 flex items-center justify-between group active:scale-[0.98] ${btnStyle}`}>
              <span>{opt}</span>
              {isSelected && status === 'correct' && <CheckCircle2 className="w-6 h-6" />}
              {isSelected && status === 'wrong' && <XCircle className="w-6 h-6" />}
            </button>
          );
        })}
      </div>
      {status === 'correct' && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md rounded-2xl">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h4 className="text-2xl font-extrabold text-emerald-600 mb-2">答對了！</h4>
          <p className="text-slate-500 font-medium mb-6">太厲害了，聖誕快樂！</p>
          <button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-200 transition active:scale-95">關閉視窗</button>
        </motion.div>
      )}
    </div>
  );
}

// ★ 修改：ScratchCard 支援圖片
function ScratchCard({ data }: { data: { isImage: boolean, text: string, url: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // 塗上銀漆
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 文字
    ctx.fillStyle = '#909090';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ 刮開我 ✨', canvas.width / 2, canvas.height / 2);

    ctx.globalCompositeOperation = 'destination-out';

    let isDrawing = false;
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    };

    const start = () => { isDrawing = true; };
    const end = () => { isDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', end);

    return () => {
      canvas.removeEventListener('mousedown', start);
      // ... cleanup
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-64 rounded-xl overflow-hidden bg-white border-2 border-slate-100 shadow-inner">
      {/* ★ 底層內容：判斷是文字還是圖片 */}
      <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden">
        {data.isImage ? (
          <img src={data.url} alt="Hidden Prize" className="w-full h-full object-cover" />
        ) : (
          <p className="text-xl font-bold text-slate-800 leading-relaxed whitespace-pre-wrap text-center p-6">{data.text}</p>
        )}
      </div>
      {/* 頂層畫布 */}
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none z-10" style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

// ... (TypewriterCard, ActiveMedia 保持不變) ...
function TypewriterCard({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // 1. 初始化
    setDisplayedText('');
    let currentIndex = 0;

    const timer = setInterval(() => {
      // ★ 關鍵修改：使用 slice(0, currentIndex) 絕對定位
      // 這樣保證顯示的內容永遠等於原始文字的前 N 個字，絕對不會漏字
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;
      }
      else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="w-full h-full min-h-[200px] p-6 bg-slate-50 rounded-xl border border-slate-200 font-mono text-slate-700 leading-loose whitespace-pre-wrap overflow-y-auto">
      {displayedText}<span className="animate-pulse ml-1">|</span>
    </div>
  );
}

type ActiveMedia = { type: string, data: any } | null;

export default function AdventGrid({ days, slug, cardStyle, isAdmin = false }: {
  days: DayContent[], slug: string, cardStyle: string, isAdmin?: boolean
}) {
  const [opened, setOpened] = useState<number[]>([]);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`advent-${slug}`) || '[]');
    setOpened(saved);
  }, [slug]);

  const handleOpen = (day: DayContent) => {
    if (day.isLocked) return;
    if (opened.includes(day.day)) {
      if (isAdmin) {
        const newOpened = opened.filter(d => d !== day.day);
        setOpened(newOpened);
        localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
      }
      return;
    }
    const newOpened = [...opened, day.day];
    setOpened(newOpened);
    localStorage.setItem(`advent-${slug}`, JSON.stringify(newOpened));
  };

  const handleOpenModal = (e: React.MouseEvent, type: string, rawContent: string) => {
    e.stopPropagation();
    const parsed = parseContent(rawContent, type);
    setActiveMedia({ type, data: parsed });
  };

  const normalizedCardStyle = cardStyle.startsWith('custom-card:') ? cardStyle : (CARD_DEFAULTS[cardStyle] || CARD_DEFAULTS.classic);
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
                {/* --- 正面 --- */}
                <div
                  className={clsx("absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center transition-all shadow-lg border border-white/10", day.isLocked ? LOCKED_STYLE : "hover:brightness-110")}
                  style={!day.isLocked ? { backgroundColor: cardColor, color: 'white' } : {}}
                >
                  <span className="text-3xl font-bold drop-shadow-md">{day.day}</span>
                  {day.isLocked ? <Lock className="w-4 h-4 mt-2 opacity-50" /> : <Star className="w-4 h-4 mt-2 animate-pulse opacity-80" />}
                </div>

                {/* --- 背面 --- */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden text-slate-900 border-4 border-white/50">
                  <h3 className="font-bold mb-2 text-sm text-slate-700 shrink-0 truncate w-full">{day.title || `Day ${day.day}`}</h3>

                  {day.type === 'quiz' && (
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="w-8 h-8 text-amber-400 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">聖誕大考驗</p>
                      <button onClick={(e) => handleOpenModal(e, 'quiz', day.content!)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition">開始挑戰</button>
                    </div>
                  )}
                  {day.type === 'image' && (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-8 h-8 text-sky-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">驚喜照片</p>
                      <button onClick={(e) => handleOpenModal(e, 'image', day.content!)} className="bg-sky-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition">查看</button>
                    </div>
                  )}
                  {(day.type === 'video' || day.type === 'youtube') && (
                    <div className="flex flex-col items-center gap-2">
                      <Youtube className="w-8 h-8 text-red-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">驚喜影片</p>
                      <button onClick={(e) => handleOpenModal(e, 'video', day.content!)} className="flex items-center gap-1 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition"><Play className="w-3 h-3 fill-current" />播放</button>
                    </div>
                  )}
                  {day.type === 'spotify' && (
                    <div className="flex flex-col items-center gap-2">
                      <Music className="w-8 h-8 text-emerald-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">點播歌曲</p>
                      <button onClick={(e) => handleOpenModal(e, 'spotify', day.content!)} className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition flex items-center gap-1"><Play className="w-3 h-3 fill-current" />聆聽</button>
                    </div>
                  )}
                  {day.type === 'map' && (
                    <div className="flex flex-col items-center gap-2">
                      <MapIcon className="w-8 h-8 text-orange-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">神秘地點</p>
                      <button onClick={(e) => handleOpenModal(e, 'map', day.content!)} className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition">查看地圖</button>
                    </div>
                  )}
                  {day.type === 'scratch' && (
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="w-8 h-8 text-slate-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">刮刮樂</p>
                      <button onClick={(e) => handleOpenModal(e, 'scratch', day.content!)} className="bg-slate-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition">開始刮</button>
                    </div>
                  )}
                  {day.type === 'typewriter' && (
                    <div className="flex flex-col items-center gap-2">
                      <Feather className="w-8 h-8 text-pink-500 drop-shadow-sm" />
                      <p className="text-xs text-slate-500 font-bold">給你的信</p>
                      <button onClick={(e) => handleOpenModal(e, 'typewriter', day.content!)} className="bg-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition">閱讀</button>
                    </div>
                  )}
                  {day.type === 'text' && (
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

      <AnimatePresence>
        {activeMedia && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setActiveMedia(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full flex flex-col gap-4 ${activeMedia.type === 'quiz' ? 'max-w-lg bg-white p-8 rounded-3xl' : 'max-w-4xl'}`} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setActiveMedia(null)} className={`absolute z-50 p-2 rounded-full transition ${activeMedia.type === 'quiz' ? 'top-4 right-4 text-slate-400 hover:bg-slate-100' : '-top-12 right-0 bg-white/20 hover:bg-white/40 text-white'}`}><X className="w-6 h-6" /></button>

              {activeMedia.type === 'quiz' && <QuizCard data={activeMedia.data.quiz} onClose={() => setActiveMedia(null)} />}

              {activeMedia.type === 'video' && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeId(activeMedia.data.url)}?autoplay=1&rel=0`} title="YouTube" allow="autoplay; encrypted-media" allowFullScreen className="absolute inset-0" />
                </div>
              )}

              {activeMedia.type === 'image' && (
                <img src={activeMedia.data.url} alt="Surprise" className="w-auto h-auto max-h-[75vh] max-w-full rounded-lg shadow-2xl object-contain mx-auto" />
              )}

              {activeMedia.type === 'spotify' && (
                <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe style={{ borderRadius: 12 }} src={getSpotifyEmbedUrl(activeMedia.data.url)} width="100%" height="352" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
              )}

              {activeMedia.type === 'map' && (
                <div className="aspect-square md:aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMedia.data.location)}&output=embed`}></iframe>
                </div>
              )}

              {activeMedia.type === 'scratch' && (
                <div className="bg-white p-4 rounded-3xl shadow-2xl">
                  {/* ★ 這裡會自動根據 data.isImage 決定顯示圖片還是文字刮刮樂 */}
                  <ScratchCard data={activeMedia.data} />
                  <p className="text-center text-slate-400 text-xs mt-4">用滑鼠或手指刮開銀漆</p>
                </div>
              )}

              {activeMedia.type === 'typewriter' && (
                <div className="bg-white p-8 rounded-3xl shadow-2xl min-h-[300px]">
                  <TypewriterCard text={activeMedia.data.text} />
                </div>
              )}

              {activeMedia.data.description && (
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-white text-center border border-white/10 shadow-lg mt-4">
                  <p className="text-sm font-medium leading-relaxed">{activeMedia.data.description}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}