import { notFound } from 'next/navigation';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import AdventGrid from '@/components/AdventGrid';
import LockScreen from '@/components/LockScreen';
import ShareButton from '@/components/ShareButton';
import LogoutButton from '@/components/LogoutButton';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ReminderButton from '@/components/ReminderButton';
// ★ 新增：引入圖示
import { Sparkles } from 'lucide-react';

// ... (THEME_DEFAULTS 和 getBackgroundStyle 保持不變) ...
const THEME_DEFAULTS: Record<string, string> = {
  classic: 'custom-bg:#450a0a,#14532d',
  winter: 'custom-bg:#0f172a,#1e293b',
  cozy: 'custom-bg:#FDF6E3,#FDF6E3',
  sugar: 'custom-bg:#ffe4e6,#ccfbf1',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);
  
  if (!profile) {
    return {
      title: '找不到日曆 | 2025 聖誕倒數',
    };
  }

  return {
    title: `${profile.recipientName} | 2025 降臨曆`,
    description: ` ${profile.recipientName} 25 天倒數驚喜`,
    // 您也可以在這裡設定 Open Graph (分享卡片) 的圖片
    openGraph: {
      title: `${profile.recipientName} | 2025 降臨曆`,
      description: '快來看看我為你準備的 25 個禮物！',
    },
  };
}

function getBackgroundStyle(bgString: string) {
  const normalizedBg = bgString.startsWith('custom-bg:') 
    ? bgString 
    : (THEME_DEFAULTS[bgString] || THEME_DEFAULTS.classic);

  const parts = normalizedBg.replace('custom-bg:', '').split(',');
  
  return {
    background: `linear-gradient(to bottom right, ${parts[0]}, ${parts[1] || parts[0]})`,
    pattern: parts[2] || '',
    quantity: parts[3] ? parseInt(parts[3]) : 20,
    size: parts[4] ? parseFloat(parts[4]) : 1,
    rotation: parts[5] ? parseInt(parts[5]) : 45,
    animation: parts[6] || 'float',
    color: '#ffffff'
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);

  if (!profile) return notFound();

  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  const hasAccess = cookieStore.get(`access-${slug}`)?.value === 'granted';
  
  if (profile.hasPassword && !isAdmin) {
    if (!hasAccess) return <LockScreen slug={slug} />;
  }

  const showLogout = isAdmin || (profile.hasPassword && hasAccess);
  const days = await getSafeCalendarDays(profile.id, isAdmin);
  const themeStyle = getBackgroundStyle(profile.background);

  // 統一樣式：半透明白底、深色字、圓角
  const buttonStyle = "flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-800 px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/40 backdrop-blur-sm shadow-sm";

  return (
    <main 
      className="min-h-screen p-6 transition-colors duration-500 relative"
      style={{ background: themeStyle.background }}
    >
      <BackgroundDecoration 
        pattern={themeStyle.pattern} 
        quantity={themeStyle.quantity}
        size={themeStyle.size}
        rotation={themeStyle.rotation}
        animation={themeStyle.animation as any}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-10 mt-8 relative">
          <h1 className="text-4xl font-extrabold drop-shadow-md mb-2 text-white">
            {profile.recipientName}
          </h1>
          <p className="text-sm font-medium mb-6 text-white/80 drop-shadow-sm">2025 Advent Calendar</p>
          
          <div className="flex justify-center gap-3 flex-wrap">
            {/* ★ 新增：導航回首頁的按鈕 (放在最左側) */}
            <Link href="/" className={buttonStyle} title="製作我的專屬日曆">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>打造專屬降臨曆</span>
            </Link>

            <ShareButton slug={slug} />
            <ReminderButton title={profile.recipientName} />
            {showLogout && <LogoutButton slug={slug} />}
            
            {isAdmin ? (
              <Link href={`/${slug}/edit`} className={buttonStyle}>
                ✏️ 編輯內容
              </Link>
            ) : (
              <Link href={`/${slug}/edit`} className={buttonStyle}>
                🔧 管理員
              </Link>
            )}
          </div>
        </header>
        
        <AdventGrid 
          days={days} 
          slug={slug} 
          cardStyle={profile.cardStyle} 
          isAdmin={isAdmin}
        />
        
        <footer className="text-center text-xs mt-12 pb-6 opacity-60 text-white">
          InstantCheese Shao | 2025
        </footer>
      </div>
    </main>
  );
}