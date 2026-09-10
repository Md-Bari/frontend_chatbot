'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'forgot';
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess
}: AuthModalProps) {
  const { login } = useAuth();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or mode changes
  React.useEffect(() => {
    setMode(defaultMode);
    setError(null);
    setSuccess(null);
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleFillDemo = (usernameVal: string, passwordVal: string) => {
    setEmail(usernameVal);
    setPassword(passwordVal);
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      setSuccess('সফলভাবে লগইন হয়েছে!');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate password reset email
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(`পাসওয়ার্ড রিসেট নির্দেশিকা "${email}" ঠিকানায় প্রেরণ করা হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।`);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Branding & Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-white p-0.5 shadow-md mx-auto mb-2.5 flex items-center justify-center border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="বাংলাদেশ সরকার" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
            {mode === 'login' ? 'নাগরিক ও অ্যাডমিন লগইন' : 'পাসওয়ার্ড রিসেট'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'আপনার ব্যবহারকারীর নাম/ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করুন'
              : 'আপনার নিবন্ধিত ইমেইল ঠিকানা প্রদান করুন'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ইউজারনেম বা ইমেইল *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4 text-emerald-700" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: admin বা user"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">পাসওয়ার্ড *</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                >
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>

            {/* Demo Credentials Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>ডেমো অ্যাকাউন্ট নির্বাচন করুন:</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">১-ক্লিকে পূরণ</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin', 'admin123')}
                  className="text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2.5 rounded-xl border border-slate-200 transition-all"
                >
                  <p className="font-bold text-xs text-slate-800 flex items-center gap-1">
                    <span>👑 অ্যাডমিন</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">admin / admin123</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('user', 'user123')}
                  className="text-left bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 p-2.5 rounded-xl border border-slate-200 transition-all"
                >
                  <p className="font-bold text-xs text-slate-800 flex items-center gap-1">
                    <span>👤 নাগরিক ইউজার</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">user / user123</p>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                ℹ️ নতুন ইউজার একাউন্ট কেবলমাত্র সিস্টেম অ্যাডমিন তৈরি করতে পারেন।
              </p>
            </div>
          </form>
        )}

        {/* 2. FORGOT / RESET PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার অ্যাকাউন্টের ইমেইল ঠিকানা *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>রিসেট লিঙ্ক পাঠান (Send Reset Link)</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-center gap-1.5 pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>লগইন পেজে ফিরে যান</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
