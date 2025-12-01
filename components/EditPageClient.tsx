'use client';

import { useState } from 'react';
import Link from 'next/link';
// ★ 修改：加入 Lock, X, AtSign
import { Home, ExternalLink, AtSign, Lock, X } from 'lucide-react';
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

  // ★ 新增：控制密碼設定 Modal
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // 按鈕共用樣式 (確保一致性)
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

          {/* ★ 修改：右上角按鈕群組 */}
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

      {/* ★ 新增：密碼設定 Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowSecurityModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowSecurityModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <SecuritySettings slug={slug} hasPassword={profile.hasPassword} />
          </div>
        </div>
      )}
    </div>
  );
}