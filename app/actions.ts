'use server';

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers'; // 確保有引入

export async function verifyAccess(slug: string, password: string) {
  const { data } = await supabase
    .from('calendars')
    .select('access_code')
    .eq('slug', slug)
    .single();
  
  if (data && data.access_code === password) {
    
    // 👇 修改這裡：先 await cookies() 拿到 cookieStore，再設定
    const cookieStore = await cookies();
    
    cookieStore.set(`access-${slug}`, 'granted', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // 建議加上環境判斷
      maxAge: 60 * 60 * 24 * 30 
    });

    return { success: true };
  }
  return { success: false };
}