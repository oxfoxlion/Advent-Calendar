'use client';

import { useState } from 'react';
import { updateDay } from '@/app/actions';
import { Loader2, Check, Save } from 'lucide-react';
import { DayContent } from '@/lib/sdk/types';

type Props = {
  slug: string;
  day: number;
  initialData?: DayContent;
};

export default function DayEditor({ slug, day, initialData }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setIsSuccess(false);

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
    // 修改：毛玻璃風格
    <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all group relative">
      
      <div className="font-bold mb-4 text-slate-700 flex justify-between items-center">
        <span className="flex items-center gap-2">
          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-xs border border-slate-200">Day {day}</span>
        </span>
        
        {isSuccess && (
          <span className="text-emerald-600 text-xs flex items-center gap-1 font-bold animate-in fade-in slide-in-from-bottom-1">
            <Check className="w-3 h-3"/> 已更新
          </span>
        )}
      </div>
      
      <form action={handleSubmit} className="space-y-3">
        <input 
          name="title" 
          defaultValue={initialData?.title || ''}
          placeholder="標題 (選填)" 
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
        />
        
        <select 
          name="type" 
          defaultValue={initialData?.type === 'video' ? 'youtube' : (initialData?.type || 'text')} 
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-2.5 text-sm focus:border-indigo-500 outline-none cursor-pointer shadow-sm"
        >
          <option value="text">📄 純文字</option>
          <option value="image">🖼️ 圖片 (網址)</option>
          <option value="youtube">🎥 影片 (YouTube 網址)</option>
        </select>
        
        <textarea 
          name="content" 
          defaultValue={initialData?.content || ''}
          placeholder="在這裡輸入驚喜內容..." 
          className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl p-3 text-sm h-28 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all shadow-sm" 
        />
        
        <button 
          disabled={isPending}
          className={`
            w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
            active:scale-[0.98] shadow-md
            ${isSuccess 
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-800 hover:bg-slate-700 text-white'}
          `}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isSuccess ? (
            <>
              <Check className="w-4 h-4" />
              儲存成功
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              儲存內容
            </>
          )}
        </button>
      </form>
    </div>
  );
}