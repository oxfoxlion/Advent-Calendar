export type CalendarProfile = {
  id: string;
  slug: string;
  recipientName: string;
  themeColor: string;
  hasPassword: boolean;
};

export type DayContent = {
  day: number;
  type: 'text' | 'image' | 'video' | 'youtube';
  title: string | null;
  content: string | null;
  isLocked: boolean;
};