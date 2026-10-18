import { useMemo, useState } from 'react';
import { Search, Clock, Bookmark, ArrowRight, FileText, Users, FolderKanban, Shield, Sparkles, TrendingUp } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { documents, employees, topTopics } from '@/data/mockData';
import { cn } from '@/lib/utils';

const recentSearches = ['API authentication flow', 'Onboarding buddy program', 'SOC2 audit status', 'Atlas API owners'];
const savedSearches = ['Security procedures', 'Engineering ADRs', 'Q4 OKRs'];

type ResultKind = 'document' | 'employee' | 'project' | 'policy';
interface Result { id: string; kind: ResultKind; title: string; snippet: string; meta: string; relevance: number; access: 'open' | 'restricted' }

const iconByKind: Record<ResultKind, LucideIcon> = {
  document: FileText, employee: Users, project: FolderKanban, policy: Shield,
};

const seedResults: Result[] = [
  ...documents.slice(0, 6).map<Result>((d) => ({
    id: d.id, kind: 'document', title: d.name,
    snippet: `This document covers ${d.category} practices for the ${d.department} organization, including key procedures and reference material.`,
    meta: `${d.department} · ${d.type.toUpperCase()} · ${d.owner}`, relevance: 0.7 + Math.random() * 0.28, access: 'open',
  })),
  ...employees.slice(0, 4).map<Result>((e) => ({
    id: e.id, kind: 'employee', title: e.name,
    snippet: `${e.title} in ${e.department}. Skills: ${e.skills.join(', ')}. Working on ${e.projects.join(', ')}.`,
    meta: `${e.department} · ${e.location}`, relevance: 0.6 + Math.random() * 0.3, access: 'open',
  })),
  { id: 'p1', kind: 'policy', title: 'Data Retention Policy', snippet: 'Default 90-day retention for operational logs; 1-year retention for audit events.', meta: 'Security · Policy', relevance: 0.91, access: 'restricted' },
  { id: 'p2', kind: 'policy', title: 'Incident Response Procedure', snippet: 'Sev1-3 classifications with on-call rotation and escalation paths.', meta: 'Security · Policy', relevance: 0.86, access: 'restricted' },
  { id: 'pj1', kind: 'project', title: 'Atlas API', snippet: 'Core platform API. Owners: Engineering. Status: GA. Stakeholders: Product, Security.', meta: 'Engineering · Active', relevance: 0.82, access: 'open' },
  { id: 'pj2', kind: 'project', title: 'Vector Store', snippet: 'pgvector-backed retrieval. Owners: Engineering Platform.', meta: 'Engineering · Active', relevance: 0.78, access: 'open' },
];

export function SearchPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic');
  const [filterKind, setFilterKind] = useState<'all' | ResultKind>('all');
  const [results, setResults] = useState<Result[]>([]);

  function run(q: string) {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    const filtered = seedResults.filter((r) => r.title.toLowerCase().includes(q.toLowerCase()) || r.snippet.toLowerCase().includes(q.toLowerCase()));
    setResults(filtered.length > 0 ? filtered : seedResults.slice(0, 6));
  }

  const filtered = useMemo(() => results.filter((r) => filterKind === 'all' || r.kind === filterKind), [results, filterKind]);

  return (
    <div>
      <PageHeader title="Semantic Search" description="Search company knowledge with keyword or semantic retrieval across all indexed sources." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="p-4">
              <div className="card flex items-center gap-2 p-2 focus-within:border-primary/40 focus-within:shadow-glow">
                <Search className="h-4 w-4 text-muted ml-2" />
                <input
                  value={query}
                  onChange={(e) => run(e.target.value)}
                  placeholder="Ask anything — try 'API authentication' or 'onboarding process'..."
                  className="flex-1 bg-transparent px-2 py-2 text-sm outline-none"
                  autoFocus
                />
                <div className="flex gap-1 rounded-lg border border-border p-0.5">
                  {(['semantic', 'keyword'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={cn('rounded-md px-2.5 py-1 text-xs font-medium capitalize', mode === m ? 'bg-primary text-white' : 'text-muted')}>{m}</button>
                  ))}
                </div>
                <button onClick={() => push({ kind: 'info', title: 'Search saved' })} className="btn-ghost p-2" title="Save"><Bookmark className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Filter:</span>
                {(['all', 'document', 'employee', 'project', 'policy'] as const).map((k) => (
                  <button key={k} onClick={() => setFilterKind(k)} className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', filterKind === k ? 'bg-primary text-white' : 'bg-surface-2 text-muted hover:text-text')}>{k}</button>
                ))}
              </div>

              {query && filtered.length === 0 ? (
                <Card><EmptyState icon={<Search className="h-6 w-6" />} title="No results" description="Try a different query or broaden your filters." /></Card>
              ) : !query ? (
                <Card>
                  <EmptyState icon={<Sparkles className="h-6 w-6" />} title="Start searching" description="Use the bar above to search across documents, people, projects, and policies." />
                </Card>
              ) : (
                filtered.map((r) => {
                  const Icon = iconByKind[r.kind];
                  return (
                    <Card key={r.id} className="group p-4 transition hover:border-primary/40 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                          r.kind === 'document' && 'bg-primary/10 text-primary',
                          r.kind === 'employee' && 'bg-accent/10 text-accent',
                          r.kind === 'project' && 'bg-info/10 text-info',
                          r.kind === 'policy' && 'bg-warning/10 text-warning',
                        )}><Icon className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-text">{r.title}</p>
                            <Badge tone={r.access === 'restricted' ? 'warning' : 'success'}>{r.access}</Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted line-clamp-2">{r.snippet}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] text-faint">{r.meta}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[11px]">
                                <TrendingUp className="h-3 w-3 text-success" />
                                <span className="text-success font-medium">{Math.round(r.relevance * 100)}%</span>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-faint group-hover:text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            <div className="space-y-3">
              <Card>
                <p className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted">Recent searches</p>
                <div className="p-2">
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => run(s)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-text">
                      <Clock className="h-3.5 w-3.5 text-faint" /> <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <p className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted">Saved searches</p>
                <div className="p-2">
                  {savedSearches.map((s) => (
                    <button key={s} onClick={() => run(s)} className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-text">
                      <Bookmark className="h-3.5 w-3.5 text-accent" /> <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              </Card>
              <Card>
                <p className="border-b border-border p-3 text-xs font-semibold uppercase tracking-wider text-muted">Popular topics</p>
                <div className="p-3 flex flex-wrap gap-1.5">
                  {topTopics.slice(0, 5).map((t) => (
                    <button key={t.topic} onClick={() => run(t.topic)} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted hover:text-text">{t.topic}</button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </PageContainer>
      </PageBody>
    </div>
  );
}
