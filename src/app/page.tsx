'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import { adminApi, systemApi } from '@/lib/api';
import { FAQItem } from '@/lib/types';
import {
  Search,
  FileCheck2,
  FileSpreadsheet,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Bot,
  Scale,
  Users,
  Building2,
  Layers
} from 'lucide-react';

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 1,
    question: '১। জন্মের ৪৫ দিনের মধ্যে কিংবা পরবর্তী সময়েও নিবন্ধন করতে অনেক সময় পিতা মাতার জন্ম নিবন্ধন পাওয়া যায় না, করণীয় কি?',
    answer: 'জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী জন্ম নিবন্ধন সকলের জন্য বাধ্যতামূলক (ধারা ৫(১), ৬ক এবং ৮(১))। আইনের এ নির্দেশনা কেউ না মানলে তিনি আইন লঙ্ঘনকারী হিসাবে গণ্য হবেন এবং অনধিক ৫০০০ টাকা অর্থদণ্ডে দণ্ডিত হতে পারেন। তাছাড়া, এখন বিদ্যালয়ে ভর্তি, চাকরিতে নিয়োগ, পাসপোর্ট, জাতীয় পরিচয়পত্রসহ ১৯টি ক্ষেত্রে জন্ম সনদ আবশ্যক। পিতামাতার জন্ম নিবন্ধন না থাকলে পিতা ও মাতার জাতীয় পরিচয়পত্র/পাসপোর্ট বা বিকল্প স্থায়ী সনদের ভিত্তিতে নিবন্ধকের কার্যালয়ে বিশেষ অনুমোদন সাপেক্ষে আবেদন করা যায়।',
  },
  {
    id: 2,
    question: '২। জন্ম বা মৃত্যু নিবন্ধনের সরকারি ফি কত টাকা?',
    answer: 'জন্ম বা মৃত্যুর ৪৫ দিন পর্যন্ত: বিনামূল্যে (০ টাকা)। ৪৫ দিন হতে ৫ বছর পর্যন্ত: দেশি ২৫ টাকা (বিদেশে ১ মার্কিন ডলার)। ৫ বছর পরবর্তী যেকোনো বয়স: দেশি ৫০ টাকা (বিদেশে ২ মার্কিন ডলার)। তথ্য সংশোধন বা ডুপ্লিকেট সনদের জন্য সরকার নির্ধারিত ৫০-১০০ টাকা ফি প্রযোজ্য।',
  },
  {
    id: 3,
    question: '৩। অনলাইনে জন্ম নিবন্ধন সনদ কিভাবে যাচাই (Verify) করবেন?',
    answer: 'সনদ যাচাই করার জন্য সরকারি অনলাইন পোর্টালে (bdris.gov.bd) ১৭ ডিজিটের জন্ম নিবন্ধন নম্বর এবং জন্ম তারিখ (YYYY-MM-DD) প্রদান করে সহজেই তথ্য যাচাই করা যায়। অথবা আমাদের স্মার্ট চ্যাটবটে আপনার রেজিস্ট্রেশন নম্বর লিখেও তথ্য জানার নিয়ম জেনে নিতে পারেন।',
  },
  {
    id: 4,
    question: '৪। জন্ম সনদে নাম, পিতা-মাতার নাম বা বয়স সংশোধনের উপায় কি?',
    answer: 'সংশোধনের জন্য অনলাইন পোর্টালে নির্ধারিত "তথ্য সংশোধন" ফর্মে আবেদন করতে হবে। নামের বানানের ক্ষেত্রে শিক্ষাগত সনদ (SSC/JSC/PSC), জাতীয় পরিচয়পত্র অথবা পিতা-মাতার সঠিক তথ্যের প্রমাণক স্ক্যান কপি সংযুক্ত করে সংশ্লিষ্ট সিটি কর্পোরেশন/পৌরসভা/ইউনিয়ন পরিষদ কার্যালয়ে দাখিল করতে হবে।',
  },
  {
    id: 5,
    question: '৫। বিদেশে জন্ম গ্রহণকারী বাংলাদেশী নাগরিকের জন্ম নিবন্ধন কিভাবে হবে?',
    answer: 'বিদেশে অবস্থানরত বাংলাদেশী দূতাবাস/হাইকমিশনের কনস্যুলার শাখার মাধ্যমে অনলাইনে আবেদন দাখিল করতে হবে। প্রয়োজনীয় নথিপত্র হিসেবে স্থানীয় হাসপাতালের জন্ম সনদপত্র ও পিতামাতার বাংলাদেশী পাসপোর্ট আবশ্যক।',
  },
];

const SERVICE_CARDS = [
  {
    title: 'অনলাইন জন্ম নিবন্ধন আবেদন',
    desc: 'নতুন জন্ম নিবন্ধনের জন্য অনলাইনে সহজে আবেদন দাখিল করুন',
    tag: 'নতুন আবেদন',
    icon: FileSpreadsheet,
    color: 'from-emerald-600 to-green-600',
    prompt: 'নতুন জন্ম নিবন্ধন আবেদনের নিয়ম ও প্রয়োজনীয় নথিপত্র কি কি?',
  },
  {
    title: 'মৃত্যু নিবন্ধন আবেদন',
    desc: 'মৃত্যু সংক্রান্ত তথ্যাদি এন্ট্রি ও অনলাইন সনদের আবেদন ফর্ম',
    tag: 'নাগরিক সেবা',
    icon: FileCheck2,
    color: 'from-teal-600 to-cyan-600',
    prompt: 'মৃত্যু নিবন্ধন করতে কি কি কাগজপত্র প্রয়োজন এবং ফি কত?',
  },
  {
    title: 'জন্ম নিবন্ধন সনদ যাচাই',
    desc: '১৭ ডিজিটের সনদ নম্বর ও জন্ম তারিখ দিয়ে অনলাইন ভেরিফিকেশন',
    tag: 'ভেরিফিকেশন',
    icon: ShieldCheck,
    color: 'from-blue-600 to-indigo-600',
    prompt: 'অনলাইনে জন্ম সনদ ভেরিফাই বা যাচাই করার নিয়ম বিস্তারিত বলুন',
  },
  {
    title: 'সনদ তথ্য সংশোধন ও ডুপ্লিকেট',
    desc: 'নাম, বয়স বা অন্যান্য তথ্যের ভুল সংশোধন ও প্রিন্ট কপি',
    tag: 'সংশোধন',
    icon: Layers,
    color: 'from-amber-600 to-orange-600',
    prompt: 'জন্ম সনদে ভুল নাম বা বয়স কিভাবে সংশোধন করা যাবে?',
  },
];

const CITIZEN_NOTICES = [
  {
    id: 1,
    tag: 'বাধ্যতামূলক',
    tagColor: 'bg-red-600',
    text: '🔴 জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী সন্তান জন্মের ৪৫ দিনের মধ্যে নিবন্ধন সম্পন্ন করা সকলের জন্য বাধ্যতামূলক।',
    prompt: 'জন্ম নিবন্ধনের ৪৫ দিনের সময়সীমা ও বিধান সম্পর্কে বলুন',
  },
  {
    id: 2,
    tag: 'জরিমানা বিধিমালা',
    tagColor: 'bg-amber-700',
    text: '⚠️ ধারা ৫(১), ৬ক এবং ৮(১) লঙ্ঘন করলে অনধিক ৫,০০০ টাকা অর্থদণ্ডে দণ্ডিত হতে পারেন।',
    prompt: 'জন্ম ও মৃত্যু নিবন্ধন আইন লঙ্ঘনের জরিমানা ও শাস্তি কি?',
  },
  {
    id: 3,
    tag: '১৯টি ক্ষেত্রে ব্যবহার',
    tagColor: 'bg-emerald-700',
    text: '📋 বিদ্যালয়ে ভর্তি, পাসপোর্ট, জাতীয় পরিচয়পত্রসহ ১৯টি জরুরি নাগরিক সেবায় ডিজিটাল জন্ম সনদ আবশ্যক।',
    prompt: '১৯টি ক্ষেত্রে জন্ম সনদের ব্যবহার ও প্রয়োজনীয়তার তালিকা দিন',
  },
  {
    id: 4,
    tag: 'সরকারি ফি',
    tagColor: 'bg-blue-700',
    text: '💳 সরকারি ফি: ৪৫ দিন পর্যন্ত বিনামূল্যে (০ টাকা), ৫ বছর পর্যন্ত ২৫ টাকা এবং ৫ বছরের ঊর্ধ্বে ৫০ টাকা।',
    prompt: 'জন্ম ও মৃত্যু নিবন্ধনের সরকারি ফি তালিকা বিস্তারিত জানান',
  },
];

export default function HomePage() {
  const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDefaultPrompt, setChatDefaultPrompt] = useState<string | undefined>(undefined);
  const [systemOnline, setSystemOnline] = useState<boolean | null>(null);

  // Sequential Notice State: When one ends, the next one arrives from the right
  const [noticeIdx, setNoticeIdx] = useState(0);

  const handleNextNotice = () => {
    setNoticeIdx((prev) => (prev + 1) % CITIZEN_NOTICES.length);
  };

  // Load live FAQs & health check
  useEffect(() => {
    async function loadData() {
      try {
        const liveFaqs = await adminApi.getFaqs();
        if (liveFaqs && liveFaqs.length > 0) {
          setFaqs(liveFaqs);
        }
      } catch {
        // Fallback to rich default FAQs
      }

      try {
        const health = await systemApi.getHealth();
        setSystemOnline(health?.status === 'ok' || health?.status === 'healthy');
      } catch {
        setSystemOnline(true);
      }
    }
    loadData();
  }, []);

  const openChatWithPrompt = (promptText: string) => {
    setChatDefaultPrompt(promptText);
    setChatOpen(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openChatWithPrompt(searchQuery);
    } else {
      setChatOpen(true);
    }
  };

  const currentNotice = CITIZEN_NOTICES[noticeIdx];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-gray-800 antialiased selection:bg-emerald-200">
      <Navbar onOpenChat={() => setChatOpen(true)} />

      {/* Hero & Citizen Search Section */}
      <section className="relative bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 text-white overflow-hidden py-12 md:py-16">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200 mb-4 backdrop-blur-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>কৃত্রিম বুদ্ধিমত্তা সম্পন্ন হাইব্রিড RAG নাগরিক সহায়তা প্ল্যাটফর্ম</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-snug">
            স্মার্ট জন্ম ও মৃত্যু নিবন্ধন সহায়তা এবং তাৎক্ষণিক নাগরিক সেবা
          </h1>

          <p className="mt-4 text-xs sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত আইন, সরকারি বিধিমালা, আবেদন প্রক্রিয়া এবং যেকোনো প্রশ্নের তাৎক্ষণিক সঠিক উত্তর পেতে আমাদের এআই সহকারীকে জিজ্ঞাসা করুন।
          </p>

          {/* Citizen Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-2xl mx-auto relative flex items-center bg-white/95 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md border border-white/20 focus-within:ring-4 focus-within:ring-emerald-400/40 transition-all"
          >
            <div className="pl-3.5 pr-2 text-emerald-700">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো প্রশ্ন লিখুন (যেমন: জন্ম নিবন্ধনের ফি কত? সংশোধনের নিয়ম কি?)..."
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-2.5 px-2"
            />
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>সন্ধান করুন</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </form>

          {/* Quick prompt suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-200">
            <span className="opacity-80">জনপ্রিয় জিজ্ঞাসা:</span>
            <button
              onClick={() => openChatWithPrompt('জন্ম নিবন্ধনে কি কি কাগজপত্র লাগবে?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              প্রয়োজনীয় কাগজপত্র
            </button>
            <button
              onClick={() => openChatWithPrompt('জন্ম নিবন্ধন ফি কত টাকা?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              সরকারি ফি তালিকা
            </button>
            <button
              onClick={() => openChatWithPrompt('অনলাইনে জন্ম নিবন্ধন সনদ কিভাবে যাচাই করব?')}
              className="bg-emerald-800/60 hover:bg-emerald-700/80 px-2.5 py-1 rounded-full border border-emerald-700/50 transition-colors"
            >
              সনদ যাচাই করার নিয়ম
            </button>
          </div>
        </div>
      </section>

      {/* Sequential Notice Banner (One Ends -> Next One Arrives from Right) */}
      <section className="bg-amber-100/95 border-y border-amber-300 text-amber-950 py-2.5 px-3 sm:px-4 shadow-xs overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Static Alert Badge */}
          <div className="flex items-center gap-2 shrink-0 z-10 bg-amber-100/95 pr-2">
            <span className="bg-red-600 text-white font-black text-xs sm:text-sm px-2.5 py-1 rounded-md uppercase tracking-wide shrink-0 animate-pulse shadow-xs">
              জরুরি প্রজ্ঞাপন
            </span>
          </div>

          {/* Sequential Scrolling Track: Notice arrives from right, crosses to left, then ends & triggers next */}
          <div
            className="flex-1 overflow-hidden relative cursor-pointer group"
            title="ক্লিক করে এই সংক্রান্ত তথ্য জানুন (মাউস রাখলে স্ক্রল থামবে)"
            onClick={() => openChatWithPrompt(currentNotice.prompt)}
          >
            <div
              key={noticeIdx}
              onAnimationEnd={handleNextNotice}
              className="animate-notice-across whitespace-nowrap text-sm sm:text-base md:text-lg font-bold text-amber-950 flex items-center gap-3"
            >
              <span className={`text-[10px] sm:text-xs font-bold text-white px-2 py-0.5 rounded-sm shrink-0 ${currentNotice.tagColor}`}>
                {currentNotice.tag}
              </span>
              <span>{currentNotice.text}</span>
              <span className="text-emerald-700 text-xs font-semibold bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-2 py-0.5 rounded-md ml-2 shrink-0">
                বিস্তারিত জানুন 💬
              </span>
            </div>
          </div>

          {/* Action Link Button */}
          <div className="flex items-center shrink-0 z-10 bg-amber-100/95 pl-2">
            <button
              onClick={() => openChatWithPrompt(currentNotice.prompt)}
              className="text-emerald-800 hover:text-emerald-950 font-bold shrink-0 underline text-xs sm:text-sm transition-colors"
            >
              আইন জানুন →
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Service Cards Grid */}
        <section id="services">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-2 border-b border-gray-200">
            <div>
              <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">নাগরিক সেবা কর্নার</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                প্রয়োজনীয় সেবা এবং এআই নির্দেশিকা
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 md:mt-0">
              যেকোনো সেবায় ক্লিক করে সরাসরি এআই সহায়কের কাছে তথ্য ও নিয়ম জেনে নিন
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICE_CARDS.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => openChatWithPrompt(card.prompt)}
                  className="group bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-100">
                        {card.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                    <span>এআই সহায়ক জানুন</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Featured FAQs Section (Matches User's Government Portal Screenshot) */}
        <section id="faqs" className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-gray-200 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  আপনার জিজ্ঞাসা / প্রায়শই জিজ্ঞাসিত প্রশ্ন FAQ
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                জন্ম ও মৃত্যু নিবন্ধন বিষয়ক সচরাচর জিজ্ঞাসিত প্রশ্ন ও তার সঠিক সরকারি উত্তর
              </p>
            </div>

            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors border border-emerald-200"
            >
              <Bot className="w-3.5 h-3.5" />
              আপনার কোনো নিজস্ব প্রশ্ন আছে?
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isExpanded = activeFaqIndex === index;
              return (
                <div
                  key={faq.id || index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaqIndex(isExpanded ? null : index)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 select-none"
                  >
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-700 leading-relaxed border-t border-emerald-100/80 animate-in fade-in">
                      <p className="whitespace-pre-line">{faq.answer}</p>

                      <div className="mt-3 pt-2 flex items-center justify-between border-t border-emerald-200/50 text-[11px]">
                        <span className="text-emerald-800 font-medium">
                          💡 আরও গভীর তথ্য বা উপধারা জানতে চান?
                        </span>
                        <button
                          onClick={() => openChatWithPrompt(`"${faq.question}" - এ বিষয়ে বিস্তারিত ব্যাখ্যা ও নিয়ম বলুন।`)}
                          className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                        >
                          এআই-কে আরও জিজ্ঞাসা করুন →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Legal Guidelines & Act Highlights */}
        <section id="guidelines" className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-2xl text-white p-6 md:p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                <Scale className="w-3 h-3" />
                আইনি বাধ্যবাধকতা
              </div>
              <h3 className="text-lg sm:text-xl font-bold">
                জন্ম ও মৃত্যু নিবন্ধন আইন ২০০৪ অনুযায়ী ১৯টি জরুরি ক্ষেত্রে সনদের প্রয়োজনীয়তা
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                পাসপোর্ট ইস্যু, জাতীয় পরিচয়পত্র প্রাপ্তি, সকল স্তরের শিক্ষাপ্রতিষ্ঠানে ভর্তি, সরকারি-বেসরকারি চাকরি প্রাপ্তি, ড্রাইভিং লাইসেন্স, জমি রেজিস্ট্রেশন ও ব্যাংক একাউন্ট খোলার মতো প্রতিটি ক্ষেত্রে সঠিক জন্ম নিবন্ধন অপরিহার্য।
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center space-y-2">
              <span className="text-xs text-emerald-200 font-semibold">তাৎক্ষণিক সহায়তা প্রয়োজন?</span>
              <p className="text-sm font-bold text-amber-300">হটলাইন: ১৬১২২ অথবা ৩৩৩</p>
              <button
                onClick={() => openChatWithPrompt('১৯টি ক্ষেত্রে জন্ম সনদের বাধ্যবাধকতা ও ব্যবহারের তালিকা দিন')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold py-2 rounded-lg transition-colors"
              >
                এআই থেকে তালিকা দেখুন
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Chatbot Widget in Bottom-Right Corner */}
      <FloatingChatWidget
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        defaultPrompt={chatDefaultPrompt}
      />
    </div>
  );
}
