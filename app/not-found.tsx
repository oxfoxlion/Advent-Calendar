import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-white/50 shadow-2xl text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
        
        {/* 圖示 */}
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <SearchX className="w-10 h-10" />
        </div>

        {/* 文字訊息 */}
        <h2 className="text-3xl font-extrabold mb-3 text-slate-800">
          找不到頁面
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed text-sm">
          哎呀！您要找的倒數日曆可能不存在，<br />
          或者是網址輸入錯誤囉。
        </p>

        {/* 返回首頁按鈕 */}
        <Link 
          href="/" 
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-slate-500/30 active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          返回首頁製作
        </Link>
      </div>
      
      <p className="mt-8 text-xs text-slate-400 font-medium">InstantCheese Shao | 2025</p>
    </div>
  );
}