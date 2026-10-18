import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured, type ConversationRow, type MessageRow } from '@/lib/supabase';
import { uid } from '@/lib/utils';

export interface PersistedConversation extends ConversationRow {}
export interface PersistedMessage extends MessageRow {}

interface UseChatHistoryResult {
  conversations: PersistedConversation[];
  loading: boolean;
  error: string | null;
  createConversation: (title: string, agentId: string) => Promise<PersistedConversation | null>;
  deleteConversation: (id: string) => Promise<boolean>;
  renameConversation: (id: string, title: string) => Promise<boolean>;
  loadMessages: (conversationId: string) => Promise<PersistedMessage[]>;
  addMessage: (m: Omit<PersistedMessage, 'id' | 'created_at'> & { id?: string }) => Promise<PersistedMessage | null>;
  updateMessage: (id: string, patch: Partial<PersistedMessage>) => Promise<boolean>;
  touchConversation: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

interface LocalHistory {
  conversations: PersistedConversation[];
  messages: PersistedMessage[];
}

const STORAGE_KEY = 'company-brain-chat-history-v1';

function readLocalHistory(): LocalHistory {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<LocalHistory>;
      return {
        conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      };
    }
  } catch (error) {
    console.warn('Could not read local chat history:', error);
  }
  return { conversations: [], messages: [] };
}

function writeLocalHistory(value: LocalHistory) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('Could not save local chat history:', error);
  }
}

export function useChatHistory(): UseChatHistoryResult {
  const [conversations, setConversations] = useState<PersistedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      if (mounted.current) {
        setConversations(local.conversations.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
        setLoading(false);
      }
      return;
    }
    const { data, error: err } = await supabase
      .from('conversations').select('*').order('updated_at', { ascending: false }).limit(100);
    if (err) { setError(err.message); setLoading(false); return; }
    if (mounted.current) {
      setConversations((data || []) as PersistedConversation[]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => { mounted.current = false; };
  }, [refresh]);

  const createConversation = useCallback(async (title: string, agentId: string): Promise<PersistedConversation | null> => {
    if (!isSupabaseConfigured) {
      const now = new Date().toISOString();
      const row: PersistedConversation = { id: uid('c'), title, agent_id: agentId, created_at: now, updated_at: now };
      const local = readLocalHistory();
      local.conversations = [row, ...local.conversations.filter((item) => item.id !== row.id)];
      writeLocalHistory(local);
      setConversations(local.conversations);
      return row;
    }
    const { data, error: err } = await supabase.from('conversations')
      .insert({ id: uid('c'), title, agent_id: agentId }).select('*').maybeSingle();
    if (err) { setError(err.message); return null; }
    const row = data as PersistedConversation | null;
    if (row) setConversations((prev) => [row, ...prev.filter((c) => c.id !== row.id)]);
    return row;
  }, []);

  const deleteConversation = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      local.conversations = local.conversations.filter((c) => c.id !== id);
      local.messages = local.messages.filter((m) => m.conversation_id !== id);
      writeLocalHistory(local);
      setConversations(local.conversations);
      return true;
    }
    const { error: err } = await supabase.from('conversations').delete().eq('id', id);
    if (err) { setError(err.message); return false; }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    return true;
  }, []);

  const renameConversation = useCallback(async (id: string, title: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      const now = new Date().toISOString();
      local.conversations = local.conversations.map((c) => c.id === id ? { ...c, title, updated_at: now } : c);
      writeLocalHistory(local);
      setConversations(local.conversations);
      return true;
    }
    const { error: err } = await supabase.from('conversations').update({ title }).eq('id', id);
    if (err) { setError(err.message); return false; }
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
    return true;
  }, []);

  const loadMessages = useCallback(async (conversationId: string): Promise<PersistedMessage[]> => {
    if (!isSupabaseConfigured) {
      return readLocalHistory().messages
        .filter((m) => m.conversation_id === conversationId)
        .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    }
    const { data, error: err } = await supabase.from('messages').select('*')
      .eq('conversation_id', conversationId).order('created_at', { ascending: true });
    if (err) { setError(err.message); return []; }
    return (data || []) as PersistedMessage[];
  }, []);

  const addMessage = useCallback(async (m: Omit<PersistedMessage, 'id' | 'created_at'> & { id?: string }): Promise<PersistedMessage | null> => {
    const payload = {
      ...m,
      id: m.id || uid('m'),
      created_at: new Date().toISOString(),
      sources: m.sources ?? null,
      feedback: m.feedback ?? null,
    } as PersistedMessage;
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      local.messages.push(payload);
      writeLocalHistory(local);
      return payload;
    }
    const { data, error: err } = await supabase.from('messages').insert(payload).select('*').maybeSingle();
    if (err) { setError(err.message); return null; }
    return data as PersistedMessage | null;
  }, []);

  const updateMessage = useCallback(async (id: string, patch: Partial<PersistedMessage>): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      local.messages = local.messages.map((m) => m.id === id ? { ...m, ...patch } : m);
      writeLocalHistory(local);
      return true;
    }
    const updatePatch: Record<string, unknown> = {};
    if (patch.content !== undefined) updatePatch.content = patch.content;
    if (patch.sources !== undefined) updatePatch.sources = patch.sources;
    if (patch.status !== undefined) updatePatch.status = patch.status;
    if (patch.feedback !== undefined) updatePatch.feedback = patch.feedback;
    const { error: err } = await supabase.from('messages').update(updatePatch).eq('id', id);
    if (err) { setError(err.message); return false; }
    return true;
  }, []);

  const touchConversation = useCallback(async (id: string): Promise<void> => {
    const now = new Date().toISOString();
    if (!isSupabaseConfigured) {
      const local = readLocalHistory();
      local.conversations = local.conversations.map((c) => c.id === id ? { ...c, updated_at: now } : c);
      writeLocalHistory(local);
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, updated_at: now } : c)
        .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
      return;
    }
    await supabase.from('conversations').update({ updated_at: now }).eq('id', id);
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, updated_at: now } : c)
      .sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
  }, []);

  return {
    conversations, loading, error,
    createConversation, deleteConversation, renameConversation,
    loadMessages, addMessage, updateMessage, touchConversation, refresh,
  };
}
