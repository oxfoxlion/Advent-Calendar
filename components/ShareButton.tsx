'use client';

import { Share2, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // 組合完整的網址
    const url = `${window.location.origin}/${slug}`;
    
    // 複製到剪貼簿
    navigator.clipboard.writeText(url);
    setCopied(true);
    
    // 2秒後恢復原狀
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm transition-all border border-white/20"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? '已複製連結！' : '分享給朋友'}
    </button>
  );
}