'use client';

import { useState } from 'react';
import { updatePasswords } from '@/app/actions';
import { Lock, KeyRound, Check, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

type Props = {
  slug: string;
  hasPassword: boolean; // 目前是否有設訪客密碼
};

export default function SecuritySettings({ slug, hasPassword }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useGuestPassword, setUseGuestPassword] = useState(hasPassword);
  
  // 密碼顯示切換
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showGuestPass, setShowGuestPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setIsSuccess(false);

    const formData = new FormData(e.currentTarget);
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const res = await updatePasswords(formData);

    setIsPending(false);
    if (res.success) {
      setIsSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setIsSuccess(false), 3000);
    } else {
      alert('更新失敗：' + res.message);
    }
  };

  return (
    <div className="p-6 text-slate-800">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
        <ShieldCheck className="w-6 h-6 text-indigo-500" />
        安全性設定
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="slug" value={slug} />

        {/* 1. 管理員密碼 */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <Lock className="w-3 h-3" /> 修改管理員密碼 (不改請留空)
          </label>
          <div className="relative">
            <input 
              name="adminCode" 
              type={showAdminPass ? "text" : "password"}
              placeholder="輸入新的管理員密碼..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <button 
              type="button" 
              onClick={() => setShowAdminPass(!showAdminPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showAdminPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
        </div>

        <hr className="border-slate-200/60" />

        {/* 2. 訪客密碼 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3 h-3" /> 訪客通關密碼
            </label>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="useGuestPassword" 
                className="sr-only peer" 
                checked={useGuestPassword} 
                onChange={(e) => setUseGuestPassword(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              <span className="ml-2 text-sm font-medium text-slate-600">{useGuestPassword ? '已啟用' : '公開'}</span>
            </label>
          </div>

          {useGuestPassword && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <input 
                name="accessCode" 
                type={showGuestPass ? "text" : "password"}
                placeholder="輸入新的訪客密碼 (不改請留空)..." 
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 pl-10 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm" 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <button 
                type="button" 
                onClick={() => setShowGuestPass(!showGuestPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showGuestPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
              <p className="text-[10px] text-slate-500 mt-1 pl-1">
                * 若不想更改現有密碼，請留空即可；若想取消密碼保護，請關閉上方開關。
              </p>
            </div>
          )}
        </div>

        <button 
          disabled={isPending || isSuccess} 
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${isSuccess ? 'bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-500/30'}`}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>更新中...</span>
            </>
          ) : isSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>密碼已更新！</span>
            </>
          ) : (
            '儲存設定'
          )}
        </button>
      </form>
    </div>
  );
}