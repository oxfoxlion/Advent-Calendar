export type CalendarProfile = {
  id: string;
  slug: string;
  recipientName: string;
  themeColor: string;
  hasPassword: boolean;
  background: string; 
  cardStyle: string;  
};

export type DayContent = {
  day: number;
  // ★ 修改：加入 spotify, map, scratch, typewriter
  type: 'text' | 'image' | 'video' | 'youtube' | 'quiz' | 'spotify' | 'map' | 'scratch' | 'typewriter'| 'link';
  title: string | null;
  content: string | null;
  isLocked: boolean;
};