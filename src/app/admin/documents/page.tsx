'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import {
  FileText,
  UploadCloud,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Layers,
  Search
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Action states
  const [retryingId, setRetryingId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setUploadError('Please select a valid PDF file.');
        return;
      }
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setUploadError('Please provide a document title and select a PDF file.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    if (description.trim()) {
      formData.append('description', description.trim());
    }

    try {
      await adminApi.uploadDocument(formData);
      setUploadSuccess('Document successfully uploaded! Text extraction, chunking, and ChromaDB vector indexing initiated.');
      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(null);
        loadDocuments();
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document. Please check the backend connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async (id: string | number) => {
    setRetryingId(id);
    try {
      await adminApi.retryDocument(id);
      await loadDocuments();
    } catch (err: any) {
      alert(`Retry failed: ${err.message || 'Unknown error'}`);
    } finally {
      setRetryingId(null);
    }
  };

  const handleDelete = async (id: string | number, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}"? This will permanently remove its chunks from ChromaDB and BM25 index.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteDocument(id);
      await loadDocuments();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-700" />
              <span>PDF Document Knowledge Base</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Upload PDF documents for automatic text extraction, chunking, and ChromaDB vector embedding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDocuments}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => {
                setShowUploadModal(true);
                setUploadError(null);
                setUploadSuccess(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New PDF</span>
            </button>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-2xl shadow-xs">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search indexed documents by title or description..."
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

        {/* Document Table / Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Pages & Chunks</th>
                  <th className="px-5 py-3.5">Uploaded Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      Loading document knowledge base...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-sm text-slate-800">No PDF documents indexed yet</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click "Upload New PDF" to add legal acts, manuals, or guideline documents.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isProcessed = doc.status === 'processed';
                    const isFailed = doc.status === 'failed';
                    const isProcessing = doc.status === 'processing' || doc.status === 'uploaded';

                    return (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-snug">{doc.title}</p>
                              {doc.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.description}</p>
                              )}
                              {doc.file_name && (
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                  {doc.file_name} {doc.file_size ? `(${Math.round(doc.file_size / 1024)} KB)` : ''}
                                </span>
                              )}
                              {isFailed && doc.error_message && (
                                <p className="text-[10px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {doc.error_message}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isProcessed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isFailed
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            }`}
                          >
                            {isProcessed && <CheckCircle2 className="w-3 h-3" />}
                            {isFailed && <AlertTriangle className="w-3 h-3" />}
                            {isProcessing && <Clock className="w-3 h-3" />}
                            <span className="capitalize">{doc.status}</span>
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-[11px] space-y-0.5">
                            <div className="text-slate-600">
                              Pages: <strong className="text-slate-900">{doc.page_count ?? 'N/A'}</strong>
                            </div>
                            <div className="text-slate-500 flex items-center gap-1">
                              <Layers className="w-3 h-3 text-emerald-600" />
                              Chunks: <strong className="text-emerald-800 font-mono font-bold">{doc.chunk_count ?? 'N/A'}</strong>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[11px] text-slate-500">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isFailed && (
                              <button
                                onClick={() => handleRetry(doc.id)}
                                disabled={retryingId === doc.id}
                                title="Retry Extraction & Indexing"
                                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${retryingId === doc.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(doc.id, doc.title)}
                              disabled={deletingId === doc.id}
                              title="Delete from DB & ChromaDB"
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PDF Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Upload PDF to Knowledge Base</h3>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., জন্ম ও মৃত্যু নিবন্ধন বিধিমালা ২০২৩"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Summary or legal coverage of this document..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select PDF File *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/70 hover:bg-emerald-50/30 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                    {file ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">{file.name}</p>
                        <p className="text-[10px] text-emerald-700 mt-0.5 font-mono font-semibold">
                          {Math.round(file.size / 1024)} KB • Click to change
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Click to browse or drag PDF here</p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports Bangla & English PDF documents</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !file}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Extracting & Indexing...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Start Indexing</span>
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
