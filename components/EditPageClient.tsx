'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// 引入所需的 Icons
import { Home, ExternalLink, AtSign, Lock, X, Bell, Lightbulb, Calendar, Check } from 'lucide-react';
import AppearanceSettings from '@/components/AppearanceSettings';
import SecuritySettings from '@/components/SecuritySettings';
import DayEditor from '@/components/DayEditor';
import BackgroundDecoration from '@/components/BackgroundDecoration';
import { CalendarProfile, DayContent } from '@/lib/sdk/types';

const THEME_DEFAULTS: Record<string, [string, string]> = {
  classic: ['#450a0a', '#14532d'],
  winter: ['#0f172a', '#1e293b'],
  cozy: ['#FDF6E3', '#FDF6E3'],
  sugar: ['#ffe4e6', '#ccfbf1'],
};

const CARD_DEFAULTS: Record<string, string> = {
  classic: '#7f1d1d',
  winter: '#1e293b',
  cozy: '#78350f',
  sugar: '#fb7185',
};

type Props = {
  profile: CalendarProfile;
  days: DayContent[];
  slug: string;
};

export default function EditPageClient({ profile, days, slug }: Props) {
  // 解析背景字串
  const initBgString = profile.background.startsWith('custom-bg:')
    ? profile.background.replace('custom-bg:', '')
    : (THEME_DEFAULTS[profile.background]?.join(',') || THEME_DEFAULTS.classic.join(','));
  
  const parts = initBgString.split(',');
  const initBgStart = parts[0];
  const initBgEnd = parts[1] || parts[0];
  const initPattern = parts[2] || ''; 
  const initQuantity = parts[3] ? parseInt(parts[3]) : 20;
  const initSize = parts[4] ? parseFloat(parts[4]) : 1;
  const initRotation = parts[5] ? parseInt(parts[5]) : 45;
  const initAnimation = parts[6] || 'float';

  const initCard = profile.cardStyle.startsWith('custom-card:')
    ? profile.cardStyle.replace('custom-card:', '')
    : CARD_DEFAULTS[profile.cardStyle] || CARD_DEFAULTS.classic;

  // 狀態管理
  const [bgStart, setBgStart] = useState(initBgStart);
  const [bgEnd, setBgEnd] = useState(initBgEnd);
  const [pattern, setPattern] = useState(initPattern);
  const [quantity, setQuantity] = useState(initQuantity);
  const [size, setSize] = useState(initSize);
  const [rotation, setRotation] = useState(initRotation);
  const [animation, setAnimation] = useState(initAnimation);
  const [cardColor, setCardColor] = useState(initCard);

  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  // ★ 新增：控制「今天不再顯示」勾選狀態
  const [dontShowToday, setDontShowToday] = useState(false);

  // 檢查是否需要顯示提醒 (每天顯示一次)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `admin-reminder-seen-${slug}`;
    const lastSeen = localStorage.getItem(storageKey);

    if (lastSeen !== today) {
      setShowReminderModal(true);
    }
  }, [slug]);

  const closeReminder = (shouldSave: boolean) => {
    setShowReminderModal(false);
    // 如果使用者有勾選「今天不再顯示」，則寫入紀錄
    if (shouldSave) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`admin-reminder-seen-${slug}`, today);
    }
  };

  const handleAdminSubscribe = () => {
    const eventTitle = `🎁 [準備提醒] 記得包裝 ${profile.recipientName} 的降臨曆禮物！`;
    const details = `親愛的管理者，明天就要開禮物了！\n請記得在今晚 12:00 前完成內容編輯，才不會讓對方看到空白頁面喔。\n\n編輯連結：${window.location.href}`;
    const startDate = '20251130T220000'; 
    const endDate = '20251130T221500';
    const recurrence = 'RRULE:FREQ=DAILY;COUNT=25';
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&recur=${encodeURIComponent(recurrence)}`;
    
    window.open(calendarUrl, '_blank');
  };

  const buttonStyle = "px-4 py-2 bg-white/50 backdrop-blur-sm text-slate-800 hover:bg-white/80 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm border border-white/40 cursor-pointer";

  return (
    <div 
      className="min-h-screen p-6 pb-32 transition-colors duration-300 relative"
      style={{ background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})` }}
    >
      <BackgroundDecoration 
        pattern={pattern} 
        quantity={quantity} 
        size={size} 
        rotation={rotation} 
        animation={animation as any}
      />

      <div className="relative z-10">
        <header className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/" className="p-2 bg-white/50 backdrop-blur-sm rounded-full text-slate-700 hover:text-indigo-600 hover:bg-white/80 shadow-sm transition" title="回到首頁">
              <Home className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">後台編輯模式</h1>
              <p className="text-slate-600 text-sm font-medium">正在編輯：{profile.recipientName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSecurityModal(true)}
              className={buttonStyle}
            >
              <Lock className="w-4 h-4" /> 密碼設定
            </button>

            <Link href={`/${slug}`} className={buttonStyle}>
              <ExternalLink className="w-4 h-4" /> 預覽成果
            </Link>
          </div>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          
          <AppearanceSettings 
            slug={slug} 
            profile={profile}
            bgStart={bgStart} setBgStart={setBgStart}
            bgEnd={bgEnd} setBgEnd={setBgEnd}
            cardColor={cardColor} setCardColor={setCardColor}
            pattern={pattern} setPattern={setPattern}
            quantity={quantity} setQuantity={setQuantity}
            size={size} setSize={setSize}
            rotation={rotation} setRotation={setRotation}
            animation={animation} setAnimation={setAnimation}
          />

          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 drop-shadow-sm">
              📅 每日內容 (25天)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 25 }).map((_, i) => {
                const dayNum = i + 1;
                const currentDayData = days.find(d => d.day === dayNum);
                return (
                  <DayEditor 
                    key={dayNum} 
                    slug={slug} 
                    day={dayNum} 
                    initialData={currentDayData}
                  />
                );
              })}
            </div>
          </section>
        </div>

        <footer className="text-center text-xs mt-12 pb-6 opacity-60 text-white flex flex-col items-center gap-2">
          <p>InstantCheese Shao | 2025</p>
          <a 
            href="https://www.threads.net/@oxfoxlion" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white hover:underline transition-all"
          >
            <AtSign className="w-3 h-3" />
            <span>Threads</span>
          </a>
        </footer>
      </div>

      {/* 密碼設定 Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSecurityModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowSecurityModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 transition z-10"><X className="w-5 h-5" /></button>
            <SecuritySettings slug={slug} hasPassword={profile.hasPassword} />
          </div>
        </div>
      )}

      {/* 管理者提醒 Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border-4 border-white/50">
            <div className="p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6 animate-swing" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800">親愛的管理者</h3>
                  <p className="text-sm text-slate-500 font-medium">別讓禮物開天窗囉！</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-slate-600 text-sm leading-relaxed border border-slate-100 space-y-3">
                <p>
                  請記得最晚要在 <span className="font-bold text-rose-500">前一天的午夜 12:00 前</span> 包裝好您的禮物，確保對方不會收到空白的驚喜唷！
                </p>
                <div className="flex gap-2 items-start bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    <span className="font-bold text-indigo-600 block mb-1">小秘訣：</span>
                    您可以一次包裝好整個月的內容，或是預先包好未來幾天的份量，這樣就不用每天趕死線囉！
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-500">
                    「修改密碼」功能已開放，請至右上角的按鈕設定。
                  </p>
                </div>
              </div>

              {/* 訂閱連結 (弱化版) */}
              <div className="flex justify-center pt-1">
                <button 
                  onClick={handleAdminSubscribe}
                  className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1.5 transition-colors group"
                >
                  <Calendar className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600" />
                  <span>訂閱每日提醒 (每晚 22:00 或自訂時間)</span>
                </button>
              </div>

              {/* 按鈕群組 */}
              <div className="space-y-4">
                {/* 主按鈕：我知道了 */}
                <button 
                  onClick={() => closeReminder(dontShowToday)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-slate-300 active:scale-[0.98]"
                >
                  我知道了
                </button>

                {/* ★ 修改：改為勾選切換樣式 */}
                <div className="flex justify-center">
                  <button 
                    onClick={() => setDontShowToday(!dontShowToday)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition group select-none"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${dontShowToday ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                      {dontShowToday && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm font-medium ${dontShowToday ? 'text-indigo-600' : ''}`}>今天不再顯示</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 右上角關閉 (不會觸發儲存設定) */}
            <button 
              onClick={() => closeReminder(false)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}