import { useMemo, useState } from 'react';
import {
  Search, FileText, Upload, Filter, RefreshCw, Trash2, AlertTriangle,
  CheckCircle2, Clock, FileStack, X, FileCode, Link as LinkIcon, FileSpreadsheet,
  ChevronRight,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState, StatusDot } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { documents, type DocumentRecord } from '@/data/mockData';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

const typeIcons: Record<string, LucideIcon> = {
  pdf: FileText, docx: FileText, txt: FileText, md: FileCode,
  csv: FileSpreadsheet, url: LinkIcon, api: FileCode,
};

const statusTone: Record<DocumentRecord['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  indexed: 'success', processing: 'warning', failed: 'error', queued: 'neutral',
};

export function DocumentsPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [selected, setSelected] = useState<DocumentRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DocumentRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return documents.filter((d) => {
      if (type !== 'all' && d.type !== type) return false;
      if (status !== 'all' && d.status !== status) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.owner.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
    });
  }, [query, type, status]);

  const stats = useMemo(() => ({
    total: documents.length,
    indexed: documents.filter((d) => d.status === 'indexed').length,
    failed: documents.filter((d) => d.status === 'failed').length,
    processing: documents.filter((d) => d.status === 'processing').length,
    chunks: documents.reduce((acc, d) => acc + d.chunks, 0),
  }), []);

  function reindex(d: DocumentRecord) {
    push({ kind: 'info', title: `Reindexing "${d.name}"`, description: 'Document queued for the ingestion pipeline' });
  }

  function remove(d: DocumentRecord) {
    push({ kind: 'success', title: 'Document removed', description: `${d.name} was removed from the library` });
    setConfirmDelete(null);
  }

  return (
    <div>
      <PageHeader
        title="Document Library"
        description="All indexed company knowledge — upload, browse, search, and manage ingestion."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={
          <>
            <button onClick={() => setUploadOpen(true)} className="btn-primary"><Upload className="h-4 w-4" /> Upload</button>
          </>
        }
      />
      <PageBody>
        <PageContainer>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 mb-4">
            {[
              { label: 'Total documents', value: stats.total, icon: FileStack, tone: 'primary' },
              { label: 'Indexed', value: stats.indexed, icon: CheckCircle2, tone: 'success' },
              { label: 'Processing', value: stats.processing, icon: Clock, tone: 'warning' },
              { label: 'Failed', value: stats.failed, icon: AlertTriangle, tone: 'error' },
              { label: 'Total chunks', value: formatNumber(stats.chunks), icon: FileCode, tone: 'accent' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-3">
                  <div className={cn('inline-flex rounded-lg p-1.5',
                    s.tone === 'primary' && 'bg-primary/10 text-primary',
                    s.tone === 'success' && 'bg-success/10 text-success',
                    s.tone === 'warning' && 'bg-warning/10 text-warning',
                    s.tone === 'error' && 'bg-error/10 text-error',
                    s.tone === 'accent' && 'bg-accent/10 text-accent',
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-2 text-xl font-semibold text-text">{s.value}</p>
                  <p className="text-[11px] text-muted">{s.label}</p>
                </Card>
              );
            })}
          </div>

          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="input pl-9"
                />
              </div>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input lg:w-36">
                <option value="all">All types</option>
                {['pdf', 'docx', 'txt', 'md', 'csv', 'url', 'api'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input lg:w-36">
                <option value="all">All statuses</option>
                {['indexed', 'processing', 'failed', 'queued'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <div className="hidden lg:flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
                <button onClick={() => setView('table')} className={cn('rounded-md px-2.5 py-1 text-xs', view === 'table' ? 'bg-primary text-white' : 'text-muted')}>Table</button>
                <button onClick={() => setView('grid')} className={cn('rounded-md px-2.5 py-1 text-xs', view === 'grid' ? 'bg-primary text-white' : 'text-muted')}>Grid</button>
              </div>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={<Search className="h-6 w-6" />} title="No documents found" description="Adjust your filters or upload new documents." /></Card>
          ) : view === 'table' ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Owner</th>
                      <th className="px-4 py-3 font-semibold">Chunks</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Indexed</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d) => {
                      const Icon = typeIcons[d.type] || FileText;
                      return (
                        <tr key={d.id} className="border-b border-border last:border-0 hover:bg-surface-2/50 cursor-pointer" onClick={() => setSelected(d)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Icon className="h-4 w-4 text-muted shrink-0" />
                              <span className="font-medium text-text truncate max-w-xs">{d.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><span className="badge bg-surface-3 text-muted uppercase">{d.type}</span></td>
                          <td className="px-4 py-3 text-muted">{d.department}</td>
                          <td className="px-4 py-3 text-muted">{d.owner}</td>
                          <td className="px-4 py-3 text-muted">{d.chunks}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5">
                              <StatusDot tone={statusTone[d.status]} />
                              <span className="text-xs capitalize text-muted">{d.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted">{timeAgo(d.lastIndexed)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button onClick={(e) => { e.stopPropagation(); reindex(d); }} className="btn-ghost p-1.5" title="Reindex"><RefreshCw className="h-3.5 w-3.5" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(d); }} className="btn-ghost p-1.5 hover:text-error" title="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
                              <ChevronRight className="h-3.5 w-3.5 text-faint" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((d) => {
                const Icon = typeIcons[d.type] || FileText;
                return (
                  <Card key={d.id} className="group p-4 cursor-pointer transition hover:border-primary/40" >
                    <div className="flex items-start justify-between">
                      <div className={cn('grid h-10 w-10 place-items-center rounded-lg',
                        d.type === 'pdf' ? 'bg-error/10 text-error' :
                        d.type === 'md' ? 'bg-primary/10 text-primary' :
                        d.type === 'csv' ? 'bg-success/10 text-success' :
                        d.type === 'url' ? 'bg-accent/10 text-accent' : 'bg-surface-3 text-muted')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <StatusDot tone={statusTone[d.status]} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-text line-clamp-2" onClick={() => setSelected(d)}>{d.name}</p>
                    <p className="text-[11px] text-muted mt-0.5">{d.department} · {d.owner}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-faint">
                      <span>{d.chunks} chunks</span>
                      <span>{timeAgo(d.lastIndexed)}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </PageContainer>
      </PageBody>

      {/* Document detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg">
        {selected && (
          <div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Document ID', selected.id],
                ['Type', selected.type.toUpperCase()],
                ['Department', selected.department],
                ['Owner', selected.owner],
                ['Size', `${(selected.sizeKB / 1024).toFixed(2)} MB`],
                ['Chunks', String(selected.chunks)],
                ['Category', selected.category],
                ['Freshness', `${selected.freshness}%`],
              ].map(([k, v]) => (
                <div key={k} className="card-2 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-faint">{k}</p>
                  <p className="mt-1 text-sm text-text">{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <StatusDot tone={statusTone[selected.status]} />
                <span className="text-sm capitalize text-text">{selected.status}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reindex(selected)} className="btn-outline"><RefreshCw className="h-3.5 w-3.5" /> Reindex</button>
                <button onClick={() => { setSelected(null); setConfirmDelete(selected); }} className="btn-outline text-error"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Retrieved chunks (preview)</p>
              <div className="mt-2 space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="card-2 p-3">
                    <p className="text-[11px] text-faint">Chunk {i} · Section {i === 1 ? 'Overview' : 'Details'}</p>
                    <p className="mt-1 text-xs text-muted leading-relaxed">
                      {i === 1
                        ? 'This document outlines the foundational policies and procedures that govern internal operations across the engineering organization...'
                        : 'The technical implementation relies on a modular service architecture with clearly defined interfaces and ownership boundaries...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Knowledge" description="Add documents, URLs, or API sources to the Brain">
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-border bg-surface-2 p-8 text-center transition hover:border-primary/40">
            <Upload className="mx-auto h-8 w-8 text-faint" />
            <p className="mt-2 text-sm font-medium text-text">Drag & drop files here</p>
            <p className="text-xs text-muted">PDF, DOCX, TXT, CSV, Markdown · up to 25MB</p>
            <button className="btn-outline mt-3">Browse files</button>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Or add a URL</label>
            <div className="mt-1.5 flex gap-2">
              <input placeholder="https://wiki.company.ai/..." className="input" />
              <button onClick={() => { push({ kind: 'info', title: 'In a real deployment', description: 'The ingestion pipeline will fetch and index this URL.' }); }} className="btn-primary whitespace-nowrap">Add</button>
            </div>
          </div>
          <p className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-[11px] text-muted">
            Uploads are processed by a server-side ingestion pipeline. This demo accepts metadata only — no files are parsed or embedded.
          </p>
        </div>
      </Modal>

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Remove document?"
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
            <button onClick={() => confirmDelete && remove(confirmDelete)} className="btn bg-error text-white hover:bg-error/90">Remove</button>
          </>
        }
      >
        <p className="text-sm text-muted">"{confirmDelete?.name}" and all its chunks will be removed from the index. This cannot be undone.</p>
      </Modal>
    </div>
  );
}
