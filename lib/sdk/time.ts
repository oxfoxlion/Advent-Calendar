import { toZonedTime } from 'date-fns-tz';
import { differenceInDays, startOfDay, parseISO } from 'date-fns';

const TIME_ZONE = 'Asia/Taipei';

export function isDayUnlockable(dayNumber: number, startDateStr?: string): boolean {
  // ★ 修改：將測試模式改為 false，這樣時間限制才會生效
  const DEBUG_MODE = false; 
  if (DEBUG_MODE) return true;

  const now = new Date();
  const taipeiTime = toZonedTime(now, TIME_ZONE);
  const startAt = startDateStr ? parseISO(startDateStr) : new Date(2025, 11, 1);
  const daysDiff = differenceInDays(startOfDay(taipeiTime), startOfDay(startAt)) + 1;

  // 12月才開始判定 (非12月都不解鎖)
  return daysDiff >= dayNumber;
}