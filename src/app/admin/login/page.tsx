'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as admin, redirect to /admin
  useEffect(() => {
    if (user && isAdmin) {
      router.push('/admin');
    }
  }, [user, isAdmin, router]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError('Access denied: You need an administrator account (Role: ADMIN) to view the Admin Portal.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Direct admin login with password
      const profile = await login(email || 'admin', password || 'admin123');
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator password. (Default is "admin123")');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative z-10">
      {/* Header Badge & Title */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md mx-auto mb-3 flex items-center justify-center border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Admin Knowledge Portal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sign in to manage knowledge documents, FAQs, and portal settings
        </p>
      </div>

      {/* Error Notification */}
      {error && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Administrator Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4 text-emerald-700" />
            </div>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
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
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
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
          disabled={isSubmitting || isLoading}
          className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Sign In to Admin Dashboard</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Helper */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={fillDemoAdmin}
          className="text-[11px] text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1 font-mono font-bold"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Fill Standard Admin Demo Credentials</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-900 font-sans selection:bg-emerald-200">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Back to Citizen Portal Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-800 transition-colors font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Citizen Portal</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-600 shadow-xl">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading Admin Portal...
        </div>
      }>
        <AdminLoginForm />
      </Suspense>

      <div className="mt-6 text-center text-slate-500 text-[11px] font-medium">
        Protected Knowledge Base Admin Interface • JWT Bearer Authenticated
      </div>
    </div>
  );
}
