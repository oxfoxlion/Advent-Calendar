import { toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'Asia/Taipei';

export function isDayUnlockable(dayNumber: number): boolean {
  // ★ 修改：將測試模式改為 false，這樣時間限制才會生效
  const DEBUG_MODE = false; 
  if (DEBUG_MODE) return true;

  const now = new Date();
  const taipeiTime = toZonedTime(now, TIME_ZONE);
  const currentMonth = taipeiTime.getMonth() + 1; 
  const currentDay = taipeiTime.getDate();

  // 12月才開始判定 (非12月都不解鎖)
  if (currentMonth !== 12) return false;
  return currentDay >= dayNumber;
}