export interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user?: User;
  message?: string;
}

export interface Conversation {
  session_id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  messages_count?: number;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  sources?: Array<{
    title?: string;
    page?: number;
    score?: number;
    snippet?: string;
  }>;
}

export interface ConversationDetail {
  session_id: string;
  title?: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_users: number;
  total_documents: number;
  processed_documents: number;
  failed_documents: number;
  total_faqs: number;
  total_vectors: number;
  chromadb_vectors?: number;
}

export interface DocumentItem {
  id: string | number;
  title: string;
  description?: string;
  file_name?: string;
  file_size?: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  page_count?: number;
  chunk_count?: number;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  created_at?: string;
  updated_at?: string;
}
