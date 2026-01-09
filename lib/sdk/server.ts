import { supabase } from '@/lib/supabase';
import { isDayUnlockable } from './time';
import { CalendarProfile, DayContent } from './types';

export async function getCalendarProfile(slug: string): Promise<CalendarProfile | null> {
  const { data } = await supabase.from('calendars').select('*').eq('slug', slug).single();
  if (!data) return null;
  
  return {
    id: data.id,
    slug: data.slug,
    recipientName: data.recipient_name,
    themeColor: data.theme_color,
    hasPassword: !!data.access_code,
    background: data.background || 'classic',
    cardStyle: data.card_style || 'classic',
    startDate: data.start_date, // 確保型別定義有包含此欄位
    endDate: data.end_date      // 確保型別定義有包含此欄位
  };
}

export async function getSafeCalendarDays(calendarId: string, isAdmin: boolean = false): Promise<DayContent[]> {
  // 1. 先獲取日曆的開始日期資訊
  const { data: cal } = await supabase
    .from('calendars')
    .select('start_date')
    .eq('id', calendarId)
    .single();

  // 2. 獲取該日曆所有的內容格子
  const { data: rawDays } = await supabase
    .from('calendar_days')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('day_number', { ascending: true });

  if (!rawDays) return [];

  const daysMap = new Map(rawDays.map(d => [d.day_number, d]));
  const totalDays = rawDays.length; // 根據資料庫實際有的格子數量來產生

  // 3. 根據實際格數產生對應的資料
  return Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const dayData = daysMap.get(dayNum);
    
    // 將該日曆的 start_date 傳入判斷邏輯
    const timeUnlockable = isDayUnlockable(dayNum, cal?.start_date);
    
    const isAccessible = isAdmin || timeUnlockable;

    if (isAccessible && dayData) {
      return {
        day: dayNum,
        type: dayData.content_type as any,
        title: dayData.title,
        content: dayData.content,
        isLocked: false,
      };
    }
    
    return {
      day: dayNum,
      type: 'text',
      title: null,
      content: null,
      isLocked: true,
    };
  });
}