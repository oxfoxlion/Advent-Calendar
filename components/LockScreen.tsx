'use client';
import { verifyAccess } from '@/app/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LockScreen({ slug }: { slug: string }) {
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(false);
    const res = await verifyAccess(slug, formData.get('password') as string);
    if (res.success) {
      router.refresh(); 
    } else {
      setError(true);
      setIsPending(false);
    }
  };

  return (
    <div 
      className="flex h-screen items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FDF6E3, #5997D9)' }} // 首頁預設配色
    >
      <form 
        action={handleSubmit} 
        className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-2xl space-y-6"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-indigo-500">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-800">專屬降臨曆</h1>
          <p className="text-slate-500 text-sm mt-2">請輸入密碼以開啟驚喜</p>
        </div>

        <div className="space-y-2">
          <input 
            name="password" 
            type="password" 
            placeholder="輸入通關密碼" 
            className="w-full p-3 bg-white/60 rounded-xl border border-white/60 text-slate-800 text-center placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all" 
          />
          {error && <p className="text-rose-500 text-xs text-center font-bold animate-pulse">🔒 密碼錯誤，請再試一次</p>}
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : '解鎖'} 
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}