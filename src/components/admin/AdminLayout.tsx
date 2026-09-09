'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  LogOut,
  Database,
  Menu,
  X,
  Bot
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard & Stats', icon: LayoutDashboard },
  { href: '/admin/documents', label: 'PDF Documents KB', icon: FileText },
  { href: '/admin/faqs', label: 'FAQ Knowledge Base', icon: HelpCircle },
  { href: '/admin/users', label: 'Registered Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/admin/login');
      } else if (!isAdmin) {
        router.push('/admin/login?error=unauthorized');
      }
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-600">Verifying administrator authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center shrink-0 border border-emerald-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="বাংলাদেশ সরকার" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-sm text-emerald-950 tracking-tight">ADMIN PORTAL</span>
              
            </div>
          </Link>
        </div>

        {/* Right tools */}
        <div className="flex items-center space-x-3">
          {/* User profile & logout */}
          <div className="flex items-center space-x-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.name || 'Admin User'}</p>
              <p className="text-[10px] text-emerald-700 font-bold font-mono">{user.role}</p>
            </div>
            <button
              onClick={() => logout().then(() => router.push('/admin/login'))}
              title="Sign Out of Admin"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 top-16 w-64 bg-white border-r border-slate-200 flex flex-col z-30 transition-transform duration-200 md:static md:translate-x-0 shadow-xs ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Knowledge Base Management
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>ChromaDB & BM25</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                LangChain Hybrid RAG pipeline with Reciprocal Rank Fusion (RRF).
              </p>
            </div>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-xs"
            >
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>Go to Public Portal</span>
            </Link>
          </div>
        </aside>

        {/* Main Admin Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
