import { notFound } from 'next/navigation';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import AdventGrid from '@/components/AdventGrid';
import LockScreen from '@/components/LockScreen';
import ShareButton from '@/components/ShareButton';
import { cookies } from 'next/headers';
import Link from 'next/link';

// 定義背景主題樣式
const THEMES: Record<string, { bg: string; text: string; subtext: string }> = {
  // 1. 經典: 紅綠漸層
  classic: { bg: 'bg-gradient-to-br from-red-950 to-green-900', text: 'text-yellow-400', subtext: 'text-yellow-200/60' },
  // 2. 冰雪: 深藍漸層
  winter: { bg: 'bg-gradient-to-b from-slate-900 to-slate-800', text: 'text-sky-200', subtext: 'text-sky-400/60' },
  // 3. 薑餅: 米白暖色
  cozy: { bg: 'bg-[#FDF6E3]', text: 'text-amber-900', subtext: 'text-amber-800/60' },
  // 4. 糖果: 粉綠漸層
  sugar: { bg: 'bg-gradient-to-br from-rose-100 to-teal-100', text: 'text-rose-600', subtext: 'text-rose-500/60' },
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);

  if (!profile) return notFound();

  // 權限檢查
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  
  // 如果有鎖且不是管理員，檢查訪客權限
  if (profile.hasPassword && !isAdmin) {
    const hasAccess = cookieStore.get(`access-${slug}`)?.value === 'granted';
    if (!hasAccess) return <LockScreen slug={slug} />;
  }

  const days = await getSafeCalendarDays(profile.id);
  
  // 取得主題設定
  const theme = THEMES[profile.background] || THEMES.classic;

  return (
    <main className={`min-h-screen p-6 ${theme.bg}`}>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10 mt-8 relative">
          <h1 className={`text-4xl font-extrabold drop-shadow-sm mb-2 ${theme.text}`}>
            {profile.recipientName}
          </h1>
          <p className={`text-sm font-medium mb-6 ${theme.subtext}`}>2024 Advent Calendar</p>
          
          <div className="flex justify-center gap-3">
            <ShareButton slug={slug} />
            
            {isAdmin ? (
              <Link 
                href={`/${slug}/edit`}
                className="flex items-center gap-2 bg-black/20 text-white px-4 py-2 rounded-full text-sm hover:bg-black/40 transition backdrop-blur-sm shadow-sm"
              >
                ✏️ 編輯內容
              </Link>
            ) : (
              <Link 
                href={`/${slug}/edit`}
                className="flex items-center gap-2 bg-white/10 text-white/80 px-4 py-2 rounded-full text-sm hover:bg-white/20 transition backdrop-blur-sm border border-white/10"
              >
                🔧 管理員
              </Link>
            )}
          </div>
        </header>
        
        <AdventGrid days={days} slug={slug} cardStyle={profile.cardStyle} />
        
        <footer className={`text-center text-xs mt-12 pb-6 opacity-60 ${theme.subtext}`}>
          Made with ❤️ for Christmas
        </footer>
      </div>
    </main>
  );
}