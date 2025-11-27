import { notFound } from 'next/navigation';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import AdventGrid from '@/components/AdventGrid';
import LockScreen from '@/components/LockScreen';
import ShareButton from '@/components/ShareButton';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import { cookies } from 'next/headers';
import Link from 'next/link';

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
    
    // ★ 修正重點：解析所有裝飾參數
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
  
  if (profile.hasPassword && !isAdmin) {
    const hasAccess = cookieStore.get(`access-${slug}`)?.value === 'granted';
    if (!hasAccess) return <LockScreen slug={slug} />;
  }

  const days = await getSafeCalendarDays(profile.id);
  
  // 解析樣式設定
  const themeStyle = getBackgroundStyle(profile.background);

  return (
    <main 
      className="min-h-screen p-6 transition-colors duration-500 relative"
      style={{ background: themeStyle.background }}
    >
      {/* ★ 修正重點：將解析出的所有參數傳給裝飾組件 */}
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
        
        <footer className="text-center text-xs mt-12 pb-6 opacity-60 text-white">
          Made with ❤️ for Christmas
        </footer>
      </div>
    </main>
  );
}