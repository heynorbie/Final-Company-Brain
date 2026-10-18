import { useState } from 'react';
import { FolderKanban, Search, FileCode, FileText, Shield, GitBranch, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface WikiEntry { id: string; title: string; type: 'adr' | 'doc' | 'runbook' | 'postmortem' | 'faq' | 'api'; owner: string; project: string; updatedAt: string; status: 'stable' | 'draft' | 'deprecated'; excerpt: string; code?: string }

const entries: WikiEntry[] = [
  { id: 'ADR-014', title: 'Use pgvector for vector search', type: 'adr', owner: 'Ava Chen', project: 'Vector Store', updatedAt: '2d ago', status: 'stable', excerpt: 'We selected pgvector over a dedicated vector DB to keep operational surface area small at our scale (~5M vectors).', code: `CREATE EXTENSION IF NOT EXISTS vector;\nCREATE TABLE chunks (\n  id uuid PRIMARY KEY,\n  doc_id uuid REFERENCES documents(id),\n  embedding vector(1536),\n  content text\n);\nCREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);` },
  { id: 'ADR-015', title: 'Adopt mTLS for service-to-service', type: 'adr', owner: 'Reza Haddad', project: 'Platform', updatedAt: '5d ago', status: 'stable', excerpt: 'All internal service calls require mTLS with certs issued by the internal CA; JWTs remain for user auth only.' },
  { id: 'DOC-220', title: 'Atlas API Reference v3', type: 'api', owner: 'Ava Chen', project: 'Atlas API', updatedAt: '3h ago', status: 'stable', excerpt: 'Core platform API. REST + JSON. Base URL: https://api.company.ai/v3', code: `curl https://api.company.ai/v3/search \\\n  -H "Authorization: Bearer $TOKEN" \\\n  -d '{"query":"onboarding","top_k":6}'` },
  { id: 'DOC-221', title: 'Deployment Runbook — API', type: 'runbook', owner: 'Dmitri Ivanov', project: 'Atlas API', updatedAt: '1d ago', status: 'stable', excerpt: 'Blue-green deploys via Argo CD. Rollback within 60s. Health checks at /healthz and /readyz.' },
  { id: 'PM-0914', title: 'Incident Postmortem 0914', type: 'postmortem', owner: 'Reza Haddad', project: 'Atlas API', updatedAt: '12d ago', status: 'stable', excerpt: 'Sev2: 22m partial outage on search. Root cause: stale embedding cache. Action: cache versioning + TTL cap.' },
  { id: 'DOC-310', title: 'Architecture Overview', type: 'doc', owner: 'Ava Chen', project: 'Platform', updatedAt: '6h ago', status: 'stable', excerpt: 'Modular services: gateway, identity, retrieval, ingestion, LLM proxy. Event bus for async indexing.' },
  { id: 'FAQ-001', title: 'FAQ: How do I get API credentials?', type: 'faq', owner: 'IT Team', project: 'Atlas API', updatedAt: '4d ago', status: 'stable', excerpt: 'Request via #api-access Slack channel. Admins approve; keys rotate every 90 days.' },
  { id: 'ADR-016', title: 'Move to React Server Components', type: 'adr', owner: 'Lina Park', project: 'Frontend Revamp', updatedAt: '8d ago', status: 'draft', excerpt: 'Proposal to adopt RSC for the dashboard to reduce client bundle and improve first paint.' },
];

const typeIcon = { adr: GitBranch, doc: FileText, runbook: FileCode, postmortem: AlertTriangle, faq: FileText, api: FileCode } as const;
const typeTone = { adr: 'primary', doc: 'neutral', runbook: 'accent', postmortem: 'error', faq: 'info', api: 'success' } as const;

export function ProjectsPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | WikiEntry['type']>('all');
  const [selected, setSelected] = useState<WikiEntry | null>(null);

  const filtered = entries.filter((e) => (type === 'all' || e.type === type) && (e.title.toLowerCase().includes(query.toLowerCase()) || e.project.toLowerCase().includes(query.toLowerCase())));

  return (
    <div>
      <PageHeader title="Projects & Technical Wiki" description="Engineering documentation, ADRs, runbooks, API references, and postmortems." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search docs, ADRs, runbooks..." className="input pl-9" />
              </div>
              <select value={type} onChange={(e) => setType(e.target.value as 'all' | WikiEntry['type'])} className="input sm:w-40">
                <option value="all">All types</option>
                {['adr', 'doc', 'runbook', 'postmortem', 'faq', 'api'].map((t) => <option key={t} value={t} className="capitalize">{t.toUpperCase()}</option>)}
              </select>
            </div>
          </Card>

          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((e) => {
              const Icon = typeIcon[e.type];
              return (
                <Card key={e.id} className="group p-4 cursor-pointer transition hover:border-primary/40" onClick={() => setSelected(e)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                      e.type === 'adr' && 'bg-primary/10 text-primary',
                      e.type === 'doc' && 'bg-surface-3 text-muted',
                      e.type === 'runbook' && 'bg-accent/10 text-accent',
                      e.type === 'postmortem' && 'bg-error/10 text-error',
                      e.type === 'faq' && 'bg-info/10 text-info',
                      e.type === 'api' && 'bg-success/10 text-success',
                    )}><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text">{e.title}</p>
                        {e.status === 'deprecated' && <Badge tone="error">deprecated</Badge>}
                        {e.status === 'draft' && <Badge tone="warning">draft</Badge>}
                      </div>
                      <p className="text-[11px] text-muted">{e.id} · {e.project} · {e.owner}</p>
                      <p className="mt-1.5 text-xs text-muted line-clamp-2">{e.excerpt}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <Badge tone={typeTone[e.type]} className="uppercase">{e.type}</Badge>
                    <span className="text-[11px] text-faint">{e.updatedAt}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      </PageBody>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <Card className="relative w-full max-w-2xl animate-fade-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-border p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge tone={typeTone[selected.type]} className="uppercase">{selected.type}</Badge>
                <Badge tone={selected.status === 'stable' ? 'success' : selected.status === 'draft' ? 'warning' : 'error'}>{selected.status}</Badge>
                <span className="text-[11px] text-faint ml-auto">{selected.id} · {selected.updatedAt}</span>
              </div>
              <h2 className="text-lg font-semibold text-text">{selected.title}</h2>
              <p className="mt-1 text-xs text-muted">{selected.project} · owned by {selected.owner}</p>
            </div>
            <div className="p-5">
              <p className="text-sm text-muted">{selected.excerpt}</p>
              {selected.code && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">Code</p>
                    <button onClick={() => { navigator.clipboard?.writeText(selected.code!); push({ kind: 'success', title: 'Code copied' }); }} className="btn-ghost p-1.5 text-xs"><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  <pre className="rounded-lg border border-border bg-[#0d1117] p-3 overflow-x-auto text-[12.5px] text-slate-200 font-mono">{selected.code}</pre>
                </div>
              )}
              <div className="mt-5 flex items-center gap-2">
                <button className="btn-primary"><FolderKanban className="h-4 w-4" /> Open project</button>
                <button className="btn-outline"><FileText className="h-4 w-4" /> Related docs</button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
