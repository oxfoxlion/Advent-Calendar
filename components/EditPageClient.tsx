'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, ExternalLink } from 'lucide-react';
import AppearanceSettings from '@/components/AppearanceSettings';
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
  // 解析背景字串: custom-bg:色1,色2,圖樣,數量,大小,角度,動畫
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

  return (
    <div 
      className="min-h-screen p-6 pb-32 transition-colors duration-300 relative"
      style={{ background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})` }}
    >
      {/* 傳遞所有參數給背景裝飾 (即時預覽) */}
      <BackgroundDecoration 
        pattern={pattern} 
        quantity={quantity} 
        size={size} 
        rotation={rotation} 
        animation={animation as any}
      />

      {/* 內容層 (z-10 確保在裝飾之上) */}
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

          <Link href={`/${slug}`} className="px-4 py-2 bg-white/50 backdrop-blur-sm text-slate-800 hover:bg-white/80 rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-sm border border-white/40">
            <ExternalLink className="w-4 h-4" /> 預覽成果
          </Link>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* 外觀設定區塊 (傳遞所有 setter) */}
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

          {/* 每日內容 (保持不變) */}
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
      </div>
    </div>
  );
}