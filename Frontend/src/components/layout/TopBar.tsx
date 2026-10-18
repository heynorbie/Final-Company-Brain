import { useState } from 'react';
import {
  Search, Bell, HelpCircle, Sun, Moon, Command, Menu, ChevronDown, CircleUser, Mic, MicOff,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { CommandPalette } from './CommandPalette';
import { Badge } from '@/components/ui';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

export function TopBar({ onMenuToggle, sidebarCollapsed }: { onMenuToggle: () => void; sidebarCollapsed: boolean }) {
  const { theme, toggle } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const voice = useVoiceSearch();

  const notifications = [
    { title: 'Ingestion failed', body: 'Vendor Security Questionnaire — retry available', tone: 'error' as const, at: '5m' },
    { title: 'New agent created', body: 'Project Knowledge Assistant is in draft', tone: 'info' as const, at: '2h' },
    { title: 'Knowledge gap detected', body: 'Security — SOC2 Audit Status', tone: 'warning' as const, at: '6h' },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-xl">
        <button onClick={onMenuToggle} className="btn-ghost p-2 lg:hidden" aria-label="Menu">
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setPaletteOpen(true)}
            className="group flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted transition hover:border-border-strong w-64 lg:w-80"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left text-faint">
              {voice.listening ? (voice.interim || 'Listening...') : (voice.transcript || 'Search or ask...')}
            </span>
            {voice.supported ? (
              <span className="flex items-center gap-1.5">
                {voice.listening && (
                  <span className="flex h-3 items-end gap-0.5" aria-label="Listening">
                    <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-error" />
                    <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-error [animation-delay:150ms]" />
                    <span className="h-2 w-0.5 animate-pulse rounded-full bg-error [animation-delay:300ms]" />
                  </span>
                )}
                <Mic
                  onClick={(e) => { e.stopPropagation(); voice.listening ? voice.stop() : voice.start(); }}
                  className={cn('h-3.5 w-3.5 transition', voice.listening ? 'text-error' : 'text-faint hover:text-primary')}
                />
              </span>
            ) : (
              <span className="kbd"><Command className="h-3 w-3" />K</span>
            )}
          </button>
        </div>

        <button onClick={() => setPaletteOpen(true)} className="btn-ghost p-2 md:hidden" aria-label="Search">
          <Search className="h-4 w-4" />
        </button>
        {voice.supported && (
          <button
            onClick={() => voice.listening ? voice.stop() : voice.start()}
            className={cn('btn-ghost flex items-center gap-1.5 p-2 md:hidden', voice.listening && 'text-error')}
            aria-label="Voice search"
          >
            {voice.listening && (
              <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-error" />
                <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-error [animation-delay:150ms]" />
                <span className="h-2 w-0.5 animate-pulse rounded-full bg-error [animation-delay:300ms]" />
              </span>
            )}
            {voice.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <div className="relative">
            <button onClick={() => setHelpOpen((v) => !v)} className="btn-ghost p-2 rounded-lg" aria-label="Help">
              <HelpCircle className="h-4 w-4" />
            </button>
            {helpOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setHelpOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-64 card p-2 animate-fade-up">
                  <p className="px-2 py-1.5 text-xs font-semibold text-faint uppercase tracking-wider">Help</p>
                  {['Documentation', 'Keyboard shortcuts', 'Contact support', 'What\'s new'].map((x) => (
                    <button key={x} className="block w-full rounded-md px-2 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-text">
                      {x}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setNotifOpen((v) => !v)} className="btn-ghost relative p-2 rounded-lg" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-80 card animate-fade-up">
                  <div className="flex items-center justify-between border-b border-border p-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <Badge tone="primary">{notifications.length} new</Badge>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n, i) => (
                      <div key={i} className={cn('flex gap-3 border-b border-border p-3 last:border-0', n.tone === 'error' && 'bg-error/5')}>
                        <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          n.tone === 'error' ? 'bg-error' : n.tone === 'warning' ? 'bg-warning' : 'bg-info')} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text">{n.title}</p>
                          <p className="text-xs text-muted">{n.body}</p>
                          <p className="mt-1 text-[11px] text-faint">{n.at} ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button onClick={toggle} className="btn-ghost p-2 rounded-lg" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="relative ml-1">
            <button onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-lg p-1 pr-2 transition hover:bg-surface-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-semibold text-white">
                AC
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[12px] font-medium leading-none">Ava Chen</p>
                <p className="text-[10px] text-faint leading-none mt-0.5">Admin</p>
              </div>
              <ChevronDown className="hidden lg:block h-3.5 w-3.5 text-faint" />
            </button>
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-56 card p-2 animate-fade-up">
                  <div className="border-b border-border p-2 pb-3">
                    <p className="text-sm font-medium">Ava Chen</p>
                    <p className="text-xs text-muted">ava.chen@company.ai</p>
                  </div>
                  {['Profile', 'My conversations', 'Workspace settings', 'Billing'].map((x) => (
                    <button key={x} className="block w-full rounded-md px-2 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-text">
                      {x}
                    </button>
                  ))}
                  <div className="border-t border-border p-2">
                    <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-error hover:bg-error/10">
                      <CircleUser className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <CommandPalette
        open={paletteOpen}
        onClose={() => { setPaletteOpen(false); voice.reset(); }}
        initialQuery={voice.transcript}
        onVoiceToggle={() => voice.listening ? voice.stop() : voice.start()}
        voiceListening={voice.listening}
        voiceSupported={voice.supported}
      />
    </>
  );
}
