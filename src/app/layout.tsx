import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'জন্ম ও মৃত্যু নিবন্ধন কার্যালয় | স্মার্ট এআই নাগরিক সেবা পোর্টাল',
  description: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার - জন্ম ও মৃত্যু নিবন্ধন বিধিমালা এবং তাৎক্ষণিক কৃত্রিম বুদ্ধিমত্তা চালিত নাগরিক সেবা সহকারী।',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-slate-50 text-gray-900 antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
