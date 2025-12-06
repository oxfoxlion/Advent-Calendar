'use client';

import { useState, useRef, useEffect } from 'react';
import { addMessage } from '@/app/actions';
import { useRouter } from 'next/navigation';
// ★ 修改：引入 Check icon for the success message
import { MessageCircle, X, Send, User, Loader2, Minimize2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
};

export default function FloatingGuestbook({ slug, initialMessages }: { slug: string, initialMessages: Message[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  // ★ 新增狀態：追蹤訊息是否已送出
  const [isSent, setIsSent] = useState(false); 
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新增：已讀狀態管理
  const [readIds, setReadIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false); 

  // 1. 初始化：從 localStorage 讀取已讀紀錄
  useEffect(() => {
    const saved = localStorage.getItem(`guestbook-read-${slug}`);
    if (saved) {
      try {
        setReadIds(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse read messages', e);
      }
    }
    setHasLoaded(true);
  }, [slug]);

  // 2. 當視窗打開時，將當前所有訊息標記為已讀
  useEffect(() => {
    if (isOpen && initialMessages.length > 0) {
      const allIds = initialMessages.map(m => m.id);
      
      // 使用 Set 來合併新舊 ID，並去除重複
      const uniqueIds = Array.from(new Set([...readIds, ...allIds]));

      // 只有當已讀數量變多時才更新 (避免不必要的渲染/寫入)
      if (uniqueIds.length > readIds.length) {
        setReadIds(uniqueIds);
        localStorage.setItem(`guestbook-read-${slug}`, JSON.stringify(uniqueIds));
      }
    }
  }, [isOpen, initialMessages, readIds, slug]);

  // 3. 計算未讀數量 (總訊息 - 已讀訊息)
  const unreadCount = initialMessages.filter(msg => !readIds.includes(msg.id)).length;

  // 當有新訊息或打開視窗時，自動捲動到底部
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, initialMessages]);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    // 預設將 isSent 設為 false
    setIsSent(false); 

    const res = await addMessage(slug, formData);
    setIsPending(false);

    if (res.success) {
      formRef.current?.reset();
      router.refresh(); 
      
      // ★ 核心修改：送出成功後顯示提示
      setIsSent(true);
      setTimeout(() => setIsSent(false), 3000); // 3秒後隱藏提示
    }
  };

  return (
    <>
      {/* 1. 懸浮按鈕 (Floating Action Button) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-colors duration-300 flex items-center justify-center ${
          isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        
        {/* 只顯示「未讀」數量 */}
        {!isOpen && hasLoaded && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[20px] animate-bounce">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* 2. 聊天室視窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[90vw] max-w-[360px] h-[500px] max-h-[70vh] bg-white/90 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-100/50 border-b border-slate-200 flex justify-between items-center backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-slate-800">暖心留言板</h3>
                <p className="text-xs text-slate-500">
                  {initialMessages.length} 則留言・歡迎打卡簽到
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition">
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Message List */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
            >
              {initialMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-2 opacity-60">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <p>還沒有留言，<br/>成為第一個簽到的人吧！</p>
                </div>
              ) : (
                initialMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-baseline gap-2 px-1">
                      <span className="text-xs font-bold text-slate-700">{msg.sender_name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.created_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm text-slate-600 leading-relaxed break-words">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-slate-100">
              {/* ★ 新增：成功提示 */}
              <AnimatePresence>
                {isSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-center gap-2 mb-2 p-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold shadow-md animate-in fade-in slide-in-from-bottom-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>訊息已送出！</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* 結束新增 */}
              
              <form ref={formRef} action={handleSubmit} className="flex flex-col gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input 
                    name="senderName" 
                    required 
                    placeholder="你的暱稱" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                </div>
                <div className="relative flex items-center">
                  <input 
                    name="content" 
                    required 
                    autoComplete="off"
                    placeholder="寫下你的祝福..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-3 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="absolute right-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}