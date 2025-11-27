'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * 1. 驗證訪客權限 (用於查看受保護的降臨曆)
 */
export async function verifyAccess(slug: string, password: string) {
  const { data } = await supabase
    .from('calendars')
    .select('access_code')
    .eq('slug', slug)
    .single();
  
  if (data && data.access_code === password) {
    const cookieStore = await cookies();
    
    // 設定訪客 cookie (30天有效)
    cookieStore.set(`access-${slug}`, 'granted', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60 * 24 * 30 
    });

    return { success: true };
  }
  return { success: false };
}

/**
 * 2. 驗證管理員權限 (用於進入編輯模式)
 */
export async function verifyAdmin(slug: string, password: string) {
  const { data } = await supabase
    .from('calendars')
    .select('admin_code')
    .eq('slug', slug)
    .single();

  if (data && data.admin_code === password) {
    const cookieStore = await cookies();
    
    // 設定管理員 cookie (1天有效，因為權限較大)
    cookieStore.set(`admin-${slug}`, 'granted', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 
    });

    return { success: true };
  }
  return { success: false };
}

/**
 * 3. 建立新的降臨曆 (包含背景與卡片樣式)
 */
export async function createCalendar(formData: FormData) {
  const slug = formData.get('slug') as string;
  const recipientName = formData.get('recipientName') as string;
  const adminCode = formData.get('adminCode') as string;
  const accessCode = formData.get('accessCode') as string || null;
  const themeColor = formData.get('themeColor') as string;
  
  // 修改這裡：預設值改為新版格式 (經典紅綠)
  const background = formData.get('background') as string || 'custom-bg:#450a0a,#14532d';
  const cardStyle = formData.get('cardStyle') as string || 'custom-card:#7f1d1d';

  // 1. 建立主檔
  const { data: calendar, error } = await supabase
    .from('calendars')
    .insert({
      slug,
      recipient_name: recipientName,
      admin_code: adminCode,
      access_code: accessCode,
      theme_color: themeColor,
      background: background,
      card_style: cardStyle
    })
    .select()
    .single();

  if (error || !calendar) {
    console.error('Error creating calendar:', error);
    return;
  }

  // 2. 自動建立 25 天的初始空白資料
  const days = Array.from({ length: 25 }, (_, i) => ({
    calendar_id: calendar.id,
    day_number: i + 1,
    content_type: 'text',
    title: `Day ${i + 1}`,
    content: '還沒有內容喔！'
  }));

  const { error: daysError } = await supabase.from('calendar_days').insert(days);

  if (daysError) {
    console.error('Error creating days:', daysError);
    return;
  }

  // 3. 建立成功後，自動幫建立者登入管理員權限
  const cookieStore = await cookies();
  cookieStore.set(`admin-${slug}`, 'granted', {
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 
  });

  // 4. 跳轉到編輯頁面
  redirect(`/${slug}/edit`);
}

/**
 * 4. 更新某一天的內容 (標題、類型、內容)
 */
export async function updateDay(slug: string, day: number, formData: FormData) {
  // 權限檢查
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  if (!isAdmin) return { success: false, message: 'Unauthorized' };

  // 先查 calendar_id
  const { data: cal } = await supabase.from('calendars').select('id').eq('slug', slug).single();
  if (!cal) return { success: false, message: 'Calendar not found' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const type = formData.get('type') as string;

  // 更新資料
  const { error } = await supabase
    .from('calendar_days')
    .update({ 
      title, 
      content, 
      content_type: type 
    })
    .match({ calendar_id: cal.id, day_number: day });

  if (error) return { success: false, message: error.message };
  
  return { success: true };
}

/**
 * 5. 更新降臨曆的全域設定 (標題、背景、顏色、卡片樣式)
 */
export async function updateCalendarSettings(formData: FormData) {
  const slug = formData.get('slug') as string;
  
  // 權限檢查
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  if (!isAdmin) return { success: false, message: 'Unauthorized' };

  const recipientName = formData.get('recipientName') as string;
  const themeColor = formData.get('themeColor') as string;
  const background = formData.get('background') as string;
  const cardStyle = formData.get('cardStyle') as string;

  const { error } = await supabase
    .from('calendars')
    .update({ 
      recipient_name: recipientName, 
      theme_color: themeColor,
      background: background,
      card_style: cardStyle
    })
    .eq('slug', slug);

  if (error) return { success: false, message: error.message };
  return { success: true };
}