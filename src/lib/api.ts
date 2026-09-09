import {
  AuthResponse,
  User,
  Conversation,
  ConversationDetail,
  ChatMessage,
  DashboardStats,
  DocumentItem,
  FAQItem,
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getAuthToken(): string | null {
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

  // For 204 or empty responses
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

// -------------------------------------------------------------
// 1. Authentication APIs (/api)
// -------------------------------------------------------------
export const authApi = {
  async register(data: { name: string; email: string; password?: string; password_confirmation?: string }): Promise<AuthResponse> {
    const password = data.password || 'User@123456';
    const password_confirmation = data.password_confirmation || password;
    return request<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password,
        password_confirmation,
      }),
    });
  },

  async login(data: { email: string; password?: string }): Promise<AuthResponse> {
    return request<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password || 'User@123456',
      }),
    });
  },

  async logout(): Promise<{ message?: string }> {
    try {
      const res = await request<{ message?: string }>('/api/logout', { method: 'POST' });
      clearAuthToken();
      return res;
    } catch (err) {
      clearAuthToken();
      return { message: 'Logged out' };
    }
  },

  async getMe(): Promise<User> {
    return request<User>('/api/me', { method: 'GET' });
  },
};

// -------------------------------------------------------------
// 2. Chat & Conversation APIs (/api)
// -------------------------------------------------------------
export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    return request<Conversation[]>('/api/conversations', { method: 'GET' });
  },

  async createConversation(title?: string): Promise<{ session_id: string; title?: string }> {
    return request<{ session_id: string; title?: string }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(title ? { title } : {}),
    });
  },

  async getConversationDetail(sessionId: string): Promise<ConversationDetail> {
    return request<ConversationDetail>(`/api/conversations/${sessionId}`, { method: 'GET' });
  },

  async deleteConversation(sessionId: string): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/api/conversations/${sessionId}`, { method: 'DELETE' });
  },

  async sendMessage(sessionId: string, content: string): Promise<{
    answer?: string;
    response?: string;
    message?: string;
    sources?: Array<{ title?: string; page?: number; snippet?: string }>;
  }> {
    return request<{
      answer?: string;
      response?: string;
      message?: string;
      sources?: Array<{ title?: string; page?: number; snippet?: string }>;
    }>(`/api/conversations/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// -------------------------------------------------------------
// 3. Admin APIs (/api/admin)
// -------------------------------------------------------------
export const adminApi = {
  async getDashboard(): Promise<DashboardStats> {
    return request<DashboardStats>('/api/admin/dashboard', { method: 'GET' });
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/admin/users', { method: 'GET' });
  },

  // Document Management
  async getDocuments(): Promise<DocumentItem[]> {
    return request<DocumentItem[]>('/api/admin/documents', { method: 'GET' });
  },

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    return request<DocumentItem>('/api/admin/documents', {
      method: 'POST',
      body: formData,
    });
  },

  async deleteDocument(id: string | number): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/api/admin/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async retryDocument(id: string | number): Promise<{ message?: string; document?: DocumentItem }> {
    return request<{ message?: string; document?: DocumentItem }>(`/api/admin/documents/${id}/retry`, {
      method: 'POST',
    });
  },

  // FAQ Management
  async getFaqs(): Promise<FAQItem[]> {
    return request<FAQItem[]>('/api/admin/faqs', { method: 'GET' });
  },

  async createFaq(data: { question: string; answer: string }): Promise<FAQItem> {
    return request<FAQItem>('/api/admin/faqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateFaq(id: string | number, data: { question: string; answer: string }): Promise<FAQItem> {
    return request<FAQItem>(`/api/admin/faqs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteFaq(id: string | number): Promise<{ message?: string }> {
    return request<{ message?: string }>(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// 4. System & Health APIs
// -------------------------------------------------------------
export const systemApi = {
  async getHealth(): Promise<{ status: string; database?: string; chromadb?: string; version?: string }> {
    return request<{ status: string; database?: string; chromadb?: string; version?: string }>('/health', { method: 'GET' });
  },
};
