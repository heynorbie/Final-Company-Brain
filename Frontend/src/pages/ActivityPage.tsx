import { useMemo, useState } from 'react';
import { Search, Activity as ActivityIcon, Filter, Bot, FileText, Users, AlertTriangle } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { activityFeed, auditLogs } from '@/data/mockData';
import { cn, timeAgo } from '@/lib/utils';

const typeIcon = { agent: Bot, document: FileText, user: Users, ingestion: AlertTriangle } as const;
const typeTone = { agent: 'primary', document: 'accent', user: 'info', ingestion: 'error' } as const;

export function ActivityPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'all' | keyof typeof typeIcon>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return activityFeed.filter((a) => {
      if (type !== 'all' && a.type !== type) return false;
      if (!q) return true;
      return a.text.toLowerCase().includes(q) || a.dept.toLowerCase().includes(q);
    });
  }, [query, type]);

  return (
    <div>
      <PageHeader
        title="Activity Center"
        description="Unified feed of agent runs, document changes, ingestion events, and user activity."
        badge={{ label: 'Demo Data', tone: 'warning' }}
      />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activity..." className="input pl-9" />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {(['all', 'agent', 'document', 'user', 'ingestion'] as const).map((t) => (
                  <button key={t} onClick={() => setType(t)} className={cn('rounded-md px-3 py-1 text-xs font-medium capitalize', type === t ? 'bg-primary text-white' : 'text-muted')}>{t}</button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            {filtered.length === 0 ? (
              <EmptyState icon={<ActivityIcon className="h-6 w-6" />} title="No activity matches" description="Try a different filter or search." />
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((a) => {
                  const Icon = typeIcon[a.type as keyof typeof typeIcon];
                  const tone = typeTone[a.type as keyof typeof typeTone];
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-4">
                      <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                        tone === 'primary' && 'bg-primary/10 text-primary',
                        tone === 'accent' && 'bg-accent/10 text-accent',
                        tone === 'info' && 'bg-info/10 text-info',
                        tone === 'error' && 'bg-error/10 text-error',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text">{a.text}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge tone="neutral">{a.dept}</Badge>
                          <span className="text-[11px] text-faint">{timeAgo(a.at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <h2 className="mt-6 text-sm font-semibold text-text">Audit Trail (preview)</h2>
          <Card className="mt-2 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                  <th className="px-4 py-2.5">Event</th>
                  <th className="px-4 py-2.5">Actor</th>
                  <th className="px-4 py-2.5">Target</th>
                  <th className="px-4 py-2.5">IP</th>
                  <th className="px-4 py-2.5">When</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-text">{l.action}</td>
                    <td className="px-4 py-3 text-muted">{l.actor}</td>
                    <td className="px-4 py-3"><code className="text-xs text-accent">{l.target}</code></td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">{l.ip}</td>
                    <td className="px-4 py-3 text-muted text-xs">{timeAgo(l.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
