import { useState } from 'react';
import {
  Bot, Plus, Copy, Archive, Pencil, Play, Search, MoreVertical,
  CheckCircle2, Clock, Trash2, Sparkles, Workflow, Save, X,
  Circle, ArrowRight, Wrench, Database, Brain, MessageSquare,
} from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge, EmptyState, StatusDot } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { agents, agentTemplates, type Agent } from '@/data/mockData';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

const statusTone: Record<Agent['status'], 'success' | 'warning' | 'neutral'> = {
  active: 'success', draft: 'warning', archived: 'neutral',
};

const workflowNodes = [
  { id: 'input', label: 'User Input', icon: MessageSquare, x: 40, y: 40, kind: 'input' },
  { id: 'retrieve', label: 'Retrieval', icon: Database, x: 220, y: 40, kind: 'retrieve' },
  { id: 'reason', label: 'Reasoning', icon: Brain, x: 400, y: 40, kind: 'reason' },
  { id: 'tools', label: 'Tools', icon: Wrench, x: 400, y: 140, kind: 'tools' },
  { id: 'respond', label: 'Response', icon: Sparkles, x: 580, y: 90, kind: 'respond' },
];
const workflowEdges = [
  { from: 'input', to: 'retrieve' },
  { from: 'retrieve', to: 'reason' },
  { from: 'reason', to: 'tools' },
  { from: 'reason', to: 'respond' },
  { from: 'tools', to: 'respond' },
];

export function AgentsPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Agent['status']>('all');
  const [editing, setEditing] = useState<Agent | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const filtered = agents.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (!query) return true;
    return a.name.toLowerCase().includes(query.toLowerCase()) || a.description.toLowerCase().includes(query.toLowerCase());
  });

  function duplicate(a: Agent) {
    push({ kind: 'success', title: 'Agent duplicated', description: `${a.name} (copy) created as draft` });
  }
  function archive(a: Agent) {
    push({ kind: 'info', title: 'Agent archived', description: a.name });
  }
  function toggleActive(a: Agent) {
    push({ kind: 'success', title: a.status === 'active' ? 'Agent disabled' : 'Agent enabled', description: a.name });
  }

  return (
    <div>
      <PageHeader
        title="Agent Studio"
        description="Create, configure, and manage AI agents backed by your company knowledge."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={
          <>
            <button onClick={() => setShowTemplates(true)} className="btn-outline"><Sparkles className="h-4 w-4" /> Templates</button>
            <button onClick={() => setEditing({ id: 'AGT-NEW', name: '', description: '', model: 'gpt-4o-mini', sources: 0, status: 'draft', category: 'General', runs: 0, successRate: 0, updatedAt: new Date().toISOString() })} className="btn-primary"><Plus className="h-4 w-4" /> New Agent</button>
          </>
        }
      />
      <PageBody>
        <PageContainer>
          {/* Filters */}
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agents..." className="input pl-9" />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {(['all', 'active', 'draft', 'archived'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('rounded-md px-3 py-1 text-xs font-medium capitalize', filter === f ? 'bg-primary text-white' : 'text-muted')}>{f}</button>
                ))}
              </div>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={<Bot className="h-6 w-6" />} title="No agents found" description="Create one from scratch or use a template." action={<button onClick={() => setShowTemplates(true)} className="btn-primary mt-2">Browse templates</button>} /></Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((a) => (
                <Card key={a.id} className="group p-4 transition hover:border-primary/40">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text">{a.name}</p>
                        <StatusDot tone={statusTone[a.status]} />
                      </div>
                      <p className="text-[11px] text-muted">{a.id} · {a.model}</p>
                    </div>
                    <div className="relative">
                      <button className="btn-ghost p-1.5"><MoreVertical className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted line-clamp-2 min-h-[2.5rem]">{a.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
                    <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {a.sources} sources</span>
                    <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {formatNumber(a.runs)} runs</span>
                    {a.successRate > 0 && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> {a.successRate}%</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <Badge tone="neutral">{a.category}</Badge>
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(a)} className="btn-ghost p-1.5" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => duplicate(a)} className="btn-ghost p-1.5" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setShowBuilder(true)} className="btn-ghost p-1.5" title="Workflow"><Workflow className="h-3.5 w-3.5" /></button>
                      <button onClick={() => archive(a)} className="btn-ghost p-1.5" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                      <button onClick={() => toggleActive(a)} className={cn('btn-ghost p-1.5', a.status === 'active' && 'text-success')} title="Toggle"><Sparkles className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContainer>
      </PageBody>

      {/* Editor */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'AGT-NEW' ? 'Create Agent' : `Edit · ${editing?.name}`}
        description="Configure the agent's behavior, knowledge, and model."
        size="xl"
        footer={<><button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button><button onClick={() => { push({ kind: 'success', title: 'Agent saved' }); setEditing(null); }} className="btn-primary"><Save className="h-4 w-4" /> Save</button></>}
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Name</label>
                <input defaultValue={editing.name} placeholder="e.g. Engineering Docs Assistant" className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Model</label>
                <select defaultValue={editing.model} className="input mt-1.5">
                  <option>gpt-4o</option><option>gpt-4o-mini</option><option>claude-3.5-sonnet</option><option>claude-3-haiku</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
              <input defaultValue={editing.description} className="input mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Instructions</label>
              <textarea defaultValue={`You are ${editing.name}. Answer only from indexed company knowledge. Cite sources. If information is missing, say so explicitly — do not fabricate.`} rows={4} className="input mt-1.5" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Temperature</label>
                <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" className="w-full mt-2" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Top K chunks</label>
                <input type="number" defaultValue="6" className="input mt-1.5" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted">Max tokens</label>
                <input type="number" defaultValue="1024" className="input mt-1.5" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Knowledge sources</label>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                {['Engineering docs', 'HR policies', 'Security procedures', 'Project wiki', 'API references', 'Incident postmortems'].map((s, i) => (
                  <label key={s} className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-2.5 text-sm">
                    <input type="checkbox" defaultChecked={i < 3} className="accent-primary" />
                    <span className="text-text">{s}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">Permitted tools</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {['Semantic search', 'Document fetch', 'Employee lookup', 'Web search (off)', 'Code exec (off)'].map((t, i) => (
                  <label key={t} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs', i < 3 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted')}>
                    <input type="checkbox" defaultChecked={i < 3} className="accent-primary" /> {t}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Templates */}
      <Modal open={showTemplates} onClose={() => setShowTemplates(false)} title="Agent Templates" description="Start from a preconfigured agent for common use cases" size="xl">
        <div className="grid gap-3 sm:grid-cols-2">
          {agentTemplates.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.name} onClick={() => { setShowTemplates(false); push({ kind: 'success', title: 'Template loaded', description: t.name }); }} className="card group p-4 text-left transition hover:border-primary/40 hover:shadow-glow">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-text">{t.name}</p>
                    <Badge tone="neutral" className="mt-0.5">{t.category}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">{t.description}</p>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Workflow builder */}
      <Modal open={showBuilder} onClose={() => setShowBuilder(false)} title="Workflow Builder" description="Visual prototype of the agent's reasoning pipeline" size="xl"
        footer={<><span className="text-[11px] text-faint mr-auto">Prototype only — does not execute real workflows.</span><button onClick={() => setShowBuilder(false)} className="btn-primary">Done</button></>}
      >
        <div className="rounded-xl border border-border bg-surface-2 p-3 overflow-x-auto">
          <svg width="680" height="220" className="mx-auto">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <path d="M0,0 L0,6 L9,3 z" fill="rgb(var(--muted))" />
              </marker>
            </defs>
            {workflowEdges.map((e, i) => {
              const from = workflowNodes.find((n) => n.id === e.from)!;
              const to = workflowNodes.find((n) => n.id === e.to)!;
              return (
                <line key={i} x1={from.x + 80} y1={from.y + 30} x2={to.x} y2={to.y + 30} stroke="rgb(var(--border-strong))" strokeWidth="2" markerEnd="url(#arrow)" />
              );
            })}
            {workflowNodes.map((n) => {
              const Icon = n.icon;
              return (
                <g key={n.id}>
                  <rect x={n.x} y={n.y} width="120" height="60" rx="10" fill="rgb(var(--surface))" stroke="rgb(var(--primary))" strokeOpacity="0.4" />
                  <foreignObject x={n.x + 8} y={n.y + 12} width="104" height="36">
                    <div className="flex items-center gap-2 text-xs text-text">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium">{n.label}</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            { icon: CheckCircle2, label: 'Validation: all nodes connected', tone: 'success' },
            { icon: Clock, label: 'Estimated latency: 1.2s avg', tone: 'neutral' },
          ].map((x) => {
            const Icon = x.icon;
            return (
              <div key={x.label} className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-xs">
                <Icon className={cn('h-3.5 w-3.5', x.tone === 'success' ? 'text-success' : 'text-muted')} />
                <span className="text-muted">{x.label}</span>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
