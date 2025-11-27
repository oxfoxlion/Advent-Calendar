import { toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'Asia/Taipei';

export function isDayUnlockable(dayNumber: number): boolean {
  // ★ 開發測試開關：設為 true 則全部解鎖，上線前記得改回 false
  const DEBUG_MODE = true; 
  if (DEBUG_MODE) return true;

  const now = new Date();
  const taipeiTime = toZonedTime(now, TIME_ZONE);
  const currentMonth = taipeiTime.getMonth() + 1; 
  const currentDay = taipeiTime.getDate();

  // 12月才開始判定
  if (currentMonth !== 12) return false;
  return currentDay >= dayNumber;
}