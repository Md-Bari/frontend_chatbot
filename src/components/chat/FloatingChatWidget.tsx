'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi, chatApi, clearAuthToken, notifyTokenExpired } from '@/lib/api';
import { ChatMessage, ChatTurn, User } from '@/lib/types';
import {
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Minus,
  X,
  Lock,
  Mail,
  Shield,
  LogOut,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface FloatingChatWidgetProps {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  defaultPrompt?: string;
  onPromptConsumed?: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  sender: 'assistant',
  content: 'আসসালামু আলাইকুম! আমি বাংলাদেশ জন্ম ও মৃত্যু নিবন্ধন এআই সহকারী। জন্ম ও মৃত্যু নিবন্ধন আইন, সরকারি ফি, বিধিমালা বা যেকোনো আবেদন প্রক্রিয়া সম্পর্কে জানতে প্রশ্ন করুন।',
  created_at: new Date().toISOString(),
};

const SUGGESTED_PROMPTS = [
  'জন্ম নিবন্ধন কি সবার জন্য বাধ্যতামূলক?',
  'ম্যানুয়াল জন্ম নিবন্ধন অনলাইনে অন্তর্ভুক্ত করার নিয়ম কী?',
  'জমজ সন্তানের জন্ম নিবন্ধন কীভাবে করতে হবে?',
  '১৭ ডিজিটের কম জন্ম নিবন্ধন নম্বরকে কীভাবে ১৭ ডিজিটে উন্নীত করা যায়?',
  'বিবাহিত নারীর জন্ম নিবন্ধন সনদে কি স্বামীর নাম লেখা যায়?',
  'একটি মোবাইল নম্বর দিয়ে সর্বোচ্চ কতজন পরিবারের সদস্যের নিবন্ধন করা যায়?',
  '‘Possible Duplicate’ কেন দেখা যায় এবং কীভাবে সমাধান করা হবে?',
  'জন্ম ও মৃত্যু সনদে মোবাইল নম্বর সংশোধন বা সংযোজন করা যায় কি?',
  'একই জন্ম নিবন্ধন নম্বর একাধিক ব্যক্তির ক্ষেত্রে দেখা গেলে কীভাবে সমাধান করা যায়?',
];

export default function FloatingChatWidget({
  isOpen: propIsOpen,
  onOpen: propOnOpen,
  onClose: propOnClose,
  defaultPrompt,
  onPromptConsumed,
}: FloatingChatWidgetProps) {
  // Global auth context (syncs with top navbar login)
  const { user: globalUser, login: globalLogin, register: globalRegister, logout: globalLogout } = useAuth();

  // Drawer open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;

  // Local fallback user if any
  const [chatUser, setChatUser] = useState<User | null>(null);
  const activeUser = globalUser || chatUser;
  const isLoggedIn = !!activeUser;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const propOnOpenRef = useRef(propOnOpen);
  propOnOpenRef.current = propOnOpen;

  const onPromptConsumedRef = useRef(onPromptConsumed);
  onPromptConsumedRef.current = onPromptConsumed;

  // Auto-refresh chat when access token expires
  const handleTokenExpired = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setChatUser(null);
    setLoginPassword('');
    setInputMessage('');
    setIsSending(false);
    setPendingPrompt(null);
    setMessages([
      {
        sender: 'assistant',
        content: 'আসসালামু আলাইকুম! আপনার সেশনের মেয়াদ শেষ হওয়ায় চ্যাট সেশনটি স্বয়ংক্রিয়ভাবে রিফ্রেশ করা হয়েছে। জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত তথ্য জানতে অনুগ্রহ করে পুনরায় লগইন করুন।',
        created_at: new Date().toISOString(),
      },
    ]);
    setAuthError('আপনার অ্যাক্সেস টোকেনের মেয়াদ শেষ হয়েছে। চ্যাটটি স্বয়ংক্রিয়ভাবে রিফ্রেশ করা হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।');
  }, []);

  // Listen for global auth:token-expired events
  useEffect(() => {
    window.addEventListener('auth:token-expired', handleTokenExpired);
    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, [handleTokenExpired]);

  // Sync propIsOpen if provided externally
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setInternalIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  // Handle external prompt trigger from hero, cards, or FAQs
  useEffect(() => {
    if (defaultPrompt && defaultPrompt.trim()) {
      const promptToSend = defaultPrompt.trim();
      setInternalIsOpen(true);
      if (propOnOpenRef.current) propOnOpenRef.current();

      if (isLoggedIn) {
        handleSendMessage(promptToSend);
      } else {
        setPendingPrompt(promptToSend);
      }

      if (onPromptConsumedRef.current) {
        onPromptConsumedRef.current();
      }
    }
  }, [defaultPrompt, isLoggedIn]);

  // If user just logged in and had a pending prompt, send it automatically
  useEffect(() => {
    if (isLoggedIn && pendingPrompt) {
      const p = pendingPrompt;
      setPendingPrompt(null);
      setTimeout(() => {
        handleSendMessage(p);
      }, 250);
    }
  }, [isLoggedIn, pendingPrompt]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isLoggedIn) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSending, isLoggedIn]);

  // Handle Chat Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginUsername.trim();
    const password = loginPassword;

    if (!username || !password) {
      setAuthError('ব্যবহারকারীর নাম বা ইমেইল এবং পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (globalLogin) {
        const loggedUser = await globalLogin(username, password);
        setChatUser(loggedUser);
      } else {
        const res = await authApi.login({ username, password });
        const userObj: User = {
          username: username,
          name: username,
          role: res.role || (username.toLowerCase() === 'admin' ? 'admin' : 'citizen'),
        };
        setChatUser(userObj);
      }

      // If there was a pending prompt triggered before login, send it now
      if (pendingPrompt) {
        const p = pendingPrompt;
        setPendingPrompt(null);
        setTimeout(() => handleSendMessage(p), 200);
      }
    } catch (err: any) {
      setAuthError(err.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Chat Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPassword;

    if (!name || !email || !password) {
      setAuthError('সকল তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      if (globalRegister) {
        const registeredUser = await globalRegister(name, email, password);
        setChatUser(registeredUser);
      } else {
        const res = await authApi.register({ name, email, password });
        const userObj: User = {
          name: name,
          email: email,
          username: email,
          role: res.role || 'citizen',
        };
        setChatUser(userObj);
      }

      if (pendingPrompt) {
        const p = pendingPrompt;
        setPendingPrompt(null);
        setTimeout(() => handleSendMessage(p), 200);
      }
    } catch (err: any) {
      setAuthError(err.message || 'নিবন্ধন সম্পন্ন করা যায়নি। অন্য ইমেইল দিয়ে চেষ্টা করুন।');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Demo auto-fill helper
  const handleFillDemo = (user: string, pass: string) => {
    setLoginUsername(user);
    setLoginPassword(pass);
    setAuthError(null);
  };

  // Logout / End Chat Session
  const handleEndSession = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setChatUser(null);
    setLoginPassword('');
    setMessages([INITIAL_GREETING]);
    if (globalLogout) {
      try {
        await globalLogout();
      } catch {
        // ignore logout errors
      }
    }
  };

  // Renew conversation to fresh state
  const handleRenewChat = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
    setMessages([
      {
        sender: 'assistant',
        content: 'আসসালামু আলাইকুম! নতুন চ্যাট অধিবেশন শুরু হয়েছে। জন্ম ও মৃত্যু নিবন্ধন সংক্রান্ত যেকোনো বিষয়ে জিজ্ঞাসা করুন।',
        created_at: new Date().toISOString(),
      },
    ]);
    setInputMessage('');
  };

  const handleSendMessage = async (customContent?: string) => {
    const textToSend = (customContent || inputMessage).trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsSending(true);

    // Format chat history for backend (POST /api/chat)
    const historyTurns: ChatTurn[] = messages
      .filter((m) => m.sender === 'user' || m.sender === 'assistant')
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    try {
      const res = await chatApi.sendMessage(textToSend, historyTurns);
      const answerContent = res.answer || 'দুঃখিত, এই সংক্রান্ত কোনো তথ্য পাওয়া যায়নি।';

      const botMsg: ChatMessage = {
        sender: 'assistant',
        content: answerContent,
        sources: res.sources || [],
        used_context: res.used_context,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg = err?.message || 'সার্ভার সংযোগে সমস্যা';
      const lowerMsg = errMsg.toLowerCase();
      const isAuthErr =
        lowerMsg.includes('401') ||
        lowerMsg.includes('unauthorized') ||
        lowerMsg.includes('token') ||
        lowerMsg.includes('credential') ||
        lowerMsg.includes('expire');

      if (isAuthErr) {
        clearAuthToken();
        notifyTokenExpired(errMsg);
        handleTokenExpired();
        return;
      }

      const errorMsg: ChatMessage = {
        sender: 'assistant',
        content: ` উত্তরের অনুরোধ প্রক্রিয়া করার সময় ত্রুটি হয়েছে: ${errMsg}. অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const speakText = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('দুঃখিত, আপনার ব্রাউজারে ভয়েস প্লেয়ার সমর্থিত নয়।');
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from markdown formatting
    const cleanText = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[#*`_\[\]()~>]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('bn') ||
        v.name.toLowerCase().includes('bangla') ||
        v.name.toLowerCase().includes('bengali')
    );

    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = 'bn-BD';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  const toggleOpen = () => {
    if (isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingIndex(null);
      setInternalIsOpen(false);
      if (propOnClose) propOnClose();
    } else {
      setInternalIsOpen(true);
      if (propOnOpen) propOnOpen();
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Icon Button */}
      <div className="fixed bottom-8 sm:bottom-10 right-8 sm:right-12 z-50 flex flex-col items-end">
        {!isOpen && (
          <div
            onClick={toggleOpen}
            className="mb-2.5 bg-white text-emerald-950 px-3.5 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-1.5 text-xs font-semibold animate-bounce cursor-pointer hover:bg-emerald-50 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>নাগরিক সহায়তা এআই চ্যাট</span>
          </div>
        )}

        <button
          onClick={toggleOpen}
          id="chatbot-launcher-btn"
          aria-label="Toggle AI Chat Assistant"
          className="relative group w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
        >
          {isOpen ? (
            <X className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          ) : (
            <div className="relative">
              <Bot className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border-2 border-emerald-700 rounded-full"></span>
            </div>
          )}
        </button>
      </div>

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl bg-white border border-slate-200 flex flex-col overflow-hidden bottom-26 sm:bottom-30 right-4 sm:right-12 w-[92vw] sm:w-[420px] md:w-[460px] h-[590px] max-h-[85vh]">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white px-4 py-3 flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white p-0.5 shadow-sm flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="বাংলাদেশ সরকার" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                  নাগরিক এআই সহকারী
                  <span className={`inline-block w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-300 animate-pulse' : 'bg-amber-300'}`}></span>
                </h2>
                <p className="text-[10px] text-emerald-100/90 font-medium">
                  {isLoggedIn && activeUser ? `লগইনকৃত: ${activeUser.name || activeUser.username}` : 'জন্ম ও মৃত্যু নিবন্ধন অনলাইন সেবা'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-white/80">
              {isLoggedIn && (
                <>
                  <button
                    onClick={handleRenewChat}
                    title="নতুন চ্যাট শুরু করুন (রিফ্রেশ)"
                    className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEndSession}
                    title="সেশন সমাপ্ত করুন / লগআউট"
                    className="p-1.5 hover:bg-white/20 hover:text-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={toggleOpen}
                title="মিনিমাইজ করুন"
                className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                onClick={toggleOpen}
                title="বন্ধ করুন"
                className="p-1.5 hover:bg-white/20 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Window Body */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
              {/* ============================================================== */}
              {/* 1. NOT LOGGED IN: SHOW LOGIN INTERFACE INSIDE POPUP            */}
              {/* ============================================================== */}
              {!isLoggedIn ? (
                <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center bg-gradient-to-b from-emerald-50/40 via-white to-slate-50">
                  <div className="max-w-sm mx-auto w-full space-y-4">
                    {/* Top Security Banner */}
                    <div className="text-center space-y-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        নাগরিক এআই চ্যাট লগইন
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        এআই সহকারীর সাথে চ্যাট করতে অ্যাডমিন কর্তৃক প্রদত্ত লগইন ক্রেডেনশিয়াল দিন।
                      </p>
                    </div>

                    {/* Pending Prompt Alert */}
                    {pendingPrompt && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-bold">আপনার প্রশ্নটি সংরক্ষিত হয়েছে:</p>
                          <p className="italic text-amber-900 line-clamp-1">"{pendingPrompt}"</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">লগইন করার সাথে সাথে স্বয়ংক্রিয়ভাবে উত্তর দেওয়া হবে।</p>
                        </div>
                      </div>
                    )}

                    {/* Error Box */}
                    {authError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* LOGIN FORM */}
                    <form onSubmit={handleLogin} className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ব্যবহারকারীর নাম বা ইমেইল
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            placeholder="যেমন: admin বা demo"
                            required
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          />
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          পাসওয়ার্ড
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          />
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>লগইন হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>লগইন করুন ও চ্যাট শুরু করুন</span>
                          </>
                        )}
                      </button>

                      {/* Demo Accounts Quick-Fill */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                          <span>ডেমো ক্রেডেনশিয়াল:</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">ক্লিক করে পূরণ করুন</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleFillDemo('admin', 'admin123')}
                            className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2 rounded-xl border border-slate-200 transition-all"
                          >
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <span> অ্যাডমিন</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">admin / admin123</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFillDemo('demo', 'demo123')}
                            className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2 rounded-xl border border-slate-200 transition-all"
                          >
                            <p className="font-bold text-slate-800 flex items-center gap-1">
                              <span> নাগরিক ইউজার</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">demo / demo123</p>
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center pt-1">
                          * নতুন ইউজার তৈরি কেবল সিস্টেম অ্যাডমিন করতে পারেন
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                /* ============================================================== */
                /* 2. LOGGED IN: SHOW FULL CHATBOT INTERACTION AND INPUT          */
                /* ============================================================== */
                <>
                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => {
                      const isUser = msg.sender === 'user';
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                              isUser
                                ? 'bg-emerald-700 text-white'
                                : 'bg-white border border-emerald-200 text-emerald-800'
                            }`}
                          >
                            {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>

                          {/* Message Bubble Container */}
                          <div className={`max-w-[82%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-xs transition-all ${
                                isUser
                                  ? 'bg-white text-gray-900 border border-emerald-300 rounded-tr-none font-medium'
                                  : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-none font-normal'
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.content}</p>
                            </div>

                            {/* Action Bar (TTS Voice Read + Copy) for Assistant Replies */}
                            {!isUser && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400 pl-1">
                                <button
                                  onClick={() => speakText(msg.content, index)}
                                  title={speakingIndex === index ? 'ভয়েস বন্ধ করুন' : 'উত্তরটি শুনুন'}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                                    speakingIndex === index
                                      ? 'text-emerald-700 bg-emerald-100/70 font-bold animate-pulse'
                                      : 'hover:text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                >
                                  {speakingIndex === index ? (
                                    <>
                                      <VolumeX className="w-3.5 h-3.5" />
                                      <span className="text-[10px]">থামুন</span>
                                    </>
                                  ) : (
                                    <>
                                      
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => copyToClipboard(msg.content, index)}
                                  title="উত্তর কপি করুন"
                                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-[10px] text-emerald-600">কপি হয়েছে</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span className="text-[10px]">কপি</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Typing Indicator */}
                    {isSending && (
                      <div className="flex items-start gap-2.5 animate-in fade-in">
                        <div className="w-7 h-7 rounded-full bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Prompt Suggestions */}
                  {messages.length <= 2 && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-white/80">
                      <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                        প্রস্তাবিত জিজ্ঞাসা:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[11px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 transition-colors text-left truncate max-w-full"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Chat Input Form */}
                  <div className="p-3 bg-white border-t border-gray-200">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="flex items-end gap-2 bg-slate-50 rounded-2xl p-1.5 border border-gray-200 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all"
                    >
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder=""
                        className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none px-2 py-1.5 max-h-24 min-h-[36px]"
                      />

                      <button
                        type="submit"
                        disabled={!inputMessage.trim() || isSending}
                        className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white p-2 rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center"
                        aria-label="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 px-1">
                      <span> BDRIS নিয়মাবলী</span>
                      <span>Enter ↵ পাঠিয়ে দিন</span>
                    </div>
                  </div>
                </>
              )}
            </div>
        </div>
      )}
    </>
  );
}
