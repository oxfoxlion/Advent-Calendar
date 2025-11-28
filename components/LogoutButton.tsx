'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

export default function LogoutButton({ slug }: { slug: string }) {
  return (
    <button 
      onClick={() => logout(slug)}
      // 保留 rounded-full，改用淺色背景與深色文字
      className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-800 px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/40 backdrop-blur-sm shadow-sm"
      title="登出"
    >
      <LogOut className="w-4 h-4" />
      <span>登出</span>
    </button>
  );
}