'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import { FAQItem } from '@/lib/types';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Database
} from 'lucide-react';

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getFaqs();
      setFaqs(data || []);
    } catch (err) {
      console.error('Failed to load FAQs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    setQuestion('');
    setAnswer('');
    setModalError(null);
    setModalSuccess(null);
    setShowModal(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setIsEditing(true);
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setModalError(null);
    setModalSuccess(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      setModalError('Both Question and Answer fields are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      if (isEditing && editId !== null) {
        await adminApi.updateFaq(editId, { question: question.trim(), answer: answer.trim() });
        setModalSuccess('FAQ updated and ChromaDB vector chunk re-indexed!');
      } else {
        await adminApi.createFaq({ question: question.trim(), answer: answer.trim() });
        setModalSuccess('FAQ created and embedded into ChromaDB & BM25 index!');
      }

      setTimeout(() => {
        setShowModal(false);
        setModalSuccess(null);
        loadFaqs();
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this FAQ? It will be removed from ChromaDB and BM25 index.')) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteFaq(id);
      await loadFaqs();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-amber-600" />
              <span>FAQ Knowledge Base Management</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Add and curate high-priority Q&A items. Updates automatically sync with ChromaDB vector search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadFaqs}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New FAQ</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search FAQs by question keywords or answer content..."
            className="flex-1 bg-transparent border-0 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 shadow-xs">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading FAQs from knowledge base...
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-800">No FAQs found</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Add New FAQ" to create frequently asked citizen guidance.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      Q
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => openEditModal(faq)}
                      title="Edit FAQ"
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      disabled={deletingId === faq.id}
                      title="Delete FAQ"
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pl-9 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 whitespace-pre-wrap">
                  {faq.answer}
                </div>

                <div className="pl-9 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-700 font-mono font-semibold">
                    <Database className="w-3 h-3" /> ChromaDB Synced
                  </span>
                  <span>•</span>
                  <span>ID: #{faq.id}</span>
                  {faq.updated_at && (
                    <>
                      <span>•</span>
                      <span>Updated: {new Date(faq.updated_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isEditing ? 'Edit Knowledge Base FAQ' : 'Add New FAQ'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question (Bangla / English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., জন্ম সনদে পিতা-মাতার নাম সংশোধনের নিয়ম কি?"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Answer *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide the complete, official step-by-step guidance or legal answer..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing to Vector Store...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>{isEditing ? 'Update & Re-index' : 'Save & Index FAQ'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
