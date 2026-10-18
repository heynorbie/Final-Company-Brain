import { useMemo, useState } from 'react';
import { Search, ScrollText, Download, Filter } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { auditLogs } from '@/data/mockData';
import { timeAgo } from '@/lib/utils';

export function AuditPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return auditLogs.filter((l) => l.action.toLowerCase().includes(q) || l.actor.toLowerCase().includes(q) || l.target.toLowerCase().includes(q));
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of administrative actions and system events."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button className="btn-outline"><Download className="h-4 w-4" /> Export CSV</button>}
      />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="p-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by actor, action, or target..." className="input pl-9" />
              </div>
              <button className="btn-outline"><Filter className="h-4 w-4" /> Filters</button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                  <th className="px-4 py-3">Event ID</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                    <td className="px-4 py-3"><Badge tone="neutral">{l.id}</Badge></td>
                    <td className="px-4 py-3 text-text">{l.action}</td>
                    <td className="px-4 py-3 text-muted">{l.actor}</td>
                    <td className="px-4 py-3"><code className="text-xs text-accent">{l.target}</code></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{l.ip}</td>
                    <td className="px-4 py-3 text-xs text-muted">{timeAgo(l.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No audit events match your search.</p>}
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
