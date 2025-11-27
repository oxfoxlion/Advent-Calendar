import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import { verifyAdmin } from '@/app/actions';
import Link from 'next/link';
import { Home } from 'lucide-react';
import EditPageClient from '@/components/EditPageClient'; // 引入新的 Client Component

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);
  if (!profile) return notFound();

  // 權限驗證
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';

  if (!isAdmin) {
    // 登入頁面：也改為毛玻璃風格背景
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"
           style={{ background: 'linear-gradient(135deg, #FDF6E3, #5997D9)' }}> {/* 預設一個漂亮的背景 */}
        <form action={async (formData) => {
          'use server';
          const res = await verifyAdmin(slug, formData.get('password') as string);
          if (res.success) redirect(`/${slug}/edit`);
        }} className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 space-y-6 shadow-2xl relative">
          
          <Link href="/" className="absolute top-4 left-4 text-slate-500 hover:text-slate-800 transition">
            <Home className="w-5 h-5" />
          </Link>

          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-slate-800">🔧 管理員登入</h1>
            <p className="text-slate-500 text-sm mt-2">{profile.recipientName}</p>
          </div>
          <input name="password" type="password" placeholder="輸入管理員密碼" className="w-full p-3 bg-white/60 rounded-xl border border-white/60 text-slate-800 text-center focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner" />
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl font-bold transition shadow-lg">登入</button>
          <div className="text-center mt-4">
            <Link href={`/${slug}`} className="text-sm text-slate-500 hover:text-slate-800">← 先去預覽頁看看</Link>
          </div>
        </form>
      </div>
    );
  }

  const days = await getSafeCalendarDays(profile.id);

  // 將資料傳遞給 Client Component
  return <EditPageClient profile={profile} days={days} slug={slug} />;
}