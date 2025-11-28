'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

export default function LogoutButton({ slug }: { slug: string }) {
  return (
    <button 
      onClick={() => logout(slug)}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm transition-all border border-white/20 backdrop-blur-sm"
      title="登出"
    >
      <LogOut className="w-4 h-4" />
      <span>登出</span>
    </button>
  );
}