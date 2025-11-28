'use client';

import { Bell } from 'lucide-react';

export default function ReminderButton({ title }: { title: string }) {
  const handleAddToCalendar = () => {
    const currentUrl = window.location.href;
    // 這裡我直接先幫您用「降臨曆」這個詞
    const eventTitle = `[降臨曆] ${title} 的每日驚喜`;
    const details = `記得回來打開今天的禮物喔！\n連結：${currentUrl}`;
    
    // 設定時間：2025/12/01 早上 09:00 - 09:10
    // 格式為 YYYYMMDDThhmmss
    const startDate = '20251201T090000';
    const endDate = '20251201T091000';
    
    // 設定重複規則：每天一次，共 25 次 (直到 12/25)
    const recurrence = 'RRULE:FREQ=DAILY;COUNT=25';

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&recur=${encodeURIComponent(recurrence)}`;

    window.open(calendarUrl, '_blank');
  };

  return (
    <button 
      onClick={handleAddToCalendar}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm transition-all border border-white/20 backdrop-blur-sm"
      title="加入 Google 日曆提醒"
    >
      <Bell className="w-4 h-4" />
      <span>每日提醒</span>
    </button>
  );
}