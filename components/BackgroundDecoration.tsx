'use client';

import { useEffect, useState, useMemo } from 'react';

type Props = {
  pattern?: string;
  quantity?: number;
  size?: number;
  rotation?: number;
  animation?: 'none' | 'float' | 'twinkle' | 'fall';
};

export default function BackgroundDecoration({ 
  pattern, 
  quantity = 20, 
  size = 1, 
  rotation = 45, 
  animation = 'float' 
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const items = useMemo(() => {
    // 限制數量在 0~100
    const count = Math.min(Math.max(quantity, 0), 100);
    const isFall = animation === 'fall';
    
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      // 隨機位置
      left: `${Math.random() * 100}%`,
      // 如果是掉落模式，強制從上方(-20%)開始；否則隨機分佈在畫面上
      top: isFall ? `-${Math.random() * 20 + 10}%` : `${Math.random() * 100}%`,
      
      // 隨機屬性 (基礎值由 props 決定)
      // 讓大小差異明顯一點：0.5倍 ~ 1.5倍的浮動
      randomScale: 0.5 + Math.random(), 
      // 隨機旋轉偏移：-1 ~ +1 之間
      randomRotate: (Math.random() - 0.5) * 2,
      
      // 隨機動畫參數
      duration: 5 + Math.random() * 10,
      delay: Math.random() * -20,
      opacity: 0.2 + Math.random() * 0.5,
    }));
  }, [quantity, animation]); // 注意：size 和 rotation 不需要觸發重新生成，直接用 style 控制即可

  if (!pattern || !mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        // 1. 定位層：決定位置
        <div
          key={item.id}
          className="absolute"
          style={{
            left: item.left,
            top: item.top,
          }}
        >
          {/* 2. 動畫層：負責動態效果 (Float, Twinkle, Fall) */}
          <div
            className={`
              ${animation === 'float' ? 'animate-float' : ''}
              ${animation === 'twinkle' ? 'animate-twinkle' : ''}
              ${animation === 'fall' ? 'animate-fall' : ''}
            `}
            style={{
              animationDuration: `${item.duration}s`,
              animationDelay: `${item.delay}s`,
              // 閃爍動畫自帶 opacity 變化，其他動畫則使用固定 opacity
              opacity: animation === 'twinkle' ? undefined : item.opacity,
            }}
          >
            {/* 3. 樣式層：負責使用者設定的大小與角度 */}
            {/* 這一層被包在動畫層裡面，所以會跟著動畫一起動，但保持自己的旋轉與縮放 */}
            <div
              className="text-4xl select-none"
              style={{
                transform: `
                  scale(${item.randomScale * size}) 
                  rotate(${item.randomRotate * rotation}deg)
                `,
              }}
            >
              {pattern}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}