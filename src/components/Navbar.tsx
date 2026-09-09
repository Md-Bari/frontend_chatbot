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
  UserPlus
} from 'lucide-react';

export default function Navbar({ onOpenChat }: { onOpenChat?: () => void }) {
  const { user, logout } = useAuth();
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Auth modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
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
            <button
              onClick={onOpenChat}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <span className="w-2 h-2 rounded-full bg-green-300 animate-ping"></span>
              স্মার্ট এআই চ্যাটবট
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-gray-100 text-xs text-gray-500">
                      <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="truncate text-[10px]">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      লগ আউট (Sign Out)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openAuth('login')}
                  className="text-xs text-emerald-800 font-bold hover:text-emerald-950 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 flex items-center gap-1 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  নাগরিক লগইন
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="text-xs bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  নিবন্ধন
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
              <Link href="/" className="px-3 py-1.5 rounded-sm bg-emerald-800/80 hover:bg-emerald-900 transition-colors">
                হোম (Home)
              </Link>
              <a href="#services" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                নাগরিক সেবাসমূহ
              </a>
              <a href="#faqs" className="px-3 py-1.5 rounded-sm hover:bg-emerald-800 transition-colors">
                জিজ্ঞাসা ও উত্তর (FAQ)
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
            <a href="#services" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>নাগরিক সেবাসমূহ</a>
            <a href="#faqs" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>জিজ্ঞাসা ও উত্তর (FAQ)</a>
            <a href="#notices" className="block py-1.5 hover:text-emerald-200" onClick={() => setMobileMenuOpen(false)}>নোটিশ ও প্রজ্ঞাপন</a>
            <div className="pt-2 border-t border-emerald-700 space-y-2">
              {!user ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuth('login');
                    }}
                    className="flex-1 bg-white text-emerald-800 font-bold py-2 rounded-lg text-center text-xs"
                  >
                    নাগরিক লগইন
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuth('signup');
                    }}
                    className="flex-1 bg-emerald-900 text-white font-bold py-2 rounded-lg text-center text-xs border border-emerald-700"
                  >
                    নিবন্ধন
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full bg-red-600 text-white font-bold py-2 rounded-lg text-center text-xs"
                >
                  লগ আউট ({user.name || user.email})
                </button>
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
