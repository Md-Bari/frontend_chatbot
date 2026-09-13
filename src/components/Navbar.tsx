'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import { 
  Globe, 
  PhoneCall, 
  User as UserIcon, 
  LogOut, 
  HelpCircle,
  Menu,
  X,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ onOpenChat }: { onOpenChat?: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'forgot'>('login');

  const openAuth = (mode: 'login' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="w-full bg-white border-b border-emerald-800/10 shadow-xs sticky top-0 z-40">
        {/* Top Gov Banner Strip */}
        <div className="bg-emerald-800 text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              বাংলাদেশ জাতীয় তথ্য বাতায়ন | গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] sm:text-xs">
            <span className="hidden sm:flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-300" />
              হটলাইন: <strong className="font-semibold text-emerald-200">১৬১২২ / ৩৩৩</strong>
            </span>
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 bg-emerald-900/60 hover:bg-emerald-950 px-2 py-0.5 rounded text-[11px] transition-colors"
            >
              <Globe className="w-3 h-3 text-emerald-300" />
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>

        {/* Main Branding Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 drop-shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-emerald-950 leading-tight">
                রেজিস্ট্রার জেনারেলের কার্যালয়, জন্ম ও মৃত্যু নিবন্ধন
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                স্থানীয় সরকার বিভাগ • স্মার্ট নাগরিক সেবা পোর্টাল ও এআই সহায়ক
              </p>
            </div>
          </Link>

          {/* Action icons & User Session */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs border border-emerald-700 hover:border-emerald-600 active:scale-95"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                    <span>অ্যাডমিন ড্যাশবোর্ড</span>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {(user.name || user.username || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="text-left flex flex-col">
                      <span className="max-w-[130px] truncate leading-tight font-bold text-slate-900">
                        {user.name || user.username || user.email || 'ইউজার'}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-mono uppercase font-semibold leading-none">
                        {isAdmin ? 'অ্যাডমিন' : 'নাগরিক'}
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3.5 py-2.5 border-b border-slate-100 text-xs">
                        <p className="font-bold text-slate-900 truncate">
                          {user.name || user.username || 'ইউজার'}
                        </p>
                        {user.email && <p className="truncate text-[10px] text-slate-500">{user.email}</p>}
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-mono font-bold">
                          {isAdmin ? 'Administrator' : 'Citizen User'}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 border-b border-slate-100 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>অ্যাডমিন ড্যাশবোর্ড</span>
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>লগ আউট (Sign Out)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openAuth('login')}
                  className="text-xs bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 px-3.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  নাগরিক ও অ্যাডমিন লগইন
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-emerald-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation Sub-bar */}
        <nav className="bg-emerald-700 text-white shadow-inner hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center space-x-1 py-1">
              <Link href="#" className="px-3 py-1.5 rounded-sm bg-emerald-800/80 hover:bg-emerald-900 transition-colors">
                হোম (Home)
              </Link>
              <a href="#features" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                বৈশিষ্ট্য ও প্রযুক্তি
              </a>
              <a href="#services" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                নাগরিক সেবাসমূহ
              </a>
              <a href="#notices" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                নোটিশ ও প্রজ্ঞাপন
              </a>
              <a href="#guidelines" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                আবেদন নির্দেশিকা
              </a>
            </div>

            <div className="flex items-center">
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-semibold px-3 py-1 rounded shadow-xs text-xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                যেকোনো প্রশ্ন করুন
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-emerald-800 text-white px-4 py-3 space-y-2 border-t border-emerald-700">
            <Link href="/" className="block py-1.5 hover:text-emerald-200">হোম</Link>
            <a href="#features" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>বৈশিষ্ট্য ও প্রযুক্তি</a>
            <a href="#services" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>নাগরিক সেবাসমূহ</a>
            <a href="#notices" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>নোটিশ ও প্রজ্ঞাপন</a>
            <div className="pt-2 border-t border-emerald-700 space-y-2">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuth('login');
                  }}
                  className="w-full bg-white text-emerald-800 font-bold py-2 rounded-lg text-center text-xs shadow-xs"
                >
                  নাগরিক ও অ্যাডমিন লগইন
                </button>
              ) : (
                <div className="space-y-2">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-2 shadow-xs"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
                      <span>অ্যাডমিন ড্যাশবোর্ড</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>লগ আউট ({user.name || user.username || user.email})</span>
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenChat) onOpenChat();
                }}
                className="w-full bg-amber-400 text-emerald-950 font-bold py-2 rounded-lg text-center text-xs"
              >
                এআই চ্যাটবট খুলুন
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Popup Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
