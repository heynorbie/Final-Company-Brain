import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Send, Sparkles, Plus, Search, Copy, RotateCw, ThumbsUp, ThumbsDown,
  PanelRight, MessageSquare, Trash2, Download, StopCircle, FileText,
  ChevronRight, Filter, BookOpen, Mic, MicOff, Loader2, CheckCircle2,
} from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState, StatusDot } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import {
  type ChatMessage, type SourceCitation, suggestedQuestions, agents,
} from '@/data/mockData';
import { askCompanyBrain } from '@/lib/companyBrainApi';
import { useChatHistory, type PersistedConversation, type PersistedMessage } from '@/hooks/useChatHistory';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn, uid, timeAgo } from '@/lib/utils';

function rowToMessage(row: PersistedMessage): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    sources: (row.sources as SourceCitation[] | null) || undefined,
    createdAt: row.created_at,
    status: row.status,
    feedback: row.feedback,
  };
}

export function ChatPage() {
  const { push } = useToast();
  const {
    conversations, loading, error,
    createConversation, deleteConversation, renameConversation,
    loadMessages, addMessage, updateMessage, touchConversation,
  } = useChatHistory();
  const voice = useVoiceSearch();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [agentId, setAgentId] = useState(agents[1].id);
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const streamTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancelled = false;
    setMessagesLoading(true);
    loadMessages(activeId).then((rows) => {
      if (cancelled) return;
      setMessages(rows.map(rowToMessage));
      setMessagesLoading(false);
    });
    return () => { cancelled = true; };
  }, [activeId, loadMessages]);

  const active: PersistedConversation | undefined = conversations.find((c) => c.id === activeId);

  const newConversation = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    const conv = await createConversation('New conversation', agentId);
    setCreating(false);
    if (conv) {
      setActiveId(conv.id);
      setMessages([]);
    } else {
      push({ kind: 'error', title: 'Could not create conversation' });
    }
  }, [creating, agentId, createConversation, push]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await deleteConversation(id);
    if (ok) {
      if (id === activeId) {
        const next = conversations.find((c) => c.id !== id);
        setActiveId(next ? next.id : null);
        setMessages(next ? messages : []);
      }
      push({ kind: 'success', title: 'Conversation deleted' });
    } else {
      push({ kind: 'error', title: 'Could not delete conversation' });
    }
    setConfirmDelete(null);
  }, [deleteConversation, activeId, conversations, messages, push]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || streaming || !activeId) return;

    const userMsgId = uid('m');
    const assistantMsgId = uid('m');
    const userMsg: ChatMessage = { id: userMsgId, role: 'user', content: q, createdAt: new Date().toISOString() };
    const assistantPlaceholder: ChatMessage = { id: assistantMsgId, role: 'assistant', content: '', createdAt: new Date().toISOString(), status: 'streaming' };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setInput('');
    setStreaming(true);

    // Persist user message immediately
    addMessage({ id: userMsgId, conversation_id: activeId, role: 'user', content: q, sources: null, status: 'complete', feedback: null });
    // Persist assistant placeholder (streaming)
    addMessage({ id: assistantMsgId, conversation_id: activeId, role: 'assistant', content: '', sources: null, status: 'streaming', feedback: null });

    // Auto-title the conversation from first user message
    if (messages.length === 0 || (messages.length <= 1 && active?.title === 'New conversation')) {
      renameConversation(activeId, q.slice(0, 50));
    }
    touchConversation(activeId);

    try {
      const result = await askCompanyBrain(q);
      setMessages((prev) => prev.map((m) => m.id === assistantMsgId
        ? { ...m, content: result.answer, sources: result.sources, status: 'complete' }
        : m));
      await updateMessage(assistantMsgId, {
        content: result.answer,
        sources: result.sources as unknown[],
        status: 'complete',
      });
      touchConversation(activeId);
    } catch (err) {
      const content = err instanceof Error ? err.message : 'Unexpected backend error.';
      setMessages((prev) => prev.map((m) => m.id === assistantMsgId
        ? { ...m, content: `Company Brain request failed: ${content}`, status: 'failed' }
        : m));
      await updateMessage(assistantMsgId, {
        content: `Company Brain request failed: ${content}`,
        status: 'failed',
      });
    } finally {
      setStreaming(false);
    }
  }, [streaming, activeId, active, messages.length, addMessage, renameConversation, touchConversation, updateMessage]);

  const stop = useCallback(() => {
    if (streamTimer.current) clearTimeout(streamTimer.current);
    setStreaming(false);
    const id = activeIdRef.current;
    if (!id) return;
    setMessages((prev) => prev.map((m) => m.status === 'streaming' ? { ...m, status: 'complete', content: m.content + '\n\n*Generation stopped by user.*' } : m));
    const streamingMsg = messages.find((m) => m.status === 'streaming');
    if (streamingMsg) updateMessage(streamingMsg.id, { content: streamingMsg.content + '\n\n*Generation stopped by user.*', status: 'complete' });
  }, [messages, updateMessage]);

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser || !activeId) return;
    // Remove last assistant message locally and in DB
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    setMessages((prev) => prev.filter((m) => m.id !== lastAssistant?.id));
    if (lastAssistant) {
      supabaseDeleteMessage(lastAssistant.id);
    }
    setTimeout(() => send(lastUser.content), 50);
  }, [messages, activeId, send]);

  async function supabaseDeleteMessage(id: string) {
    const { supabase } = await import('@/lib/supabase');
    await supabase.from('messages').delete().eq('id', id);
  }

  const setFeedback = useCallback((msgId: string, fb: 'up' | 'down') => {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, feedback: m.feedback === fb ? null : fb } : m));
    const cur = messages.find((m) => m.id === msgId);
    const nextFb = cur?.feedback === fb ? null : fb;
    updateMessage(msgId, { feedback: nextFb });
    push({ kind: 'success', title: 'Feedback recorded', description: fb === 'up' ? 'Marked as helpful' : 'Marked for improvement' });
  }, [messages, updateMessage, push]);

  function copyMessage(m: ChatMessage) {
    navigator.clipboard?.writeText(m.content);
    push({ kind: 'success', title: 'Copied to clipboard' });
  }

  function exportConversation() {
    if (!active) return;
    const text = messages.map((m) => `## ${m.role.toUpperCase()}\n\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${active.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click(); URL.revokeObjectURL(url);
    push({ kind: 'success', title: 'Conversation exported' });
  }

  // Voice input: when transcript finalizes, put it in the input box
  useEffect(() => {
    if (voice.transcript) {
      setInput(voice.transcript);
    }
  }, [voice.transcript]);

  const filteredConvs = conversations.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const activeAgent = agents.find((a) => a.id === (active?.agent_id || agentId));

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Conversation list */}
      <div className="hidden md:flex w-72 shrink-0 flex-col border-r border-border bg-surface/40">
        <div className="p-3 border-b border-border">
          <button onClick={newConversation} disabled={creating} className="btn-primary w-full">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            New Conversation
          </button>
          <div className="relative mt-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats..."
              className="input pl-8 py-1.5 text-xs"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full rounded-lg" />)}
            </div>
          ) : filteredConvs.length === 0 ? (
            <p className="p-4 text-center text-xs text-faint">{search ? 'No chats found' : 'No conversations yet'}</p>
          ) : (
            filteredConvs.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn('group flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left transition',
                  c.id === activeId ? 'bg-primary/10 text-text' : 'hover:bg-surface-2 text-muted')}
              >
                <MessageSquare className={cn('h-4 w-4 shrink-0', c.id === activeId ? 'text-primary' : 'text-faint')} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{c.title}</p>
                  <p className="text-[11px] text-faint">{timeAgo(c.updated_at)}</p>
                </div>
                <span
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(c.id); }}
                  className="hidden group-hover:flex rounded p-1 text-faint hover:text-error hover:bg-error/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </button>
            ))
          )}
        </div>
        {error && <p className="p-2 text-[10px] text-error border-t border-border">{error}</p>}
      </div>

      {/* Main chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-surface/60 px-4 py-2.5 backdrop-blur-sm">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text">{active?.title || 'Company Brain AI'}</p>
            <p className="text-[11px] text-muted">via {activeAgent?.name || 'Brain Agent'}</p>
          </div>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="hidden sm:block rounded-lg border border-border bg-surface px-2 py-1.5 text-xs outline-none focus:border-primary"
          >
            {agents.filter((a) => a.status !== 'archived').map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button onClick={() => setFiltersOpen(true)} className="btn-ghost p-2"><Filter className="h-4 w-4" /></button>
          <button onClick={exportConversation} disabled={!active} className="btn-ghost p-2 disabled:opacity-40"><Download className="h-4 w-4" /></button>
          <button onClick={() => setShowSources((v) => !v)} className={cn('btn-ghost p-2', showSources && 'text-primary')}><PanelRight className="h-4 w-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PageContainer>
            <div className="max-w-3xl mx-auto py-6 px-2">
              {!activeId ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 p-5">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-text">Ask the Company Brain</h2>
                  <p className="mt-1 text-sm text-muted max-w-md">
                    Get answers from your company's authorized knowledge. Start a new conversation to begin.
                  </p>
                  <button onClick={newConversation} disabled={creating} className="btn-primary mt-5">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Start a conversation
                  </button>
                  <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => { newConversation().then(() => setTimeout(() => send(q), 300)); }}
                        className="group flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-left text-sm text-muted transition hover:border-primary/40 hover:text-text"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-faint group-hover:text-primary" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 p-5">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-text">Ask the Company Brain</h2>
                  <p className="mt-1 text-sm text-muted max-w-md">
                    Get answers from your company's authorized knowledge — documents, policies, projects, and people.
                  </p>
                  <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="group flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-left text-sm text-muted transition hover:border-primary/40 hover:text-text"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-faint group-hover:text-primary" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((m) => (
                    <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                      <div className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-semibold',
                        m.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-br from-primary to-accent text-white')}>
                        {m.role === 'user' ? 'AC' : <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className={cn('min-w-0 max-w-[85%]', m.role === 'user' && 'flex flex-col items-end')}>
                        <div className={cn('rounded-2xl px-4 py-2.5 text-sm',
                          m.role === 'user' ? 'bg-primary text-white' : 'card')}>
                          {m.role === 'assistant' ? (
                            <div className="markdown">
                              {m.content || <span className="inline-block h-4 w-2 bg-primary animate-blink-caret align-middle" />}
                              {m.status === 'streaming' && m.content && <span className="inline-block h-4 w-2 bg-primary animate-blink-caret align-middle ml-0.5" />}
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          )}
                        </div>

                        {m.role === 'assistant' && m.status === 'complete' && (
                          <div className="mt-2 flex items-center gap-1">
                            <button onClick={() => copyMessage(m)} className="btn-ghost p-1.5 text-xs" title="Copy"><Copy className="h-3.5 w-3.5" /></button>
                            <button onClick={regenerate} className="btn-ghost p-1.5 text-xs" title="Regenerate"><RotateCw className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setFeedback(m.id, 'up')} className={cn('btn-ghost p-1.5 text-xs', m.feedback === 'up' && 'text-success')} title="Helpful"><ThumbsUp className="h-3.5 w-3.5" /></button>
                            <button onClick={() => setFeedback(m.id, 'down')} className={cn('btn-ghost p-1.5 text-xs', m.feedback === 'down' && 'text-error')} title="Not helpful"><ThumbsDown className="h-3.5 w-3.5" /></button>
                            {m.sources && m.sources.length > 0 && (
                              <Badge tone="accent" className="ml-1">{m.sources.length} sources</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Follow-up suggestions */}
                  {lastAssistant && lastAssistant.status === 'complete' && !streaming && (
                    <div className="ml-11 flex flex-wrap gap-2">
                      {['Tell me more about pgvector choice', 'Who owns the Atlas API?', 'Show recent ADRs'].map((f) => (
                        <button key={f} onClick={() => send(f)} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-primary/40 hover:text-text">
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </PageContainer>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-surface/60 p-3 backdrop-blur-sm">
          <PageContainer>
            <div className="max-w-3xl mx-auto">
              <div className="card flex items-end gap-2 p-2 focus-within:border-primary/40 focus-within:shadow-glow">
                {/* Voice button */}
                {voice.supported ? (
                  <button
                    onClick={() => voice.listening ? voice.stop() : voice.start()}
                    className={cn('btn-ghost p-2 shrink-0', voice.listening && 'text-error bg-error/10')}
                    title={voice.listening ? 'Stop voice input' : 'Voice input'}
                  >
                    {voice.listening ? <MicOff className="h-4 w-4 animate-pulse-soft" /> : <Mic className="h-4 w-4" />}
                  </button>
                ) : null}
                <div className="flex-1 relative">
                  <textarea
                    value={input || (voice.listening ? voice.interim : '')}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input || voice.transcript); voice.reset(); } }}
                    placeholder={voice.listening ? 'Listening...' : 'Ask anything about your company knowledge... (Shift+Enter for newline)'}
                    rows={1}
                    className="w-full resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-faint max-h-32"
                  />
                  {voice.listening && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 text-[10px] text-error">
                      <span className="h-2 w-2 rounded-full bg-error animate-pulse-soft" /> REC
                    </div>
                  )}
                </div>
                {streaming ? (
                  <button onClick={stop} className="btn-outline text-error"><StopCircle className="h-4 w-4" /> Stop</button>
                ) : (
                  <button onClick={() => { send(input || voice.transcript); voice.reset(); }} disabled={!(input.trim() || voice.transcript.trim())} className="btn-primary">
                    <Send className="h-4 w-4" /> Send
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[11px] text-faint flex items-center justify-center gap-1.5">
                {voice.supported ? (
                  <><Mic className="h-3 w-3" /> Tap the mic to speak · </>
                ) : null}
                Answers are generated by your connected Company Brain backend and grounded in retrieved graph evidence.
              </p>
            </div>
          </PageContainer>
        </div>
      </div>

      {/* Sources panel */}
      {showSources && (
        <div className="hidden xl:flex w-80 shrink-0 flex-col border-l border-border bg-surface/40">
          <div className="border-b border-border p-3">
            <p className="text-sm font-semibold text-text flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Retrieved Sources</p>
            <p className="text-[11px] text-muted mt-0.5">Inspect passages used to ground the answer</p>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
            {lastAssistant?.sources && lastAssistant.sources.length > 0 ? (
              lastAssistant.sources.map((s, i) => (
                <div key={s.id} className="card-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-accent/10 text-[10px] font-semibold text-accent">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-text truncate">{s.document}</p>
                        <p className="text-[11px] text-muted">{s.section}</p>
                      </div>
                    </div>
                    <Badge tone="success">{Math.round(s.relevance * 100)}%</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted leading-relaxed border-l-2 border-border pl-2.5">{s.excerpt}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge tone="neutral">{s.department}</Badge>
                    <button className="btn-ghost p-1 text-xs"><FileText className="h-3 w-3" /> Open</button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No sources yet" description="Ask a question to see retrieved passages here." />
            )}
          </div>
        </div>
      )}

      {/* Filters modal */}
      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Chat Filters"
        description="Scope retrieval to specific knowledge slices"
        footer={
          <>
            <button onClick={() => { setFilterDept('all'); setFilterType('all'); }} className="btn-ghost">Reset</button>
            <button onClick={() => setFiltersOpen(false)} className="btn-primary">Apply</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Department</label>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="input mt-1.5">
              <option value="all">All departments</option>
              {['Engineering', 'Product', 'Security', 'HR', 'IT', 'Sales', 'Design'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider">Document type</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input mt-1.5">
              <option value="all">All types</option>
              {['pdf', 'docx', 'md', 'txt', 'csv', 'url'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete conversation?"
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => confirmDelete && handleDelete(confirmDelete)} className="btn bg-error text-white hover:bg-error/90">Delete</button>
          </>
        }
      >
        <p className="text-sm text-muted">This conversation and all its messages will be permanently removed from your history. This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
