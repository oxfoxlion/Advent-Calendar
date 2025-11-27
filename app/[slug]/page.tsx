import { notFound } from 'next/navigation';
import { getCalendarProfile, getSafeCalendarDays } from '@/lib/sdk/server';
import AdventGrid from '@/components/AdventGrid';
import LockScreen from '@/components/LockScreen';
import { cookies } from 'next/headers';

// 定義正確的型別：params 是一個 Promise
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. ★ 關鍵修改：先 await params 才能拿到 slug
  const { slug } = await params;

  // 2. 現在 slug 有值了，再傳給 SDK
  const profile = await getCalendarProfile(slug);

  if (!profile) return notFound();

  // 3. 權限檢查
  if (profile.hasPassword) {
    const cookieStore = await cookies(); // 注意：cookies() 在新版也是 Promise，建議加 await (雖然目前版本可能相容，但建議加)
    const hasAccess = cookieStore.get(`access-${slug}`)?.value === 'granted';
    if (!hasAccess) return <LockScreen slug={slug} />;
  }

  // 4. 獲取內容
  const days = await getSafeCalendarDays(profile.id);

  return (
    <main className={`min-h-screen p-6 bg-slate-950 text-${profile.themeColor}-500`}>
      <header className="text-center mb-10 mt-4">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {profile.recipientName}
        </h1>
        <p className="text-gray-500 text-sm mt-2">2024 Advent Calendar</p>
      </header>
      
      <AdventGrid days={days} slug={slug} themeColor={profile.themeColor} />
    </main>
  );
}