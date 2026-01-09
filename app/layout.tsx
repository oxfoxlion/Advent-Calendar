import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "倒數日曆製作工具 | Shao", // 適用於首頁 (例如 / )
    template: "%s | Shao", // 適用於其他動態頁面，會自動在頁面標題後加上 | Shao
  },
  // 優化描述文字，讓 SEO 更好
  description: "為重要的人準備倒數驚喜，免費製作專屬的倒數日曆。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
