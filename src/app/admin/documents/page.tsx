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
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Chunks Modal State
  const [showChunksModal, setShowChunksModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  // Action states
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getDocuments();
      setDocuments(data?.documents || []);
    } catch (err) {
      console.error('Failed to load documents', err);
      setDocuments([]);
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
      setUploadError(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      await adminApi.uploadDocument(file);
      setUploadSuccess('Document successfully uploaded! Text extracted, chunked, and indexed into ChromaDB & BM25.');
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

  const handleViewChunks = async (doc: any) => {
    setSelectedDoc(doc);
    setShowChunksModal(true);
    setLoadingChunks(true);
    setChunks([]);

    try {
      const res = await adminApi.getDocumentChunks(doc.doc_id);
      const rawChunks = Array.isArray(res) ? res : (res as any)?.chunks || [];
      setChunks(rawChunks);
    } catch (err: any) {
      alert(`Failed to fetch chunks: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDelete = async (docId: string, docFilename: string) => {
    if (!confirm(`Are you sure you want to delete "${docFilename}"? This will permanently remove its embeddings from ChromaDB.`)) {
      return;
    }
    setDeletingId(docId);
    try {
      await adminApi.deleteDocument(docId);
      await loadDocuments();
    } catch (err: any) {
      alert(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('⚠️ CAUTION: Are you sure you want to reset the vector database? All indexed document vectors will be wiped.')) {
      return;
    }
    setIsResetting(true);
    try {
      await adminApi.resetDatabase();
      alert('Vector database reset successfully.');
      await loadDocuments();
    } catch (err: any) {
      alert(`Reset failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredDocs = documents.filter((d) =>
    (d.filename && d.filename.toLowerCase().includes(searchFilter.toLowerCase())) ||
    (d.doc_id && d.doc_id.toLowerCase().includes(searchFilter.toLowerCase()))
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
              Upload PDF documents for automatic PyMuPDF extraction, chunking, and ChromaDB/BM25 indexing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isResetting ? 'Resetting...' : 'Reset DB'}</span>
            </button>

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
            placeholder="Search indexed documents by filename or ID..."
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

        {/* Document Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-5 py-3.5">Engine / Mode</th>
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
                  filteredDocs.map((doc) => (
                    <tr key={doc.doc_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs leading-snug">{doc.filename}</p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              ID: {doc.doc_id} {doc.stored_as ? `• ${doc.stored_as}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase font-mono">
                          {doc.engine || 'pymupdf'} • {doc.mode || 'numbered'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-[11px] space-y-0.5">
                          <div className="text-slate-600">
                            Pages: <strong className="text-slate-900">{doc.pages ?? 'N/A'}</strong>
                          </div>
                          <div className="text-slate-500 flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-600" />
                            Chunks: <strong className="text-emerald-800 font-mono font-bold">{doc.chunks ?? 'N/A'}</strong>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[11px] text-slate-500">
                        {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : 'N/A'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewChunks(doc)}
                            title="View Extracted Chunks"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Chunks</span>
                          </button>

                          <button
                            onClick={() => handleDelete(doc.doc_id, doc.filename)}
                            disabled={deletingId === doc.doc_id}
                            title="Delete from DB & ChromaDB"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
                        <p className="text-[10px] text-slate-400 mt-1">Supports legal acts, gazettes, Q&A manuals</p>
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
                        <span>Upload & Index</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Chunks Inspection Modal */}
        {showChunksModal && selectedDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Extracted Chunks: {selectedDoc.filename}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Doc ID: {selectedDoc.doc_id} • Total Chunks: {selectedDoc.chunks} • Engine: {selectedDoc.engine}
                  </p>
                </div>
                <button
                  onClick={() => setShowChunksModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {loadingChunks ? (
                  <div className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading document chunks from vector store...
                  </div>
                ) : chunks.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No chunk details returned for this document.
                  </div>
                ) : (
                  chunks.map((chk: any, idx: number) => {
                    const chunkText = typeof chk === 'string' ? chk : chk.text || JSON.stringify(chk);
                    const chunkPage = chk?.page;
                    const chunkQ = chk?.question;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-200/60 pb-1.5">
                          <span className="text-emerald-800">Chunk #{idx + 1}</span>
                          {chunkPage !== undefined && (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-mono text-[10px]">
                              Page {chunkPage}
                            </span>
                          )}
                        </div>

                        {chunkQ && (
                          <div className="font-bold text-slate-800 text-xs bg-white p-2 rounded-lg border border-slate-200">
                            Q: {chunkQ}
                          </div>
                        )}

                        <div className="text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                          {chunkText}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowChunksModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
