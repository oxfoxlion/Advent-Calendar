// components/ReminderButton.tsx (局部修改)
'use client';

import { Bell } from 'lucide-react';
import { DayContent, CalendarProfile } from '@/lib/sdk/types';

export default function ReminderButton({ 
  profile, 
  days 
}: { 
  profile: CalendarProfile; 
  days: DayContent[] 
}) {
  const handleSubscribe = () => {
    // 1. 取得開始日期並格式化
    // 預期 profile.startDate 為 "YYYY-MM-DD"
    const startDateRaw = profile.startDate || '2025-12-01';
    const dateParts = startDateRaw.split('-');
    const formattedStartDate = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T080000`; // 早上 8 點提醒
    const formattedEndDate = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T081500`;

    const eventTitle = `✨ [驚喜提醒] 該打開 ${profile.recipientName} 的日曆驚喜囉！`;
    const details = `親愛的，今天的驚喜已經準備好囉！快來打開看看吧：\n${window.location.href}`;
    
    // 2. 設定循環天數與日曆天數一致
    const recurrence = `RRULE:FREQ=DAILY;COUNT=${days.length}`;
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formattedStartDate}/${formattedEndDate}&details=${encodeURIComponent(details)}&recur=${encodeURIComponent(recurrence)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <button
      onClick={handleSubscribe}
      className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-slate-800 px-4 py-2 rounded-full text-sm font-bold transition-all border border-white/40 backdrop-blur-sm shadow-sm"
    >
      <Bell className="w-4 h-4" />
      訂閱每日提醒
    </button>
  );
}