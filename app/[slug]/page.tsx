import { notFound } from 'next/navigation';
// ★ 修正錯誤：導入 Metadata 型別
import type { Metadata } from 'next';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import AdventGrid from '@/components/AdventGrid';
import LockScreen from '@/components/LockScreen';
import ShareButton from '@/components/ShareButton';
import LogoutButton from '@/components/LogoutButton';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ReminderButton from '@/components/ReminderButton';
import { Sparkles } from 'lucide-react';

// 舊版代碼相容對照表
const THEME_DEFAULTS: Record<string, string> = {
  classic: 'custom-bg:#450a0a,#14532d',
  winter: 'custom-bg:#0f172a,#1e293b',
  cozy: 'custom-bg:#FDF6E3,#FDF6E3',
  sugar: 'custom-bg:#ffe4e6,#ccfbf1',
};

function getBackgroundStyle(bgString: string) {
  // 1. 處理舊版代號 (如 'classic') 轉為新版格式
  const normalizedBg = bgString.startsWith('custom-bg:')
    ? bgString
    : (THEME_DEFAULTS[bgString] || THEME_DEFAULTS.classic);

  // 2. 解析字串：custom-bg:色1,色2,圖樣,數量,大小,角度,動畫
  const parts = normalizedBg.replace('custom-bg:', '').split(',');

  return {
    // 背景漸層
    background: `linear-gradient(to bottom right, ${parts[0]}, ${parts[1] || parts[0]})`,

    // 解析所有裝飾參數
    pattern: parts[2] || '',
    quantity: parts[3] ? parseInt(parts[3]) : 20,
    size: parts[4] ? parseFloat(parts[4]) : 1,
    rotation: parts[5] ? parseInt(parts[5]) : 45,
    animation: parts[6] || 'float',

    color: '#ffffff'
  };
}

// 新增：動態產生頁面標題 (現在有 Metadata 匯入了，不會報錯)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const profile = await getCalendarProfile(slug);

  if (!profile) {
    notFound(); // 👈 直接呼叫 notFound()，而不是回傳 Metadata
  }

  return {
    title: `${profile.recipientName} 的聖誕驚喜`,
    description: `專屬於 ${profile.recipientName} 的 25 天倒數驚喜`,
    // ...
  };
}


export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);

  if (!profile) return notFound();

  const cookieStore = await cookies();
  // 取得是否為管理員
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  // 修改：將訪客權限的取得移到外層，以便判斷是否顯示登出鈕
  const hasAccess = cookieStore.get(`access-${slug}`)?.value === 'granted';

  // 檢查密碼保護 (如果是管理員則跳過檢查)
  if (profile.hasPassword && !isAdmin) {
    if (!hasAccess) return <LockScreen slug={slug} />;
  }

  // 新增：判斷是否需要顯示登出按鈕 (只要是管理員，或是已解鎖私密日曆的訪客，就顯示登出)
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
            {/* 新增：導航回首頁的按鈕 (放在最左側) */}
            <Link href="/" className={buttonStyle} title="製作我的專屬日曆">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>製作我的專屬日曆</span>
            </Link>

            <ShareButton slug={slug} />
            <ReminderButton title={profile.recipientName} />
            {/* 新增：登出按鈕 (顯示於此) */}
            {showLogout && <LogoutButton slug={slug} />}

            {isAdmin ? (
              <Link
                href={`/${slug}/edit`}
                className={buttonStyle}
              >
                ✏️ 編輯內容
              </Link>
            ) : (
              <Link
                href={`/${slug}/edit`}
                className={buttonStyle}
              >
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
          InsatantCheese Shao | 2025
        </footer>
      </div>
    </main>
  );
}