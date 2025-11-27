export type CalendarProfile = {
  id: string;
  slug: string;
  recipientName: string;
  themeColor: string; // 雖然我們現在主要用 style，但保留此欄位以防萬一
  hasPassword: boolean;
  background: string; // 背景風格 (classic, winter, cozy, sugar)
  cardStyle: string;  // 卡片風格 (classic, winter, cozy, sugar)
};

export type DayContent = {
  day: number;
  type: 'text' | 'image' | 'video' | 'youtube';
  title: string | null;
  content: string | null;
  isLocked: boolean;
};