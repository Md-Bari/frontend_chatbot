'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { chatApi } from '@/lib/api';
import { ChatMessage, Conversation } from '@/lib/types';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User as UserIcon,
  RefreshCw,
  Plus,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Minimize2,
  Maximize2,
  AlertCircle,
  Clock,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  UserPlus
} from 'lucide-react';

interface FloatingChatWidgetProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultPrompt?: string;
}

const SUGGESTED_PROMPTS = [
  'জন্ম নিবন্ধনের জন্য কি কি কাগজপত্র প্রয়োজন?',
  'জন্ম ও মৃত্যু নিবন্ধনের সরকারি ফি কত?',
  'অনলাইনে জন্ম সনদ কিভাবে সংশোধন করব?',
  '৪৫ দিনের মধ্যে নিবন্ধন না করলে কি করণীয়?',
  'How to verify birth registration certificate online?',
];

export default function FloatingChatWidget({ isOpen: propIsOpen, onClose: propOnClose, defaultPrompt }: FloatingChatWidgetProps) {
  const { user, login, register, isLoading: authLoading } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // In-widget authentication states
  const [authTab, setAuthTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Conversation state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync prop open state
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
      if (propIsOpen) setIsMinimized(false);
    }
  }, [propIsOpen]);

  // Load user conversations when user is logged in
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle default prompt if passed from outside
  useEffect(() => {
    if (defaultPrompt && isOpen && user && activeSessionId) {
      setInputMessage(defaultPrompt);
    }
  }, [defaultPrompt, isOpen, user, activeSessionId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadConversations = async () => {
    try {
      const list = await chatApi.getConversations();
      setConversations(list || []);
      if (list && list.length > 0) {
        if (!activeSessionId) {
          selectConversation(list[0].session_id);
        }
      } else {
        startNewConversation();
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const selectConversation = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowHistory(false);
    try {
      const detail = await chatApi.getConversationDetail(sessionId);
      if (detail && detail.messages) {
        setMessages(detail.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Failed to get conversation detail', err);
    }
  };

  const startNewConversation = async () => {
    try {
      const newConv = await chatApi.createConversation('নতুন আলোচনা');
      setActiveSessionId(newConv.session_id);
      setMessages([
        {
          sender: 'assistant',
          content: 'নমস্কার / আসসালামু আলাইকুম! আমি আপনার ডিজিটাল নাগরিক সহায়তা সহকারী। জন্ম ও মৃত্যু নিবন্ধন, বিধিমালা, আবেদন প্রক্রিয়া বা যেকোনো বিষয়ে আমাকে প্রশ্ন করতে পারেন।',
          created_at: new Date().toISOString(),
        },
      ]);
      setShowHistory(false);
      loadConversations();
    } catch (err: any) {
      console.error('Failed to create new conversation', err);
    }
  };

  const handleWidgetLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthSubmitting(true);

    try {
      await login(emailInput.trim(), passwordInput);
      setAuthSuccess('লগইন সফল হয়েছে!');
    } catch (err: any) {
      setAuthError(err?.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleWidgetSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (passwordInput !== confirmPasswordInput) {
      setAuthError('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    if (passwordInput.length < 6) {
      setAuthError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      await register(nameInput.trim(), emailInput.trim(), passwordInput, confirmPasswordInput);
      setAuthSuccess('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
    } catch (err: any) {
      setAuthError(err?.message || 'নিবন্ধন প্রক্রিয়া সম্পন্ন করা যায়নি।');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleWidgetForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthSubmitting(true);

    setTimeout(() => {
      setIsAuthSubmitting(false);
      setAuthSuccess(`পাসওয়ার্ড রিসেট নির্দেশিকা "${emailInput}" ঠিকানায় পাঠানো হয়েছে।`);
    }, 1000);
  };

  const handleSendMessage = async (customContent?: string) => {
    const textToSend = (customContent || inputMessage).trim();
    if (!textToSend || isSending) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const newConv = await chatApi.createConversation(textToSend.slice(0, 30));
        sessionId = newConv.session_id;
        setActiveSessionId(sessionId);
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const userMsg: ChatMessage = {
      sender: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await chatApi.sendMessage(sessionId, textToSend);
      const answerContent = res.answer || res.response || res.message || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।';
      
      const botMsg: ChatMessage = {
        sender: 'assistant',
        content: answerContent,
        sources: res.sources || [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        sender: 'assistant',
        content: `⚠️ উত্তরের অনুরোধ প্রক্রিয়া করার সময় ত্রুটি হয়েছে: ${err.message || 'সার্ভার সংযোগ বিচ্ছিন্ন'}. অনুগ্রহ করে কিছুক্ষণ পর পুনরায় চেষ্টা করুন।`,
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
      alert('দুঃখিত, আপনার ব্রাউজারে ভয়েস প্লেয়ার সমর্থিত নয়।');
      return;
    }

    // If already speaking this message, stop it
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text from markdown characters, citations, URLs
    const cleanText = text
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/[#*`_\[\]()~>]/g, ' ')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // emoji
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Find available voices in browser
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

    utterance.onstart = () => {
      setSpeakingIndex(index);
    };

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setSpeakingIndex(null);
    };

    // Chrome/Edge sometimes needs resume before speaking
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  const toggleWidget = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) setIsMinimized(false);
    if (!newState && propOnClose) {
      propOnClose();
    }
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
        {!isOpen && (
          <div className="mb-2 bg-white text-emerald-950 px-3 py-1.5 rounded-full shadow-lg border border-emerald-100 flex items-center gap-1.5 text-xs font-semibold animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>নাগরিক সহায়তা এআই চ্যাট</span>
          </div>
        )}

        <button
          onClick={toggleWidget}
          id="chatbot-launcher-btn"
          aria-label="Toggle AI Chat Assistant"
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-green-500 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-7 h-7 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-emerald-700 rounded-full"></span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl bg-white border border-gray-200 flex flex-col overflow-hidden ${
            isMinimized
              ? 'bottom-20 right-5 w-80 h-14'
              : 'bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[420px] md:w-[460px] h-[580px] max-h-[85vh]'
          }`}
        >
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
                  <span className="inline-block w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                </h2>
                
              </div>
            </div>

            <div className="flex items-center space-x-1 text-white/80">
              {user && !isMinimized && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  title="আলাপন ইতিহাস"
                  className={`p-1.5 hover:bg-white/20 rounded-lg transition-colors ${showHistory ? 'bg-white/25 text-white' : ''}`}
                >
                  <Clock className="w-4 h-4" />
                </button>
              )}
              {user && !isMinimized && (
                <button
                  onClick={startNewConversation}
                  title="নতুন চ্যাট শুরু করুন"
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'বড় করুন' : 'ছোট করুন'}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleWidget}
                title="বন্ধ করুন"
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* If minimized, just show top title */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
              {/* History Drawer Overlay */}
              {showHistory && (
                <div className="absolute inset-0 bg-white z-20 flex flex-col p-4 animate-in slide-in-from-top-4 duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      আপনার পূর্ববর্তী কথোপকথন
                    </h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-2 space-y-1.5">
                    {conversations.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">কোনো ইতিহাস পাওয়া যায়নি</p>
                    ) : (
                      conversations.map((c) => (
                        <div
                          key={c.session_id}
                          onClick={() => selectConversation(c.session_id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            activeSessionId === c.session_id
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : 'bg-white border-gray-200 hover:border-emerald-200 text-gray-700'
                          }`}
                        >
                          <div className="truncate flex-1 pr-2">
                            <p className="truncate">{c.title || 'অনলাইন প্রশ্নোত্তর সেশন'}</p>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {c.created_at ? new Date(c.created_at).toLocaleDateString('bn-BD') : ''}
                            </span>
                          </div>
                          {activeSessionId === c.session_id && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={startNewConversation}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    নতুন কথোপকথন শুরু করুন
                  </button>
                </div>
              )}

              {/* View 1: Auth Required if user is not logged in */}
              {!user ? (
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center items-center text-center bg-white overflow-y-auto">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 shadow-xs border border-emerald-100">
                    <Bot className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5">
                    নাগরিক চ্যাটবটে যুক্ত হোন
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3 max-w-xs">
                    তাৎক্ষণিক সঠিক তথ্যের জন্য লগইন বা নিবন্ধন করুন
                  </p>

                  {/* Auth Tabs inside Chatbot */}
                  {authTab !== 'forgot' && (
                    <div className="flex bg-slate-100 p-1 rounded-xl mb-3.5 w-full max-w-xs text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('login');
                          setAuthError(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg transition-all ${
                          authTab === 'login' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        লগইন
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('signup');
                          setAuthError(null);
                        }}
                        className={`flex-1 py-1.5 rounded-lg transition-all ${
                          authTab === 'signup' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        নিবন্ধন
                      </button>
                    </div>
                  )}

                  {authError && (
                    <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-left flex items-start gap-1.5 w-full max-w-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* IN-WIDGET LOGIN */}
                  {authTab === 'login' && (
                    <form onSubmit={handleWidgetLogin} className="w-full max-w-xs space-y-2.5">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">ইমেইল ঠিকানা *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="example@gmail.com"
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white"
                          />
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-gray-700">পাসওয়ার্ড *</label>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthTab('forgot');
                              setAuthError(null);
                            }}
                            className="text-[10px] font-semibold text-emerald-700 hover:underline"
                          >
                            পাসওয়ার্ড ভুলে গেছেন?
                          </button>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="আপনার পাসওয়ার্ড"
                            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthSubmitting || authLoading}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        {isAuthSubmitting || authLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>লগইন ও চ্যাট শুরু করুন</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* IN-WIDGET SIGNUP */}
                  {authTab === 'signup' && (
                    <form onSubmit={handleWidgetSignup} className="w-full max-w-xs space-y-2">
                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">পূর্ণ নাম *</label>
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="আপনার নাম"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">ইমেইল ঠিকানা *</label>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">পাসওয়ার্ড *</label>
                        <input
                          type="password"
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="কমপক্ষে ৬ অক্ষর"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">পাসওয়ার্ড নিশ্চিত করুন *</label>
                        <input
                          type="password"
                          required
                          value={confirmPasswordInput}
                          onChange={(e) => setConfirmPasswordInput(e.target.value)}
                          placeholder="পুনরায় পাসওয়ার্ড"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthSubmitting || authLoading}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-1"
                      >
                        {isAuthSubmitting || authLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>নিবন্ধন ও চ্যাট শুরু করুন</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* IN-WIDGET FORGOT PASSWORD */}
                  {authTab === 'forgot' && (
                    <form onSubmit={handleWidgetForgotPassword} className="w-full max-w-xs space-y-3">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">আপনার নিবন্ধিত ইমেইল *</label>
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="example@gmail.com"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthSubmitting}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        পাসওয়ার্ড রিসেট নির্দেশিকা পাঠান
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('login');
                          setAuthError(null);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1 mx-auto"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>লগইন স্ক্রিনে ফিরে যান</span>
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* View 2: Live Chat Messages (Shown immediately if already authenticated) */
                <>
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {messages.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        <Bot className="w-10 h-10 mx-auto text-emerald-300 mb-2 opacity-60" />
                        <p>যেকোনো প্রশ্ন লিখে শুরু করুন</p>
                      </div>
                    )}

                    {messages.map((msg: any, idx) => {
                      const sender = (msg.sender || msg.role || msg.type || '').toString().toLowerCase();
                      const isUser = sender === 'user' || sender === 'human';
                      const isBot = !isUser;

                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          {isBot && (
                            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-emerald-600">
                              <Bot className="w-4.5 h-4.5 text-amber-300" />
                            </div>
                          )}

                          <div
                            className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed transition-all ${
                              isBot
                                ? 'bg-emerald-800 text-white rounded-tl-xs shadow-md'
                                : 'bg-white border border-emerald-300 text-gray-900 rounded-tr-xs shadow-xs'
                            }`}
                          >
                            {/* Message Header Label */}
                            <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/10 text-[10px]">
                              <span className={`font-semibold ${isBot ? 'text-amber-300' : 'text-emerald-700'}`}>
                                {isBot ? 'নাগরিক এআই সহকারী' : 'আপনি (Citizen)'}
                              </span>
                              <span className={`text-[9px] ${isBot ? 'text-emerald-200/80' : 'text-gray-400'}`}>
                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            {/* Message Body */}
                            <div className={`whitespace-pre-wrap break-words leading-relaxed ${isBot ? 'text-white' : 'text-gray-800 font-medium'}`}>
                              {msg.content}
                            </div>

                            {/* Citations / Sources */}
                            {isBot && msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-emerald-700/80 text-[10px] text-emerald-100">
                                <span className="font-semibold text-amber-300 block mb-1">📚 তথ্যের উৎস (Sources):</span>
                                <ul className="space-y-1">
                                  {msg.sources.map((src: any, sIdx: number) => (
                                    <li key={sIdx} className="bg-emerald-900/80 p-1.5 rounded text-emerald-100 border border-emerald-700">
                                      <span className="font-semibold text-amber-200">{src.title || 'নথি / FAQ'}</span>
                                      {src.page && <span className="ml-1 text-emerald-300">(পৃষ্ঠা {src.page})</span>}
                                      {src.snippet && <p className="text-[9px] text-emerald-200/90 line-clamp-2 mt-0.5">{src.snippet}</p>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Bar for Bot Message */}
                            {isBot && (
                              <div className="mt-2 pt-1 flex items-center justify-between text-[10px] text-emerald-200/80 border-t border-emerald-700/60">
                                <span className="text-[9px]">সহায়ক উত্তর</span>
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    onClick={() => copyToClipboard(msg.content, idx)}
                                    title="কপি করুন"
                                    className="p-1 hover:text-white rounded transition-colors"
                                  >
                                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => speakText(msg.content, idx)}
                                    title={speakingIndex === idx ? 'ভয়েস বন্ধ করুন (Stop)' : 'ভয়েস শুনুন (Listen)'}
                                    className={`p-1 rounded transition-colors flex items-center gap-1 ${
                                      speakingIndex === idx
                                        ? 'text-amber-300 bg-emerald-900/80 animate-pulse'
                                        : 'hover:text-white'
                                    }`}
                                  >
                                    {speakingIndex === idx ? (
                                      <>
                                        <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                                        <span className="text-[9px] text-amber-300 font-bold">থামান</span>
                                      </>
                                    ) : (
                                      <Volume2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {!isBot && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 border border-amber-400">
                              <UserIcon className="w-4.5 h-4.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Bot Typing Indicator */}
                    {isSending && (
                      <div className="flex items-start gap-2.5 justify-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 animate-pulse border border-emerald-600">
                          <Bot className="w-4.5 h-4.5 text-amber-300" />
                        </div>
                        <div className="bg-emerald-800 text-white border border-emerald-700 rounded-2xl px-4 py-3 shadow-md">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 bg-amber-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            <span className="text-[10px] text-emerald-100 font-medium ml-2">এআই উত্তর খুঁজছে...</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Suggestion Chips (Shown when messages count is low) */}
                  {messages.length <= 2 && (
                    <div className="px-4 py-2 border-t border-gray-100 bg-white/70">
                      <p className="text-[10px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        সাধারণ জিজ্ঞাসা (Quick Suggestion):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-1 rounded-full text-left transition-colors truncate max-w-full"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Input Field */}
                  <div className="p-3 bg-white border-t border-gray-200">
                    <div className="flex items-end gap-2 bg-slate-50 border border-gray-300 rounded-2xl p-1.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="আপনার প্রশ্ন বাংলায় বা ইংরেজিতে লিখুন..."
                        className="flex-1 bg-transparent border-0 focus:outline-none text-xs px-2 py-1.5 text-gray-800 resize-none max-h-24"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isSending}
                        className="w-8 h-8 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 px-1">
                      <span>Enter চেপে পাঠান • Shift+Enter নতুন লাইন</span>
                      <span>লগইন করা: <strong className="text-gray-600">{user.name || user.email}</strong></span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
