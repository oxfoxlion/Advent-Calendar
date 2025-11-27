import { supabase } from '@/lib/supabase';
import { isDayUnlockable } from './time';
import { CalendarProfile, DayContent } from './types';

export async function getCalendarProfile(slug: string): Promise<CalendarProfile | null> {
  const { data } = await supabase.from('calendars').select('*').eq('slug', slug).single();
  if (!data) return null;
  return {
    id: data.id, slug: data.slug,
    recipientName: data.recipient_name, themeColor: data.theme_color,
    hasPassword: !!data.access_code,
  };
}

export async function getSafeCalendarDays(calendarId: string): Promise<DayContent[]> {
  const { data: rawDays } = await supabase
    .from('calendar_days')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('day_number', { ascending: true });

  const daysMap = new Map(rawDays?.map(d => [d.day_number, d]));

  // 產生 1-25 天
  return Array.from({ length: 25 }, (_, i) => {
    const dayNum = i + 1;
    const dayData = daysMap.get(dayNum);
    const unlockable = isDayUnlockable(dayNum);

    if (unlockable && dayData) {
      return {
        day: dayNum,
        type: dayData.content_type as any,
        title: dayData.title,
        content: dayData.content,
        isLocked: false,
      };
    }
    
    // 沒資料或未解鎖 -> 鎖住並隱藏內容
    return {
      day: dayNum,
      type: 'text',
      title: null,
      content: null,
      isLocked: true,
    };
  });
}