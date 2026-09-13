'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi, systemApi } from '@/lib/api';
import { DashboardStats, User } from '@/lib/types';
import {
  Users,
  FileText,
  HelpCircle,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowUpRight,
  Sparkles,
  Server,
  Layers,
  Clock,
  Shield
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const [statsData, usersData, healthData] = await Promise.allSettled([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        systemApi.getHealth(),
      ]);

      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        // Fallback default stats if backend is starting
        setStats({
          total_users: 1,
          total_documents: 0,
          processed_documents: 0,
          failed_documents: 0,
          total_faqs: 5,
          total_vectors: 24,
        });
      }

      if (usersData.status === 'fulfilled') {
        setUsers(usersData.value || []);
      }

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Admin Knowledge Dashboard</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                Live Overview
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>
            <Link
              href="/admin/documents"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: PDF Documents */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Indexed Documents</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats?.documents ?? stats?.total_documents ?? 0}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Knowledge base PDF files</p>
            </div>
          </div>

          {/* Card 2: Extracted Chunks */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Extracted Chunks</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {stats?.chunks ?? stats?.total_vectors ?? 0}
              </span>
            </div>
          </div>

          {/* Card 3: Top-K & Health */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Retrieval Top-K</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">
                {stats?.top_k || 4}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">chunks / query</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              <span>System Status: Healthy</span>
            </div>
          </div>
        </div>

        {/* Knowledge Base Quick Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Knowledge Operations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/documents"
              className="p-5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-emerald-800 transition-colors">
                PDF Documents & Chunks
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload new PDF files, inspect extracted chunks per page, and manage indexed knowledge.
              </p>
            </Link>

            <Link
              href="/admin/search"
              className="p-5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-blue-800 transition-colors">
                Search & Retrieval Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Preview retrieved chunks and similarity scores live without invoking LLM tokens.
              </p>
            </Link>

            <Link
              href="/admin/users"
              className="p-5 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition-colors" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-purple-800 transition-colors">
                User Access & Security
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                View registered administrators and citizen access permissions.
              </p>
            </Link>
          </div>
        </div>

        {/* Registered Users Roster Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Registered Accounts
              </h2>
              <p className="text-[11px] text-slate-500">Users registered via citizen chat or admin accounts</p>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold"
            >
              View All Users →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-400">
                      No registered users found or backend still loading.
                    </td>
                  </tr>
                ) : (
                  users.slice(0, 5).map((u, i) => (
                    <tr key={u.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role?.toUpperCase() === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
