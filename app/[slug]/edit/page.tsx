import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCalendarProfile } from '@/lib/sdk/server';
import { verifyAdmin, updateDay, updateCalendarSettings } from '@/app/actions';
import Link from 'next/link';

// 背景選項
const THEME_OPTIONS = [
  { id: 'classic', name: '🎄 經典聖誕', bg: 'bg-gradient-to-br from-red-900 to-green-900' },
  { id: 'winter', name: '❄️ 冰雪奇緣', bg: 'bg-slate-800' },
  { id: 'cozy', name: '🍪 溫馨薑餅', bg: 'bg-[#FDF6E3]' },
  { id: 'sugar', name: '🍬 夢幻糖果', bg: 'bg-gradient-to-br from-rose-100 to-teal-100' },
];

// 卡片選項
const CARD_OPTIONS = [
  { id: 'classic', name: '經典紅綠', desc: '紅底金框' },
  { id: 'winter', name: '極地冰藍', desc: '藍底銀框' },
  { id: 'cozy', name: '焦糖薑餅', desc: '暖棕配色' },
  { id: 'sugar', name: '馬卡龍粉', desc: '粉嫩無框' },
];

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getCalendarProfile(slug);
  if (!profile) return notFound();

  // 權限驗證
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <form action={async (formData) => {
          'use server';
          const res = await verifyAdmin(slug, formData.get('password') as string);
          if (res.success) redirect(`/${slug}/edit`);
        }} className="w-full max-w-sm p-8 bg-slate-900 rounded-xl border border-slate-800 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">🔧 管理員登入</h1>
            <p className="text-gray-400 text-sm mt-2">{profile.recipientName}</p>
          </div>
          <input name="password" type="password" placeholder="輸入編輯密碼" className="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 text-center" />
          <button className="w-full bg-rose-600 hover:bg-rose-500 p-3 rounded-lg font-bold transition">登入</button>
          <div className="text-center mt-4">
            <Link href={`/${slug}`} className="text-sm text-gray-500 hover:text-white">← 返回預覽</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-32">
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">後台編輯模式</h1>
          <p className="text-gray-400 text-sm">正在編輯：{profile.recipientName}</p>
        </div>
        <Link href={`/${slug}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition flex items-center gap-2 border border-slate-700">
          👀 預覽成果
        </Link>
      </header>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 外觀設定區塊 */}
        <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-300">🎨 外觀風格設定</h2>
          <form action={async (formData) => {
            'use server';
            await updateCalendarSettings(formData);
            redirect(`/${slug}/edit`);
          }} className="space-y-6">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="themeColor" value="rose" /> {/* 預設值 */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. 背景選擇 */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">背景主題</label>
                <div className="grid grid-cols-2 gap-3">
                  {THEME_OPTIONS.map((t) => (
                    <label key={t.id} className="cursor-pointer relative group">
                      <input type="radio" name="background" value={t.id} defaultChecked={profile.background === t.id} className="peer sr-only" />
                      <div className={`h-14 rounded-lg ${t.bg} peer-checked:ring-2 peer-checked:ring-indigo-500 border border-white/10 opacity-60 peer-checked:opacity-100 transition-all`}></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md pointer-events-none">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. 卡片選擇 */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">卡片樣式</label>
                <div className="grid grid-cols-2 gap-3">
                  {CARD_OPTIONS.map((c) => (
                    <label key={c.id} className="cursor-pointer relative">
                      <input type="radio" name="cardStyle" value={c.id} defaultChecked={profile.cardStyle === c.id} className="peer sr-only" />
                      <div className="h-14 rounded-lg bg-slate-800 border border-slate-700 peer-checked:border-indigo-500 peer-checked:bg-slate-700 transition-all flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-gray-400">{c.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 標題修改 */}
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">標題名稱</label>
              <input name="recipientName" defaultValue={profile.recipientName} className="w-full bg-slate-800 rounded-lg p-3 text-sm border border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
            
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg text-sm font-bold transition shadow-lg shadow-indigo-900/20">
              儲存外觀設定
            </button>
          </form>
        </section>

        {/* 每日內容編輯區 */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-300">📅 每日內容 (25天)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 25 }).map((_, i) => (
              <DayEditor key={i} slug={slug} day={i + 1} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// 單日編輯組件
function DayEditor({ slug, day }: { slug: string, day: number }) {
  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition group">
      <div className="font-bold mb-3 text-slate-400 flex justify-between group-hover:text-white transition">
        <span>Day {day}</span>
      </div>
      <form action={async (formData) => {
        'use server';
        await updateDay(slug, day, formData);
      }} className="space-y-3">
        <input name="title" placeholder="標題 (選填)" className="w-full bg-slate-800 rounded p-2 text-sm border border-slate-700 placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none" />
        <select name="type" className="w-full bg-slate-800 rounded p-2 text-sm border border-slate-700 text-gray-300 focus:border-rose-500 outline-none">
          <option value="text">📄 純文字</option>
          <option value="image">🖼️ 圖片 (網址)</option>
          <option value="video">🎥 影片 (網址)</option>
        </select>
        <textarea name="content" placeholder="在這裡輸入驚喜內容..." className="w-full bg-slate-800 rounded p-2 text-sm h-24 border border-slate-700 placeholder-slate-600 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none resize-none" />
        <button className="w-full bg-slate-700 hover:bg-rose-600 text-slate-200 hover:text-white rounded py-2 text-sm font-medium transition">儲存內容</button>
      </form>
    </div>
  );
}