import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import { verifyAdmin } from '@/app/actions';
import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';
import EditPageClient from '@/components/EditPageClient'; // 關鍵：這裡要引入編輯用的 Client Component

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);
  if (!profile) return notFound();

  // 權限驗證
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';

  if (!isAdmin) {
    // 未登入：顯示管理員登入畫面
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: 'linear-gradient(135deg, #FDF6E3, #5997D9)' }} 
      >
        <form action={async (formData) => {
          'use server';
          const res = await verifyAdmin(slug, formData.get('password') as string);
          if (res.success) redirect(`/${slug}/edit`);
        }} className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 space-y-6 shadow-2xl relative">
          
          <Link href="/" className="absolute top-5 left-5 text-slate-400 hover:text-slate-700 transition" title="回到首頁">
            <Home className="w-5 h-5" />
          </Link>

          <div className="text-center mt-2">
            <h1 className="text-2xl font-extrabold text-slate-800">後台管理</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium bg-white/50 inline-block px-3 py-1 rounded-full">
              {profile.recipientName}
            </p>
          </div>

          <div className="space-y-4">
            <input 
              name="password" 
              type="password" 
              placeholder="輸入編輯密碼" 
              className="w-full p-3 bg-white/60 rounded-xl border border-white/60 text-slate-800 text-center placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all" 
            />
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-bold transition shadow-lg flex items-center justify-center gap-2">
              登入管理 <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href={`/${slug}`} className="text-xs text-slate-500 hover:text-indigo-600 transition border-b border-transparent hover:border-indigo-600">
              先去預覽頁看看 →
            </Link>
          </div>
        </form>
      </div>
    );
  }

  // 已登入：顯示編輯介面
  const days = await getSafeCalendarDays(profile.id, true);

  return <EditPageClient profile={profile} days={days} slug={slug} />;
}