import { useState, useMemo } from 'react';
import { PlayCircle, Search, CheckCircle2, XCircle, Clock, Filter, Download } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, StatusDot } from '@/components/ui';
import { agents } from '@/data/mockData';
import { cn, formatNumber, timeAgo } from '@/lib/utils';

interface Run { id: string; agent: string; query: string; status: 'success' | 'failed' | 'running'; duration: number; tokens: number; at: string }

const runs: Run[] = Array.from({ length: 24 }, (_, i) => {
  const agent = agents[i % agents.length];
  const queries = ['What is our tech stack?', 'Summarize onboarding', 'Who owns Atlas API?', 'Security procedures?', 'Find ADRs about vector search', 'IT helpdesk: VPN setup'];
  const status = i % 7 === 0 ? 'failed' : i % 11 === 0 ? 'running' : 'success';
  return {
    id: `RUN-${String(4200 - i).padStart(4, '0')}`,
    agent: agent.name,
    query: queries[i % queries.length],
    status,
    duration: 600 + Math.floor(Math.sin(i) * 500 + 800),
    tokens: 320 + Math.floor(Math.cos(i) * 200 + 400),
    at: new Date(Date.now() - i * 1800_000 - i * 60000).toISOString(),
  };
});

const statusTone = { success: 'success', failed: 'error', running: 'warning' } as const;

export function AgentRunsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Run['status']>('all');

  const filtered = useMemo(() => runs.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    const q = query.toLowerCase();
    return !q || r.agent.toLowerCase().includes(q) || r.query.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  }), [query, filter]);

  return (
    <div>
      <PageHeader
        title="Agent Runs"
        description="Live and historical execution log for all AI agents."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button className="btn-outline"><Download className="h-4 w-4" /> Export</button>}
      />
      <PageBody>
        <PageContainer>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-4">
            {[
              { label: 'Total runs', value: formatNumber(runs.length * 380), icon: PlayCircle, tone: 'primary' },
              { label: 'Success rate', value: '92%', icon: CheckCircle2, tone: 'success' },
              { label: 'Failed today', value: '14', icon: XCircle, tone: 'error' },
              { label: 'Avg duration', value: '1.4s', icon: Clock, tone: 'accent' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-4">
                  <div className={cn('inline-flex rounded-lg p-2',
                    s.tone === 'primary' && 'bg-primary/10 text-primary',
                    s.tone === 'success' && 'bg-success/10 text-success',
                    s.tone === 'error' && 'bg-error/10 text-error',
                    s.tone === 'accent' && 'bg-accent/10 text-accent',
                  )}><Icon className="h-4 w-4" /></div>
                  <p className="mt-3 text-2xl font-semibold text-text">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </Card>
              );
            })}
          </div>

          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search runs..." className="input pl-9" />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {(['all', 'success', 'failed', 'running'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('rounded-md px-3 py-1 text-xs font-medium capitalize', filter === f ? 'bg-primary text-white' : 'text-muted')}>{f}</button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                    <th className="px-4 py-3">Run</th><th className="px-4 py-3">Agent</th><th className="px-4 py-3">Query</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Tokens</th><th className="px-4 py-3">When</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                      <td className="px-4 py-3"><code className="text-xs text-accent">{r.id}</code></td>
                      <td className="px-4 py-3 text-text">{r.agent}</td>
                      <td className="px-4 py-3 text-muted max-w-xs truncate">{r.query}</td>
                      <td className="px-4 py-3"><span className="flex items-center gap-1.5"><StatusDot tone={statusTone[r.status]} pulse={r.status === 'running'} /><span className="text-xs capitalize text-muted">{r.status}</span></span></td>
                      <td className="px-4 py-3 text-muted">{(r.duration / 1000).toFixed(2)}s</td>
                      <td className="px-4 py-3 text-muted">{r.tokens}</td>
                      <td className="px-4 py-3 text-xs text-muted">{timeAgo(r.at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No runs match your filters.</p>}
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
