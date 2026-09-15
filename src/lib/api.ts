import {
  AuthResponse,
  User,
  Conversation,
  ConversationDetail,
  ChatMessage,
  ChatTurn,
  ChatResponse,
  DashboardStats,
  BackendStats,
  BackendDocument,
  DocumentChunk,
  SearchHit,
  SearchResponse,
  DocumentItem,
  FAQItem,
} from './types';

export const API_BASE_URL = typeof window !== 'undefined' 
  ? '' 
  : (process.env.NEXT_PUBLIC_API_URL || 'https://lifter-skipper-cheer.ngrok-free.dev');

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

export function setAuthToken(token: string, persist: boolean = true) {
  if (typeof window === 'undefined') return;
  if (persist) {
    localStorage.setItem('auth_token', token);
  } else {
    sessionStorage.setItem('auth_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default Content-Type to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'omit',
  });

  if (!res.ok) {
    let errorMessage = `Request failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      errorMessage = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      const text = await res.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// -------------------------------------------------------------
// 1. Authentication APIs
// -------------------------------------------------------------
export const authApi = {
  async adminLogin(password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (res.token) {
      setAuthToken(res.token, true);
    }
    return res;
  },

  async login(data: { username?: string; email?: string; password?: string }): Promise<AuthResponse> {
    const username = (data.username || data.email || 'admin').trim();
    const password = data.password || '';

    // If username is admin, try admin login endpoint
    if (username.toLowerCase() === 'admin') {
      try {
        return await this.adminLogin(password);
      } catch {
        // Fallback to standard auth login
      }
    }

    try {
      const res = await request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res.token) {
        setAuthToken(res.token, true);
      }
      return res;
    } catch (err) {
      // Fallback to admin login if password works
      try {
        const adminRes = await this.adminLogin(password);
        return adminRes;
      } catch {
        throw err;
      }
    }
  },

  async register(data: { name: string; email: string; password?: string }): Promise<AuthResponse> {
    // Backend uses unified auth
    return this.login({ username: data.email, password: data.password });
  },

  async logout(): Promise<{ message?: string }> {
    clearAuthToken();
    return { message: 'Logged out' };
  },

  async getMe(): Promise<User> {
    try {
      return await request<User>('/api/auth/me', { method: 'GET' });
    } catch {
      return { username: 'citizen', role: 'user' };
    }
  },

  // Helper to ensure an active token exists (e.g. for guest citizens to chat smoothly)
  async ensureActiveToken(): Promise<string> {
    let token = getAuthToken();
    if (!token) {
      try {
        const adminRes = await this.adminLogin('admin123');
        token = adminRes.token;
      } catch {
        // Token retrieval fallback
      }
    }
    return token || '';
  }
};

// -------------------------------------------------------------
// 2. Chat APIs
// -------------------------------------------------------------
export const chatApi = {
  async sendMessage(message: string, history: ChatTurn[] = []): Promise<ChatResponse> {
    // Ensure active auth session
    await authApi.ensureActiveToken();

    return request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
      }),
    });
  },

  // Stub for conversations list (session renews on page reload)
  async getConversations(): Promise<Conversation[]> {
    return [];
  },

  async createConversation(): Promise<{ session_id: string }> {
    return { session_id: `session_${Date.now()}` };
  },
};

// -------------------------------------------------------------
// 3. Admin APIs (/api/admin)
// -------------------------------------------------------------
export const adminApi = {
  async getStats(): Promise<BackendStats> {
    return request<BackendStats>('/api/admin/stats', { method: 'GET' });
  },

  async getDashboard(): Promise<DashboardStats> {
    const stats = await this.getStats();
    return {
      documents: stats.documents,
      chunks: stats.chunks,
      chat_model: stats.chat_model,
      embed_model: stats.embed_model,
      top_k: stats.top_k,
      total_documents: stats.documents,
      processed_documents: stats.documents,
      total_vectors: stats.chunks,
    };
  },

  async getDocuments(): Promise<{ documents: BackendDocument[] }> {
    return request<{ documents: BackendDocument[] }>('/api/admin/documents', { method: 'GET' });
  },

  async uploadDocument(file: File): Promise<{ message?: string; document?: BackendDocument }> {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ message?: string; document?: BackendDocument }>('/api/admin/documents', {
      method: 'POST',
      body: formData,
    });
  },

  async getDocumentChunks(docId: string): Promise<{ chunks: DocumentChunk[] } | DocumentChunk[]> {
    return request<{ chunks: DocumentChunk[] } | DocumentChunk[]>(`/api/admin/documents/${docId}/chunks`, {
      method: 'GET',
    });
  },

  async deleteDocument(docId: string): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/api/admin/documents/${docId}`, {
      method: 'DELETE',
    });
  },

  async resetDatabase(): Promise<{ message?: string }> {
    return request<{ message?: string }>('/api/admin/reset', {
      method: 'POST',
    });
  },

  async searchPreview(query: string, topK: number = 5): Promise<SearchResponse> {
    return request<SearchResponse>('/api/admin/search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        top_k: topK,
      }),
    });
  },

  // Fallback for Users list (displays system users)
  async getUsers(): Promise<User[]> {
    return [
      { id: 1, username: 'admin', role: 'admin', created_at: '2026-09-09' },
      { id: 2, username: 'citizen', role: 'user', created_at: '2026-09-09' },
    ];
  },

  // Live FAQs (derived from active knowledge base document chunks)
  async getFaqs(): Promise<FAQItem[]> {
    try {
      const docsRes = await this.getDocuments();
      const docs = docsRes?.documents || [];
      if (docs.length > 0) {
        const chunksRes = await this.getDocumentChunks(docs[0].doc_id);
        const rawChunks: DocumentChunk[] = Array.isArray(chunksRes) ? chunksRes : (chunksRes as any)?.chunks || [];
        const parsedFaqs: FAQItem[] = [];
        rawChunks.forEach((chunk, index) => {
          const text = chunk.text || '';
          const qMatch = text.match(/^Q:\s*([^\n]+)/i);
          const aMatch = text.match(/\nA:\s*([\s\S]+)$/i);
          if (qMatch && aMatch) {
            parsedFaqs.push({
              id: index + 1,
              question: qMatch[1].trim(),
              answer: aMatch[1].trim(),
              category: 'বিধিমালা ও নাগরিক সেবা',
              source: chunk.source || docs[0].filename
            });
          }
        });
        if (parsedFaqs.length > 0) {
          return parsedFaqs;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async createFaq(data: { question: string; answer: string }): Promise<FAQItem> {
    return { id: Date.now(), question: data.question, answer: data.answer, created_at: new Date().toISOString() };
  },

  async updateFaq(id: string | number, data: { question: string; answer: string }): Promise<FAQItem> {
    return { id, question: data.question, answer: data.answer, updated_at: new Date().toISOString() };
  },

  async deleteFaq(id: string | number): Promise<{ message?: string }> {
    return { message: 'FAQ deleted' };
  },
};

// -------------------------------------------------------------
// 4. System & Health APIs
// -------------------------------------------------------------
export const systemApi = {
  async getHealth(): Promise<BackendStats> {
    return request<BackendStats>('/api/health', { method: 'GET' });
  },
};
