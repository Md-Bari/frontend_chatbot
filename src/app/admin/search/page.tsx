'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import { SearchHit } from '@/lib/types';
import {
  Search,
  SlidersHorizontal,
  FileText,
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AdminSearchPage() {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchHit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.searchPreview(query.trim(), topK);
      setResults(res.hits || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to execute search query.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              RAG Retrieval Inspector
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Preview raw vector and BM25 search chunks with similarity scores without invoking the LLM.
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5 text-emerald-600" />
                </div>
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter test query (e.g. জন্ম নিবন্ধনের সরকারি ফি কত?, পাসপোর্ট এর জন্য কি সনদ লাগবে?)..."
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 bg-white shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Top-K:</span>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-60 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Inspect Retrieval</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Test Queries */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-600">Sample Queries:</span>
              <button
                type="button"
                onClick={() => handleQuickQuery('জন্ম নিবন্ধনের সরকারি ফি কত টাকা?')}
                className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                সরকারি ফি
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuery('জমজ সন্তানের জন্ম নিবন্ধন কীভাবে করা হবে?')}
                className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                জমজ সন্তান নিবন্ধন
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuery('BDRIS-এ চালান সংক্রান্ত তথ্য আপলোড সমস্যা সমাধান কী?')}
                className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                চালান আপলোড সমস্যা
              </button>
              <button
                type="button"
                onClick={() => handleQuickQuery('পিতামাতার জন্ম সনদ না থাকলে সন্তানের নিবন্ধন কীভাবে হবে?')}
                className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                পিতামাতার সনদ ছাড়া নিবন্ধন
              </button>
            </div>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Section */}
        {results !== null && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Retrieved Context Hits</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2 py-0.5 rounded-full font-mono">
                  {results.length} chunks
                </span>
              </h2>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No matching chunks found.</p>
                <p className="text-xs text-slate-400 mt-1">Try a different query or upload more PDF documents to the knowledge base.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {results.map((hit, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition-colors space-y-3"
                  >
                    {/* Hit Meta Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-mono font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          {hit.source}
                        </span>
                        {hit.page !== undefined && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            Page {hit.page}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <span>Score:</span>
                        <span>{hit.score?.toFixed(4) || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Question (if parsed) */}
                    {hit.question && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                        <span className="text-emerald-700 mr-1.5">Q:</span>
                        {hit.question}
                      </div>
                    )}

                    {/* Raw Text Content */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line font-sans">
                      {hit.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
