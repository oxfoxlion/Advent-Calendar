import { createCalendar } from './actions';

// 定義背景風格選項 (對應預覽頁的 THEMES)
const THEME_OPTIONS = [
  { id: 'classic', name: '🎄 經典聖誕', bg: 'bg-gradient-to-br from-red-900 to-green-900' },
  { id: 'winter', name: '❄️ 冰雪奇緣', bg: 'bg-slate-800' },
  { id: 'cozy', name: '🍪 溫馨薑餅', bg: 'bg-[#FDF6E3]' },
  { id: 'sugar', name: '🍬 夢幻糖果', bg: 'bg-gradient-to-br from-rose-100 to-teal-100' },
];

// 定義卡片樣式選項 (對應 AdventGrid 的 CARD_STYLES)
const CARD_OPTIONS = [
  { id: 'classic', name: '經典紅綠', desc: '紅底金框' },
  { id: 'winter', name: '極地冰藍', desc: '藍底銀框' },
  { id: 'cozy', name: '焦糖薑餅', desc: '暖棕配色' },
  { id: 'sugar', name: '馬卡龍粉', desc: '粉嫩無框' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">
            建立你的降臨曆
          </h1>
          <p className="mt-2 text-gray-400">為朋友準備 25 天的驚喜</p>
        </div>

        <form action={createCalendar} className="mt-8 space-y-6 bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-5">
            
            {/* 基本資訊 */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">降臨曆名稱 (給誰的?)</label>
                <input name="recipientName" required type="text" placeholder="例如：給小明的聖誕驚喜" 
                  className="mt-1 block w-full rounded-lg bg-slate-800 border-slate-700 text-white p-3 focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300">網址代碼 (Slug)</label>
                <input name="slug" required type="text" placeholder="例如：xmas-2024-amy (需唯一)" 
                  className="mt-1 block w-full rounded-lg bg-slate-800 border-slate-700 text-white p-3 focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">編輯密碼 (你自己用)</label>
                <input name="adminCode" required type="text" placeholder="管理後台用" 
                  className="mt-1 w-full rounded-lg bg-slate-800 border-slate-700 p-3 focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">訪客密碼 (選填)</label>
                <input name="accessCode" type="text" placeholder="若留空則公開" 
                  className="mt-1 w-full rounded-lg bg-slate-800 border-slate-700 p-3 focus:ring-rose-500 focus:border-rose-500 transition" />
              </div>
            </div>

            <hr className="border-slate-800 my-6"/>

            {/* 外觀選擇 */}
            
            {/* 1. 背景選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">1. 選擇背景氛圍</label>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((t) => (
                  <label key={t.id} className="cursor-pointer relative group">
                    <input type="radio" name="background" value={t.id} defaultChecked={t.id === 'classic'} className="peer sr-only" />
                    {/* 預覽色塊 */}
                    <div className={`h-16 rounded-lg ${t.bg} peer-checked:ring-2 peer-checked:ring-rose-500 border border-white/10 opacity-70 peer-checked:opacity-100 transition-all`}></div>
                    {/* 選項文字 */}
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md pointer-events-none">
                      {t.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. 卡片選擇 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">2. 選擇卡片風格</label>
              <div className="grid grid-cols-2 gap-3">
                {CARD_OPTIONS.map((c) => (
                  <label key={c.id} className="cursor-pointer relative">
                    <input type="radio" name="cardStyle" value={c.id} defaultChecked={c.id === 'classic'} className="peer sr-only" />
                    <div className="h-12 rounded-lg bg-slate-800 border border-slate-600 peer-checked:border-rose-500 peer-checked:bg-slate-700 transition-all flex flex-col items-center justify-center group-hover:border-slate-500">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="text-[10px] text-gray-400">{c.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 隱藏欄位：保持相容性 */}
            <input type="hidden" name="themeColor" value="rose" />
          </div>

          <button type="submit" className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transform transition hover:scale-[1.01] active:scale-[0.99]">
            ✨ 開始製作降臨曆
          </button>
        </form>
        
        <p className="text-center text-xs text-gray-600">
          Made with ❤️ for Christmas 2024
        </p>
      </div>
    </main>
  );
}