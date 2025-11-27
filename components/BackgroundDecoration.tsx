'use client';

import { useEffect, useState } from 'react';

export default function BackgroundDecoration({ pattern }: { pattern?: string }) {
  const [mounted, setMounted] = useState(false);

  // 避免 Hydration Mismatch (因為隨機位置在 Server/Client 會不同)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!pattern || !mounted) return null;

  // 產生 12 個隨機位置的裝飾
  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    scale: 0.5 + Math.random() * 1, // 大小 0.5x ~ 1.5x
    opacity: 0.1 + Math.random() * 0.2, // 透明度 0.1 ~ 0.3
    rotate: Math.random() * 360,
    duration: 10 + Math.random() * 20, // 動畫時間
    delay: Math.random() * -20,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute animate-float text-4xl select-none"
          style={{
            left: item.left,
            top: item.top,
            opacity: item.opacity,
            transform: `scale(${item.scale}) rotate(${item.rotate}deg)`,
            // 如果您有定義 float 動畫，可以加上 animation，或是簡單的靜態呈現
            // 這裡簡單示範靜態隨機分佈，若要動畫可配合 Tailwind Config
          }}
        >
          {pattern}
        </div>
      ))}
    </div>
  );
}