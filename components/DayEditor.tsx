'use client';

import { useState } from 'react';
import { updateDay } from '@/app/actions';
import { Loader2, Check, Save, Link as LinkIcon, FileText, Image as ImageIcon, Youtube, HelpCircle, Plus, Trash2, Music, Map as MapIcon, Ticket, Feather } from 'lucide-react';
import { DayContent } from '@/lib/sdk/types';

type Props = {
  slug: string;
  day: number;
  initialData?: DayContent;
};

// 預設素材
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1512389142860-9c449e58a543";
const DEFAULT_VIDEO = "https://www.youtube.com/watch?v=aAkMkVFwAoo";
const DEFAULT_SPOTIFY = "https://open.spotify.com/track/0bYg9bo50gSsH3LtXe2SQn";
const DEFAULT_MAP = "台北101";
const DEFAULT_SCRATCH_TEXT = "恭喜獲得：按摩券一張！";
const DEFAULT_TYPEWRITER = "親愛的，\n這是一封給你的信...";
const DEFAULT_TEXT = "還沒有內容喔！";

function parseJsonContent(content: string | null) {
  if (!content) return { url: '', description: '', text: '', location: '', isImage: false };
  try {
    const data = JSON.parse(content);
    return {
      url: data.url || '',
      description: data.description || '',
      text: data.text || '',
      location: data.location || '',
      isImage: data.isImage || false // ★ 新增：解析刮刮樂類型
    };
  } catch (e) {
    return { url: content, description: '', text: content, location: '', isImage: false };
  }
}

export default function DayEditor({ slug, day, initialData }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [contentType, setContentType] = useState<'text' | 'image' | 'youtube' | 'quiz' | 'spotify' | 'map' | 'scratch' | 'typewriter'>(
    (initialData?.type === 'video' ? 'youtube' : (initialData?.type || 'text')) as any
  );
  
  const parsedData = parseJsonContent(initialData?.content);

  // --- 狀態管理 ---
  // 1. 文字類內容
  const [textContent, setTextContent] = useState(
    (['text', 'typewriter', 'scratch'].includes(initialData?.type || '') && !parsedData.isImage ? (parsedData.text || initialData?.content) : '') || ''
  );

  // 2. 媒體類內容
  const [mediaUrl, setMediaUrl] = useState(parsedData.url);
  const [mediaDesc, setMediaDesc] = useState(parsedData.description);

  // 3. 地圖
  const [location, setLocation] = useState(parsedData.location);

  // 4. ★ 新增：刮刮樂模式 (文字/圖片)
  const [scratchMode, setScratchMode] = useState<'text' | 'image'>(parsedData.isImage ? 'image' : 'text');

  // 5. 測驗
  const initialQuiz = initialData?.type === 'quiz' && initialData.content 
    ? JSON.parse(initialData.content) 
    : { question: '聖誕老公公的馴鹿有幾隻？', options: ['8隻', '9隻', '12隻'], answer: '9隻' };

  const [quizQuestion, setQuizQuestion] = useState(initialQuiz.question);
  const [quizOptions, setQuizOptions] = useState<string[]>(initialQuiz.options);
  const [correctAnswer, setCorrectAnswer] = useState(initialQuiz.answer);

  // 切換類型預設值
  const handleTypeChange = (newType: string) => {
    setContentType(newType as any);
    if (newType === 'image' && !mediaUrl) setMediaUrl(DEFAULT_IMAGE);
    else if (newType === 'youtube' && !mediaUrl) setMediaUrl(DEFAULT_VIDEO);
    else if (newType === 'spotify' && !mediaUrl) setMediaUrl(DEFAULT_SPOTIFY);
    else if (newType === 'map' && !location) setLocation(DEFAULT_MAP);
    else if (newType === 'scratch' && scratchMode === 'text' && !textContent) setTextContent(DEFAULT_SCRATCH_TEXT);
    else if (newType === 'typewriter' && !textContent) setTextContent(DEFAULT_TYPEWRITER);
    else if (newType === 'text' && !textContent) setTextContent(DEFAULT_TEXT);
  };

  // ★ 新增：切換刮刮樂模式
  const handleScratchModeChange = (mode: 'text' | 'image') => {
    setScratchMode(mode);
    if (mode === 'image' && !mediaUrl) setMediaUrl(DEFAULT_IMAGE);
    if (mode === 'text' && !textContent) setTextContent(DEFAULT_SCRATCH_TEXT);
  };

  // 偵測與警告
  const isGoogleLink = mediaUrl?.includes('drive.google.com') || mediaUrl?.includes('photos.app.goo.gl');
  // 刮刮樂如果是圖片模式，也要檢查 HTTPS
  const hasNoHttps = (contentType === 'image' || contentType === 'youtube' || contentType === 'spotify' || (contentType === 'scratch' && scratchMode === 'image')) &&
                     mediaUrl?.length > 0 && !mediaUrl.trim().startsWith('https://');

  const addOption = () => { if (quizOptions.length < 4) setQuizOptions([...quizOptions, '']); };
  const removeOption = (idx: number) => { if (quizOptions.length > 2) { const newOpts = quizOptions.filter((_, i) => i !== idx); setQuizOptions(newOpts); if (quizOptions[idx] === correctAnswer) setCorrectAnswer(newOpts[0]); } };
  const updateOptionText = (idx: number, text: string) => { const newOpts = [...quizOptions]; newOpts[idx] = text; setQuizOptions(newOpts); if (quizOptions[idx] === correctAnswer) setCorrectAnswer(text); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);
    let finalContent = '';

    if (contentType === 'quiz') {
      finalContent = JSON.stringify({ question: quizQuestion, options: quizOptions, answer: correctAnswer });
    } else if (['image', 'youtube', 'spotify'].includes(contentType)) {
      finalContent = JSON.stringify({ url: mediaUrl, description: mediaDesc });
    } else if (contentType === 'map') {
      finalContent = JSON.stringify({ location: location, description: mediaDesc });
    } else if (contentType === 'scratch') {
      // ★ 刮刮樂打包邏輯
      finalContent = JSON.stringify({ 
        isImage: scratchMode === 'image',
        text: scratchMode === 'text' ? textContent : '',
        url: scratchMode === 'image' ? mediaUrl : ''
      });
    } else {
      finalContent = textContent;
    }

    formData.set('content', finalContent);

    await new Promise(resolve => setTimeout(resolve, 800));
    const res = await updateDay(slug, day, formData);

    setIsPending(false);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } else {
      alert('儲存失敗：' + res.message);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all group relative h-full flex flex-col">
      <div className="font-bold mb-4 text-slate-700 flex justify-between items-center shrink-0">
        <span className="flex items-center gap-2"><span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs border border-slate-200">Day {day}</span></span>
        {isSuccess && <span className="text-emerald-600 text-xs flex items-center gap-1 font-bold animate-in fade-in slide-in-from-bottom-1"><Check className="w-3 h-3"/> 已更新</span>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col">
        <input name="title" defaultValue={initialData?.title || ''} placeholder={`標題 (預設顯示 Day ${day})`} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
        
        <div className="relative">
          <select name="type" value={contentType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 pl-9 text-sm focus:border-indigo-500 outline-none cursor-pointer shadow-sm appearance-none">
            <option value="text">📄 純文字訊息</option>
            <option value="image">🖼️ 圖片 (網址+描述)</option>
            <option value="youtube">🎥 影片 (YouTube+描述)</option>
            <option value="spotify">🎵 音樂 (Spotify+描述)</option>
            <option value="map">📍 藏寶圖 (Google Maps)</option>
            <option value="quiz">🧠 趣味問答 (選擇題)</option>
            <option value="scratch">🎟️ 刮刮樂 (圖片/文字)</option>
            <option value="typewriter">💌 打字機情書 (動態文字)</option>
          </select>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {contentType === 'text' && <FileText className="w-4 h-4" />}{contentType === 'image' && <ImageIcon className="w-4 h-4" />}{contentType === 'youtube' && <Youtube className="w-4 h-4" />}{contentType === 'quiz' && <HelpCircle className="w-4 h-4" />}{contentType === 'spotify' && <Music className="w-4 h-4" />}{contentType === 'map' && <MapIcon className="w-4 h-4" />}{contentType === 'scratch' && <Ticket className="w-4 h-4" />}{contentType === 'typewriter' && <Feather className="w-4 h-4" />}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1">
          {contentType === 'quiz' ? (
            // 測驗 UI (保持不變)
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">問題內容</label><textarea value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} placeholder="例如：我們第一次約會是在哪裡？" className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-20 focus:border-indigo-500 outline-none resize-none"/></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">設定選項 (點擊圓圈設為正解)</label>{quizOptions.length < 4 && <button type="button" onClick={addOption} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full hover:bg-indigo-100 transition flex items-center gap-1"><Plus className="w-3 h-3" /> 增加</button>}</div>
                {quizOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button type="button" onClick={() => setCorrectAnswer(opt)} className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${correctAnswer === opt ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-300'}`} title="設為正確答案">{correctAnswer === opt && <Check className="w-3 h-3" />}</button>
                    <input type="text" value={opt} onChange={(e) => updateOptionText(idx, e.target.value)} placeholder={`選項 ${idx + 1}`} className={`flex-1 p-2 text-sm rounded-lg border focus:ring-1 outline-none transition ${correctAnswer === opt ? 'border-emerald-500 ring-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 focus:border-indigo-500 bg-white text-slate-800'}`} />
                    {quizOptions.length > 2 && <button type="button" onClick={() => removeOption(idx)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                ))}
              </div>
            </div>
          ) : contentType === 'scratch' ? (
            // ★ 修改：刮刮樂 UI (加入切換按鈕)
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button type="button" onClick={() => handleScratchModeChange('text')} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition ${scratchMode === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>文字模式</button>
                <button type="button" onClick={() => handleScratchModeChange('image')} className={`flex-1 text-xs font-bold py-1.5 rounded-md transition ${scratchMode === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>圖片模式</button>
              </div>

              {scratchMode === 'image' ? (
                // 圖片輸入框 (復用 mediaUrl 邏輯)
                <div className="space-y-1">
                  <div className="relative">
                    <input name="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://example.com/secret-gift.jpg" className={`w-full bg-white border text-slate-800 rounded-xl p-2.5 pl-9 text-sm placeholder:text-slate-400 focus:ring-1 outline-none transition-all shadow-sm font-mono text-xs ${(isGoogleLink || hasNoHttps) ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                    <LinkIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${(isGoogleLink || hasNoHttps) ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-[10px] text-slate-500 px-1 flex flex-col gap-0.5">
                    {isGoogleLink && <p className="text-rose-500 font-bold animate-pulse">🚫 Google 分享連結無法直接使用！</p>}
                    {hasNoHttps && <p className="text-amber-600 font-bold">⚠️ 網址建議以 https:// 開頭</p>}
                  </div>
                </div>
              ) : (
                // 文字輸入框
                <div className="space-y-1">
                  <textarea name="content" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="輸入要隱藏的文字..." className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-32 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm" />
                </div>
              )}
            </div>
          ) : ['image', 'youtube', 'spotify'].includes(contentType) ? (
            // 媒體類型 (保持不變)
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <div className="relative">
                  <input name="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder={contentType === 'image' ? "https://example.com/image.jpg" : contentType === 'youtube' ? "https://www.youtube.com/watch?v=..." : "http://googleusercontent.com/spotify.com/7..."} className={`w-full bg-white border text-slate-800 rounded-xl p-2.5 pl-9 text-sm placeholder:text-slate-400 focus:ring-1 outline-none transition-all shadow-sm font-mono text-xs ${(isGoogleLink || hasNoHttps) ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-amber-50' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'}`} />
                  <LinkIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${(isGoogleLink || hasNoHttps) ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div className="text-[10px] text-slate-500 px-1 flex flex-col gap-0.5">
                  {contentType === 'image' ? (
                    <>{isGoogleLink && <p className="text-rose-500 font-bold animate-pulse">🚫 Google 分享連結無法直接使用！</p>}{hasNoHttps && <p className="text-amber-600 font-bold">⚠️ 網址建議以 https:// 開頭</p>}</>
                  ) : (
                    <>{hasNoHttps && <p className="text-amber-600 font-bold">⚠️ 網址請以 https:// 開頭</p>}</>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{contentType === 'image' ? '照片描述 (選填)' : '影片描述 (選填)'}</label>
                <textarea name="mediaDesc" value={mediaDesc} onChange={(e) => setMediaDesc(e.target.value)} placeholder="寫點什麼..." className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-20 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm"/>
              </div>
            </div>
          ) : contentType === 'map' ? (
            // 地圖類型 (保持不變)
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">輸入地點</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="請輸入「地點名稱」或「完整地址」" className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none transition-all shadow-sm" />
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">描述文字 (選填)</label><textarea value={mediaDesc} onChange={(e) => setMediaDesc(e.target.value)} placeholder="例如：禮物就藏在這裡..." className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-20 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm"/></div>
            </div>
          ) : (
            // 純文字/打字機 (保持不變)
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 h-full flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{contentType === 'typewriter' ? '信件內容' : '訊息內容'}</label>
              <textarea name="content" value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="在這裡輸入..." className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-32 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm" />
            </div>
          )}
        </div>
        
        <button disabled={isPending} className={`mt-auto w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-md ${isSuccess ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /><span>儲存中...</span></> : isSuccess ? <><Check className="w-4 h-4" /><span>儲存成功</span></> : <><Save className="w-4 h-4" /><span>儲存內容</span></>}
        </button>
      </form>
    </div>
  );
}