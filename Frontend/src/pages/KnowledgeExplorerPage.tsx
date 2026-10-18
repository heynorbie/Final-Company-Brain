import { useState } from 'react';
import { FolderTree, FileText, Network, Upload, Search, RefreshCw, Trash2 } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge, StatusDot } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { documents, knowledgeGraph } from '@/data/mockData';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

const nodeColors: Record<string, string> = {
  department: '#3b82f6', project: '#22d3ee', document: '#34d399', employee: '#fbbf24',
};

export function KnowledgeExplorerPage() {
  const { push } = useToast();
  const [tab, setTab] = useState<'files' | 'graph'>('files');
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const filtered = documents.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Knowledge Explorer"
        description="Browse indexed knowledge, inspect chunks, and explore the company knowledge graph."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button onClick={() => setUploadOpen(true)} className="btn-primary"><Upload className="h-4 w-4" /> Add Source</button>}
      />
      <PageBody>
        <PageContainer>
          <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface p-0.5 w-fit">
            <button onClick={() => setTab('files')} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium', tab === 'files' ? 'bg-primary text-white' : 'text-muted')}>
              <FileText className="h-3.5 w-3.5" /> Files & Chunks
            </button>
            <button onClick={() => setTab('graph')} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium', tab === 'graph' ? 'bg-primary text-white' : 'text-muted')}>
              <Network className="h-3.5 w-3.5" /> Knowledge Graph
            </button>
          </div>

          {tab === 'files' ? (
            <>
              <Card className="mb-4">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search knowledge..." className="input pl-9" />
                  </div>
                </div>
              </Card>
              <div className="grid gap-3 lg:grid-cols-2">
                {filtered.slice(0, 8).map((d) => (
                  <Card key={d.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted shrink-0" />
                        <p className="truncate text-sm font-semibold text-text">{d.name}</p>
                      </div>
                      <StatusDot tone={d.status === 'indexed' ? 'success' : d.status === 'failed' ? 'error' : 'warning'} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="neutral">{d.department}</Badge>
                      <Badge tone="primary">{d.chunks} chunks</Badge>
                      <Badge tone="accent">{d.category}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted line-clamp-2">
                      Retrieved chunk preview: "This document establishes the foundational approach for {d.category} within the {d.department} organization..."
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[11px] text-faint">Indexed {timeAgo(d.lastIndexed)} · {formatNumber(d.chunks)} chunks</span>
                      <div className="flex gap-1">
                        <button onClick={() => push({ kind: 'info', title: 'Reindex queued', description: d.name })} className="btn-ghost p-1.5"><RefreshCw className="h-3.5 w-3.5" /></button>
                        <button onClick={() => push({ kind: 'success', title: 'Removed', description: d.name })} className="btn-ghost p-1.5 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardHeader title="Knowledge Graph" subtitle="Synthetic relationships between documents, projects, teams, and people" icon={<Network className="h-4 w-4" />} action={<Badge tone="warning">Synthetic data</Badge>} />
              <CardBody>
                <div className="rounded-xl border border-border bg-surface-2 p-3 overflow-x-auto">
                  <svg width="680" height="440" className="mx-auto">
                    {knowledgeGraph.edges.map((e, i) => {
                      const from = knowledgeGraph.nodes.find((n) => n.id === e.from)!;
                      const to = knowledgeGraph.nodes.find((n) => n.id === e.to)!;
                      return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgb(var(--border-strong))" strokeWidth="1.5" opacity="0.6" />;
                    })}
                    {knowledgeGraph.nodes.map((n) => (
                      <g key={n.id} className="cursor-pointer" onClick={() => setSelectedNode(n.id)}>
                        <circle cx={n.x} cy={n.y} r={selectedNode === n.id ? 18 : 14} fill={nodeColors[n.type]} fillOpacity="0.18" stroke={nodeColors[n.type]} strokeWidth="2" />
                        <text x={n.x} y={n.y + 30} textAnchor="middle" fill="rgb(var(--muted))" fontSize="10">{n.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                  {Object.entries(nodeColors).map(([k, v]) => (
                    <span key={k} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: v }} /> {k}</span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </PageContainer>
      </PageBody>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Add Knowledge Source" size="lg">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {['Upload file', 'Add URL', 'Connect integration'].map((x, i) => (
              <button key={x} onClick={() => push({ kind: 'info', title: 'Selected', description: x })} className={cn('card-2 p-4 text-left transition hover:border-primary/40', i === 0 && 'border-primary/40')}>
                <Upload className="h-4 w-4 text-primary" />
                <p className="mt-2 text-sm font-medium">{x}</p>
              </button>
            ))}
          </div>
          <p className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-[11px] text-muted">
            Ingestion is performed by a server-side pipeline. This demo does not parse or embed files.
          </p>
        </div>
      </Modal>

      <Modal open={!!selectedNode} onClose={() => setSelectedNode(null)} title="Graph Node" size="sm">
        {(() => {
          const n = knowledgeGraph.nodes.find((x) => x.id === selectedNode);
          if (!n) return null;
          const related = knowledgeGraph.edges.filter((e) => e.from === n.id || e.to === n.id);
          return (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: nodeColors[n.type] }} />
                <p className="text-sm font-semibold">{n.label}</p>
              </div>
              <Badge tone="neutral" className="capitalize">{n.type}</Badge>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Connected to</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {related.map((e) => {
                    const other = knowledgeGraph.nodes.find((x) => x.id === (e.from === n.id ? e.to : e.from))!;
                    return <Badge key={other.id} tone="primary">{other.label}</Badge>;
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
