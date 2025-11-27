'use client';
import { verifyAccess } from '@/app/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LockScreen({ slug }: { slug: string }) {
  const [error, setError] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
      <form action={async (formData) => {
        const res = await verifyAccess(slug, formData.get('password') as string);
        if (res.success) router.refresh(); // 重新整理頁面
        else setError(true);
      }} className="flex flex-col gap-4 p-8 bg-slate-900 rounded-xl border border-slate-800">
        <h1 className="text-xl font-bold text-center">🔒 請輸入通關密語</h1>
        <input name="password" type="password" placeholder="Password" 
          className="p-2 rounded bg-slate-800 text-center border border-slate-700" />
        {error && <p className="text-red-500 text-xs text-center">密碼錯誤</p>}
        <button type="submit" className="bg-rose-600 p-2 rounded font-bold">解鎖</button>
      </form>
    </div>
  );
}