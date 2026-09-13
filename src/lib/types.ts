export interface User {
  id?: string | number;
  username?: string;
  name?: string;
  email?: string;
  role: 'admin' | 'user' | 'USER' | 'ADMIN' | string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  username?: string;
  role?: string;
  access_token?: string;
  token_type?: string;
  user?: User;
  message?: string;
}

export interface ChatSource {
  source: string;
  page?: number;
  score?: number;
  text?: string;
  title?: string;
  snippet?: string;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatTurn[];
}

export interface ChatResponse {
  answer: string;
  sources?: ChatSource[];
  used_context?: boolean;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  sources?: ChatSource[];
  used_context?: boolean;
}

export interface Conversation {
  session_id: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  messages_count?: number;
}

export interface ConversationDetail {
  session_id: string;
  title?: string;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface BackendStats {
  documents: number;
  chunks: number;
  chat_model: string;
  embed_model: string;
  top_k: number;
  openai_key_loaded?: boolean;
  status?: string;
}

export interface DashboardStats extends Partial<BackendStats> {
  total_users?: number;
  total_documents?: number;
  processed_documents?: number;
  failed_documents?: number;
  total_faqs?: number;
  total_vectors?: number;
  chromadb_vectors?: number;
}

export interface BackendDocument {
  doc_id: string;
  filename: string;
  stored_as?: string;
  pages: number;
  chunks: number;
  mode?: string;
  engine?: string;
  uploaded_at: string;
}

export interface DocumentChunk {
  chunk_id?: string | number;
  text: string;
  page?: number;
  source?: string;
  question?: string;
  score?: number;
}

export interface SearchHit {
  text: string;
  source: string;
  page: number;
  question?: string;
  score: number;
}

export interface SearchResponse {
  hits: SearchHit[];
}

export interface DocumentItem {
  id: string | number;
  doc_id?: string;
  title: string;
  description?: string;
  file_name?: string;
  filename?: string;
  file_size?: number;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  page_count?: number;
  pages?: number;
  chunk_count?: number;
  chunks?: number;
  mode?: string;
  engine?: string;
  error_message?: string;
  created_at: string;
  uploaded_at?: string;
  updated_at?: string;
}

export interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}
