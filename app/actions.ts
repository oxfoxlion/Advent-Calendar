'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function verifyAccess(slug: string, password: string) {
  const { data } = await supabase.from('calendars').select('access_code').eq('slug', slug).single();
  if (data && data.access_code === password) {
    const cookieStore = await cookies();
    cookieStore.set(`access-${slug}`, 'granted', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30 });
    return { success: true };
  }
  return { success: false };
}

export async function verifyAdmin(slug: string, password: string) {
  const { data } = await supabase.from('calendars').select('admin_code').eq('slug', slug).single();
  if (data && data.admin_code === password) {
    const cookieStore = await cookies();
    cookieStore.set(`admin-${slug}`, 'granted', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 });
    return { success: true };
  }
  return { success: false };
}

export async function createCalendar(formData: FormData) {
  const rawSlug = formData.get('slug') as string;
  const slug = rawSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');

  if (!slug) return { success: false, message: '網址格式不正確', field: 'slug' };

  const { data: existing } = await supabase.from('calendars').select('slug').eq('slug', slug).single();
  if (existing) return { success: false, message: '這個網址已經有人使用了，請換一個試試！', field: 'slug' };

  const recipientName = formData.get('recipientName') as string;
  const adminCode = formData.get('adminCode') as string;
  const accessCode = formData.get('accessCode') as string || null;
  
  if (accessCode && accessCode === adminCode) {
    return { success: false, message: '為了安全起見，訪客密碼不能與管理員密碼相同！', field: 'accessCode' };
  }

  const themeColor = formData.get('themeColor') as string;
  const background = formData.get('background') as string || 'custom-bg:#450a0a,#14532d';
  const cardStyle = formData.get('cardStyle') as string || 'custom-card:#7f1d1d';

  const { data: calendar, error } = await supabase
    .from('calendars')
    .insert({
      slug, recipient_name: recipientName, admin_code: adminCode, access_code: accessCode,
      theme_color: themeColor, background: background, card_style: cardStyle
    })
    .select().single();

  if (error || !calendar) {
    console.error('Error creating calendar:', error);
    return { success: false, message: '建立失敗，請稍後再試', field: 'root' };
  }

  const days = Array.from({ length: 25 }, (_, i) => ({
    calendar_id: calendar.id, 
    day_number: i + 1, 
    content_type: 'text', 
    title: null, 
    content: '還沒有內容喔！'
  }));

  const { error: daysError } = await supabase.from('calendar_days').insert(days);

  if (daysError) {
    console.error('Error creating days:', daysError);
    return { success: false, message: '初始化日期失敗', field: 'root' };
  }

  const cookieStore = await cookies();
  cookieStore.set(`admin-${slug}`, 'granted', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 });

  redirect(`/${slug}/edit`);
}

export async function updateDay(slug: string, day: number, formData: FormData) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  if (!isAdmin) return { success: false, message: 'Unauthorized' };
  const { data: cal } = await supabase.from('calendars').select('id').eq('slug', slug).single();
  if (!cal) return { success: false, message: 'Calendar not found' };
  const { error } = await supabase.from('calendar_days').update({ 
      title: formData.get('title') as string,
      content: formData.get('content') as string, 
      content_type: formData.get('type') as string 
    }).match({ calendar_id: cal.id, day_number: day });
  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function updateCalendarSettings(formData: FormData) {
  const slug = formData.get('slug') as string;
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';
  if (!isAdmin) return { success: false, message: 'Unauthorized' };
  const { error } = await supabase.from('calendars').update({ 
      recipient_name: formData.get('recipientName') as string, 
      theme_color: formData.get('themeColor') as string,
      background: formData.get('background') as string,
      card_style: formData.get('cardStyle') as string
    }).eq('slug', slug);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

// ★ 新增：更新密碼的功能
export async function updatePasswords(formData: FormData) {
  const slug = formData.get('slug') as string;
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(`admin-${slug}`)?.value === 'granted';

  if (!isAdmin) return { success: false, message: '權限不足' };

  const adminCode = formData.get('adminCode') as string;
  const accessCode = formData.get('accessCode') as string;
  const useGuestPassword = formData.get('useGuestPassword') === 'on';

  const updates: any = {};

  // 更新管理員密碼 (如果有填)
  if (adminCode && adminCode.trim() !== '') {
    updates.admin_code = adminCode;
  }

  // 更新訪客密碼
  if (useGuestPassword) {
    // 如果勾選啟用，且有填寫新密碼，則更新；若沒填則保持原樣 (這邏輯由前端控制，後端這裡只要收到值就更新)
    if (accessCode && accessCode.trim() !== '') {
      updates.access_code = accessCode;
    }
  } else {
    // 如果沒勾選啟用，則設為 NULL (公開)
    updates.access_code = null;
  }

  // 檢查訪客密碼是否與管理員密碼相同 (如果有更新的話)
  if (updates.admin_code && updates.access_code && updates.admin_code === updates.access_code) {
    return { success: false, message: '訪客密碼不能與管理員密碼相同！' };
  }

  if (Object.keys(updates).length === 0) {
    return { success: true, message: '沒有變更任何設定' };
  }

  const { error } = await supabase.from('calendars').update(updates).eq('slug', slug);

  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function logout(slug: string) {
  const cookieStore = await cookies();
  cookieStore.delete(`admin-${slug}`);
  cookieStore.delete(`access-${slug}`);
  redirect(`/${slug}`);
}