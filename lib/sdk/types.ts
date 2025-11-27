export type CalendarProfile = {
  id: string;
  slug: string;
  recipientName: string;
  themeColor: string;
  hasPassword: boolean;
  // 背景風格：支援舊版代號 (classic) 或新版格式 (custom-bg:color1,color2)
  background: string; 
  // 卡片風格：支援舊版代號 (classic) 或新版格式 (custom-card:color)
  cardStyle: string;  
};

export type DayContent = {
  day: number;
  type: 'text' | 'image' | 'video' | 'youtube';
  title: string | null;
  content: string | null;
  isLocked: boolean;
};