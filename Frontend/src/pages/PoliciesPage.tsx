import { useState, useMemo } from 'react';
import { ShieldCheck, Search, FileText, Lock, Download, ChevronRight } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { documents, type DocumentRecord } from '@/data/mockData';
import { cn, timeAgo } from '@/lib/utils';

interface Policy { id: string; name: string; department: string; owner: string; effective: string; reviewBy: string; access: 'open' | 'restricted'; summary: string; version: string }

const policies: Policy[] = [
  { id: 'POL-001', name: 'Data Retention Policy', department: 'Security', owner: 'Reza Haddad', effective: '2026-01-15', reviewBy: '2027-01-15', access: 'restricted', summary: 'Defines retention windows for operational logs (90 days), audit events (1 year), and customer data (per contract).', version: 'v2.3' },
  { id: 'POL-002', name: 'Incident Response Procedure', department: 'Security', owner: 'Reza Haddad', effective: '2026-03-01', reviewBy: '2026-12-01', access: 'restricted', summary: 'Sev1-3 classification, on-call rotation, escalation paths, and postmortem requirements.', version: 'v3.1' },
  { id: 'POL-003', name: 'Employee Onboarding Policy', department: 'HR', owner: 'Yuki Yamamoto', effective: '2026-02-10', reviewBy: '2027-02-10', access: 'open', summary: 'Standard 14-day onboarding: accounts, hardware, training, buddy assignment, and 30-day goals.', version: 'v1.4' },
  { id: 'POL-004', name: 'Remote Work Guidelines', department: 'HR', owner: 'Yuki Yamamoto', effective: '2026-04-22', reviewBy: '2027-04-22', access: 'open', summary: 'Eligibility, equipment stipend, core overlap hours, and tax residency requirements.', version: 'v1.2' },
  { id: 'POL-005', name: 'Vendor Security Questionnaire', department: 'Security', owner: 'Dmitri Ivanov', effective: '2026-05-01', reviewBy: '2026-11-01', access: 'restricted', summary: 'Mandatory SOC2 evidence, data processing terms, and quarterly review cadence for vendors.', version: 'v2.0' },
  { id: 'POL-006', name: 'Travel and Expense Policy', department: 'Operations', owner: 'Clara Costa', effective: '2026-01-01', reviewBy: '2027-01-01', access: 'open', summary: 'Per-diem rates, approval thresholds, reimbursement workflow, and receipt requirements.', version: 'v1.8' },
  { id: 'POL-007', name: 'Acceptable Use Policy', department: 'IT', owner: 'Dmitri Ivanov', effective: '2026-01-01', reviewBy: '2027-01-01', access: 'open', summary: 'Device usage, software installation, and data handling rules for all employees.', version: 'v2.1' },
  { id: 'POL-008', name: 'Access Control Policy', department: 'Security', owner: 'Reza Haddad', effective: '2026-02-15', reviewBy: '2026-08-15', access: 'restricted', summary: 'JIT access, SSO+MFA, least-privilege principle, and quarterly access reviews.', version: 'v3.0' },
];

export function PoliciesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'restricted'>('all');
  const [selected, setSelected] = useState<Policy | null>(null);

  const filtered = useMemo(() => policies.filter((p) => {
    if (filter !== 'all' && p.access !== filter) return false;
    const q = query.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
  }), [query, filter]);

  return (
    <div>
      <PageHeader
        title="Company Policies"
        description="Official, versioned policies — security, HR, IT, and operations."
        badge={{ label: 'Demo Data', tone: 'warning' }}
      />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search policies..." className="input pl-9" />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
                {(['all', 'open', 'restricted'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cn('rounded-md px-3 py-1 text-xs font-medium capitalize', filter === f ? 'bg-primary text-white' : 'text-muted')}>{f}</button>
                ))}
              </div>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={<ShieldCheck className="h-6 w-6" />} title="No policies found" description="Try a different search." /></Card>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((p) => (
                <Card key={p.id} className="group p-4 cursor-pointer transition hover:border-primary/40" onClick={() => setSelected(p)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', p.access === 'restricted' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>
                      {p.access === 'restricted' ? <Lock className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text">{p.name}</p>
                        <Badge tone="neutral">{p.version}</Badge>
                      </div>
                      <p className="text-[11px] text-muted">{p.department} · {p.owner}</p>
                      <p className="mt-1.5 text-xs text-muted line-clamp-2">{p.summary}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-faint group-hover:text-primary" />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <Badge tone={p.access === 'restricted' ? 'warning' : 'success'}>{p.access}</Badge>
                    <span className="text-[11px] text-faint">Review by {p.reviewBy}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} size="lg"
        footer={<><button onClick={() => setSelected(null)} className="btn-ghost">Close</button><button className="btn-outline"><Download className="h-4 w-4" /> Download PDF</button></>}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">{selected.department}</Badge>
              <Badge tone="neutral">{selected.version}</Badge>
              <Badge tone={selected.access === 'restricted' ? 'warning' : 'success'}>{selected.access} access</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Policy ID', selected.id],
                ['Owner', selected.owner],
                ['Effective date', selected.effective],
                ['Next review', selected.reviewBy],
              ].map(([k, v]) => (
                <div key={k} className="card-2 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-faint">{k}</p>
                  <p className="mt-1 text-sm text-text">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Summary</p>
              <p className="mt-1.5 text-sm text-text">{selected.summary}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Related documents</p>
              <div className="mt-2 space-y-1.5">
                {documents.filter((d) => d.department === selected.department).slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <FileText className="h-3.5 w-3.5 text-muted" />
                    <span className="text-sm text-text truncate">{d.name}</span>
                    <span className="ml-auto text-[11px] text-faint">{timeAgo(d.lastIndexed)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
