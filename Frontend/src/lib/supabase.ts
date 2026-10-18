import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  console.info('Supabase env vars missing — chat history will use browser local storage.');
}

// createClient validates its URL immediately, so use a harmless placeholder
// when Supabase is not configured. The history hook will not call it in that mode.
export const supabase = createClient(
  url || 'http://127.0.0.1:54321',
  anonKey || 'local-development-placeholder-key',
  { auth: { persistSession: false } },
);

export interface ConversationRow {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources: unknown[] | null;
  status: 'streaming' | 'complete' | 'failed';
  feedback: 'up' | 'down' | null;
  created_at: string;
}
