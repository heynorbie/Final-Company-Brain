import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CornerDownLeft, ArrowUp, ArrowDown, MessageSquare, FileText,
  Users, Bot, BarChart3, Settings, Mic, MicOff,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CmdItem { id: string; label: string; hint: string; to: string; icon: LucideIcon; group: string }

const items: CmdItem[] = [
  { id: 'dash', label: 'Executive Dashboard', hint: 'Overview', to: '/', icon: BarChart3, group: 'Navigation' },
  { id: 'chat', label: 'Open AI Chat', hint: 'Workspace', to: '/chat', icon: MessageSquare, group: 'Navigation' },
  { id: 'agents', label: 'Agent Studio', hint: 'Workspace', to: '/agents', icon: Bot, group: 'Navigation' },
  { id: 'docs', label: 'Document Library', hint: 'Knowledge', to: '/documents', icon: FileText, group: 'Navigation' },
  { id: 'emp', label: 'Employee Directory', hint: 'Knowledge', to: '/employees', icon: Users, group: 'Navigation' },
  { id: 'search', label: 'Semantic Search', hint: 'Intelligence', to: '/search', icon: Search, group: 'Navigation' },
  { id: 'settings', label: 'Settings', hint: 'Admin', to: '/settings', icon: Settings, group: 'Navigation' },
  { id: 'ask-stack', label: 'Ask: What is our technology stack?', hint: 'AI', to: '/chat', icon: MessageSquare, group: 'Suggested' },
  { id: 'ask-onboard', label: 'Ask: Summarize our onboarding process', hint: 'AI', to: '/chat', icon: MessageSquare, group: 'Suggested' },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
  onVoiceToggle?: () => void;
  voiceListening?: boolean;
  voiceSupported?: boolean;
}

export function CommandPalette({ open, onClose, initialQuery, onVoiceToggle, voiceListening, voiceSupported }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery || '');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, initialQuery]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (open && initialQuery) setQuery(initialQuery);
  }, [initialQuery, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
      if (e.key === 'Enter') {
        const item = filtered[active];
        if (item) { navigate(item.to); onClose(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, filtered, active, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh] animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-xl overflow-hidden animate-fade-up shadow-glow">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={voiceListening ? 'Listening... speak now' : 'Search pages, documents, people, or ask the Brain...'}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
          />
          {voiceSupported && onVoiceToggle && (
            <button
              onClick={onVoiceToggle}
              className={cn('btn-ghost p-1.5 rounded-md', voiceListening && 'text-error bg-error/10')}
              title={voiceListening ? 'Stop voice search' : 'Voice search'}
            >
              {voiceListening ? <MicOff className="h-4 w-4 animate-pulse-soft" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <span className="kbd">ESC</span>
        </div>
        {voiceListening && (
          <div className="flex items-center gap-2 border-b border-border bg-error/5 px-4 py-2 text-xs text-error">
            <span className="h-2 w-2 rounded-full bg-error animate-pulse-soft" />
            Voice search active — results update as you speak
          </div>
        )}
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && <p className="p-4 text-sm text-muted">No matches.</p>}
          {filtered.map((item, i) => {
            const Icon = item.icon;
            const isActive = i === active;
            return (
              <button
                key={item.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => { navigate(item.to); onClose(); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition',
                  isActive ? 'bg-primary/10 text-text' : 'text-muted hover:bg-surface-2',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-faint')} />
                <span className="flex-1 text-sm">{item.label}</span>
                <span className="text-[11px] text-faint">{item.hint}</span>
                {isActive && <CornerDownLeft className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-faint">
          <span className="flex items-center gap-1"><ArrowUp className="h-3 w-3" /><ArrowDown className="h-3 w-3" /> navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> select</span>
          {voiceSupported && <span className="flex items-center gap-1 ml-auto"><Mic className="h-3 w-3" /> voice</span>}
        </div>
      </div>
    </div>
  );
}
