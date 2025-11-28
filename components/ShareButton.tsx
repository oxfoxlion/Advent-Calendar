'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleShare}
      // 保留 rounded-full，改用淺色背景與深色文字
      className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-800 px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/40 backdrop-blur-sm shadow-sm"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? '已複製連結！' : '分享給朋友'}
    </button>
  );
}