'use client';

import { Bell } from 'lucide-react';

export default function ReminderButton({ title }: { title: string }) {
  const handleAddToCalendar = () => {
    const currentUrl = window.location.href;
    const eventTitle = `[降臨曆] ${title} 的每日驚喜`;
    const details = `記得回來打開今天的禮物喔！\n連結：${currentUrl}`;
    const startDate = '20251201T090000';
    const endDate = '20251201T091000';
    const recurrence = 'RRULE:FREQ=DAILY;COUNT=25';
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(details)}&recur=${encodeURIComponent(recurrence)}`;

    window.open(calendarUrl, '_blank');
  };

  return (
    <button 
      onClick={handleAddToCalendar}
      // 保留 rounded-full，改用淺色背景與深色文字
      className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-800 px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/40 backdrop-blur-sm shadow-sm"
      title="加入 Google 日曆提醒"
    >
      <Bell className="w-4 h-4" />
      <span>訂閱每日提醒</span>
    </button>
  );
}