'use client';

import { createCalendar } from './actions';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Edit, X, ArrowRight, Palette, Sparkles, SmilePlus, Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

export default function Home() {
  const router = useRouter();
  
  // 1. 外觀狀態
  const [bgStart, setBgStart] = useState('#FDF6E3'); 
  const [bgEnd, setBgEnd] = useState('#5997D9');   
  const [cardColor, setCardColor] = useState('#FFCB5C');
  const [pattern, setPattern] = useState('❄️');
  const [quantity, setQuantity] = useState(20);
  const [size, setSize] = useState(1);
  const [rotation, setRotation] = useState(45);
  const [animation, setAnimation] = useState('float');

  // 2. 表單與互動狀態
  const [isPending, setIsPending] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState('');
  
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [accessError, setAccessError] = useState('');

  // 3. 日期設定
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 24);
  const defaultEndStr = defaultEnd.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayCount = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const isInvalidDate = dayCount < 2 || dayCount > 30;

  // 密碼顯示狀態
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showAccessPass, setShowAccessPass] = useState(false);

  const slugRef = useRef<HTMLInputElement>(null);
  const accessCodeRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugError('');
    const val = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    setSlugInput(val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isInvalidDate) return;

    setIsPending(true);
    setSlugError('');
    setAccessError('');

    const formData = new FormData(e.currentTarget);
    const bgConfig = `custom-bg:${bgStart},${bgEnd},${pattern},${quantity},${size},${rotation},${animation}`;
    formData.set('background', bgConfig);
    formData.set('cardStyle', `custom-card:${cardColor}`);
    formData.set('themeColor', 'custom'); 
    formData.set('slug', slugInput); 
    formData.set('startDate', startDate);
    formData.set('endDate', endDate);

    await new Promise(resolve => setTimeout(resolve, 1500));
    const res = await createCalendar(formData);
    
    if (res && !res.success) {
      setIsPending(false);
      if (res.field === 'slug') {
        setSlugError(res.message);
        setTimeout(() => slugRef.current?.focus(), 100);
        slugRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (res.field === 'accessCode') {
        setAccessError(res.message);
        setTimeout(() => accessCodeRef.current?.focus(), 100);
        accessCodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setSlugError(res.message);
        slugRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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
      <BackgroundDecoration pattern={pattern} quantity={quantity} size={size} rotation={rotation} animation={animation as any} />

      <div className="max-w-xl w-full space-y-8 relative z-10">
        
        <div className="absolute -top-16 right-0 md:-right-4">
          <button type="button" onClick={() => setShowEditModal(true)} className="flex items-center gap-2 text-slate-700/80 hover:text-slate-900 bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all">
            <Edit className="w-4 h-4" /> 編輯日曆
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-slate-800 drop-shadow-sm tracking-tight">
            倒數日曆
          </h1>
          <p className="mt-3 text-slate-600 font-medium">為任何重要的日子準備專屬驚喜</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-2xl relative z-20">
          <div className="space-y-6">
            
            {/* 降臨曆名稱與網址 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">日曆名稱</label>
                <input name="recipientName" required type="text" placeholder="例如：給米茶的紀念日驚喜" 
                  className="block w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">自訂網址</label>
                <input 
                  ref={slugRef}
                  name="slug" required type="text" value={slugInput} onChange={handleSlugChange} placeholder="例如：anniversary-2025" 
                  className={`block w-full rounded-xl bg-white border text-slate-800 p-3 focus:ring-2 outline-none font-mono text-sm transition shadow-sm ${
                    slugError ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-indigo-500'
                  }`} 
                />
                {slugError && <p className="text-xs text-rose-500 mt-1 pl-1 font-bold flex items-center gap-1 animate-pulse">🚫 {slugError}</p>}
              </div>
            </div>

            {/* 日期區間設定 */}
            <div className="bg-white/50 p-4 rounded-2xl border border-white/50 space-y-4 shadow-sm">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-500" /> 設定倒數日期區間
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">開始日期</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl bg-white border-slate-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1 ml-1">結束日期</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl bg-white border-slate-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm" />
                </div>
              </div>
              <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                isInvalidDate ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <Clock className="w-3.5 h-3.5" /> 總天數：{dayCount} 天 {isInvalidDate && "(限制 2 ~ 30 天)"}
              </div>
            </div>

            {/* 密碼設定 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">管理員密碼</label>
                <div className="relative">
                  <input name="adminCode" required type={showAdminPass ? "text" : "password"} placeholder="自訂密碼" 
                    className="w-full rounded-xl bg-white border-slate-200 text-slate-800 p-3 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                  <button type="button" onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showAdminPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">訪客密碼 (選填)</label>
                <div className="relative">
                  <input ref={accessCodeRef} name="accessCode" type={showAccessPass ? "text" : "password"} placeholder="留空則公開" onChange={() => setAccessError('')}
                    className={`w-full rounded-xl bg-white border p-3 pr-10 focus:ring-2 outline-none shadow-sm ${
                      accessError ? 'border-rose-300 focus:ring-rose-500 bg-rose-50' : 'border-slate-200 focus:ring-indigo-500'
                    }`} />
                  <button type="button" onClick={() => setShowAccessPass(!showAccessPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showAccessPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {accessError && <p className="text-xs text-rose-500 mt-1 pl-1 font-bold flex items-center gap-1 animate-pulse">🚫 {accessError}</p>}
              </div>
            </div>

            <hr className="border-slate-200/60 my-2"/>

            {/* 背景設定 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. 設定背景氛圍</label>
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

            {/* 裝飾圖樣設定 (Emoji) */}
            <div className="relative" ref={pickerRef}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2. 選擇裝飾圖樣
              </label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 px-4 py-2.5 rounded-xl transition shadow-sm w-full text-left group">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-xl group-hover:scale-110 transition-transform">{pattern || <SmilePlus className="w-5 h-5 text-slate-400" />}</span>
                  <span className="flex-1 text-sm text-slate-600 font-medium">{pattern ? '點擊更換圖樣' : '選擇一個裝飾 Emoji...'}</span>
                </button>
                {pattern && (
                  <button type="button" onClick={() => setPattern('')} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200" title="清除圖樣"><X className="w-5 h-5" /></button>
                )}
              </div>
              {showEmojiPicker && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200 w-full max-w-[340px] relative z-50">
                  <EmojiPicker onEmojiClick={(e) => { setPattern(e.emoji); setShowEmojiPicker(false); }} emojiStyle={EmojiStyle.NATIVE} width="100%" height={350} searchPlaceHolder="搜尋表情符號..." previewConfig={{ showPreview: false }} />
                </div>
              )}
              {/* Emoji 動態細節設定 - 完整補回 */}
              {pattern && (
                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>數量</span><span>{quantity}</span></div>
                    <input type="range" min="0" max="50" step="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>大小</span><span>{size}x</span></div>
                    <input type="range" min="0.5" max="3" step="0.1" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>旋轉角度</span><span>±{rotation}°</span></div>
                    <input type="range" min="0" max="180" step="5" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ id: 'none', label: '🚫 無' }, { id: 'float', label: '☁️ 漂浮' }, { id: 'twinkle', label: '✨ 閃爍' }, { id: 'fall', label: '❄️ 掉落' }].map((anim) => (
                      <button key={anim.id} type="button" onClick={() => setAnimation(anim.id)} 
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition border ${animation === anim.id ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                        {anim.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 卡片主題色設定 */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. 設定卡片主色</label>
              <div className="relative h-12 w-full rounded-xl border border-slate-200 shadow-inner flex items-center px-1 bg-white overflow-hidden group">
                <div className="absolute inset-1 rounded-lg opacity-100 transition-colors duration-300 border border-black/5" style={{ backgroundColor: cardColor }} />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="flex items-center gap-2 bg-black/10 hover:bg-black/20 text-white/90 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm pointer-events-none transition-all"><Palette className="w-3 h-3" /><span>點擊更換顏色</span></div>
                   <input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={isPending || !slugInput || isInvalidDate} 
            className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none transform transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed">
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin"/><span>正在建立中...</span></> : '✨ 開始製作日曆'}
          </button>
        </form>
        
        <p className="text-center text-xs mt-12 pb-6 opacity-60 text-white">InstantCheese Shao | 2025</p>
      </div>

      {/* 編輯日曆 Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800">編輯現有日曆</h3><button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5" /></button></div>
              <form onSubmit={handleGoToEdit} className="space-y-4">
                <input autoFocus type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="例如：micha-2025" className="w-full rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-center" />
                <button type="submit" disabled={!editSlug.trim()} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition flex justify-center items-center gap-2 disabled:opacity-50">前往管理介面 <ArrowRight className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}