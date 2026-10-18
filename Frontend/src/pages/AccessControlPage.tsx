import { Lock, ShieldCheck, FileText, Bot, UserCog, Eye, EyeOff } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export function AccessControlPage() {
  const { push } = useToast();

  const matrix = [
    { resource: 'All documents', admin: 'full', manager: 'read', employee: 'read_own', viewer: 'none' },
    { resource: 'Restricted policies', admin: 'full', manager: 'read', employee: 'none', viewer: 'none' },
    { resource: 'Employee directory', admin: 'full', manager: 'read', employee: 'read', viewer: 'read' },
    { resource: 'Agent management', admin: 'full', manager: 'limited', employee: 'none', viewer: 'none' },
    { resource: 'Audit logs', admin: 'read', manager: 'none', employee: 'none', viewer: 'none' },
    { resource: 'Analytics', admin: 'full', manager: 'read_dept', employee: 'read_own', viewer: 'none' },
    { resource: 'Integrations', admin: 'full', manager: 'none', employee: 'none', viewer: 'none' },
  ];

  const cell: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' | 'error' | 'primary' }> = {
    full: { label: 'Full', tone: 'success' },
    read: { label: 'Read', tone: 'primary' },
    read_own: { label: 'Own data', tone: 'primary' },
    read_dept: { label: 'Department', tone: 'primary' },
    limited: { label: 'Limited', tone: 'warning' },
    none: { label: 'None', tone: 'neutral' },
  };

  return (
    <div>
      <PageHeader title="Access Control" description="Role-based permissions enforced server-side. The frontend hides UI as a convenience, not a security boundary." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Permission Model" icon={<ShieldCheck className="h-4 w-4" />} />
              <CardBody className="space-y-2.5 text-sm text-muted">
                <p>Access is enforced at three layers:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" /> <span><strong className="text-text">Row-level security</strong> — Postgres RLS scopes rows by user identity.</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" /> <span><strong className="text-text">Column privileges</strong> — sensitive fields hidden via grants.</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-success" /> <span><strong className="text-text">Service functions</strong> — privileged mutations run as SECURITY DEFINER.</span></li>
                </ul>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Document Permissions" icon={<FileText className="h-4 w-4" />} />
              <CardBody className="space-y-2">
                {['Engineering docs', 'HR policies', 'Security procedures', 'Financial records'].map((d) => (
                  <div key={d} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <span className="text-sm">{d}</span>
                    <Badge tone={d === 'Security procedures' || d === 'Financial records' ? 'warning' : 'success'}>{d === 'Security procedures' || d === 'Financial records' ? 'Restricted' : 'Open'}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Agent Permissions" icon={<Bot className="h-4 w-4" />} />
              <CardBody className="space-y-2">
                {['HR Policy Assistant', 'Engineering Docs', 'IT Helpdesk'].map((a) => (
                  <div key={a} className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <span className="text-sm">{a}</span>
                    <Badge tone="primary">All employees</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <Card className="mt-4 overflow-hidden">
            <CardHeader title="Permission Matrix" subtitle="What each role can do" icon={<Lock className="h-4 w-4" />} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Admin</th><th className="px-4 py-3">Manager</th><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.resource} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-text">{row.resource}</td>
                      {(['admin', 'manager', 'employee', 'viewer'] as const).map((role) => {
                        const c = cell[row[role] as keyof typeof cell];
                        return <td key={role} className="px-4 py-3"><Badge tone={c.tone}>{c.label}</Badge></td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="mt-4">
            <CardHeader title="Authentication Settings" icon={<UserCog className="h-4 w-4" />} />
            <CardBody className="space-y-3">
              {[
                { label: 'SSO (SAML 2.0)', on: true },
                { label: 'Multi-factor authentication', on: true },
                { label: 'Session timeout (60 min)', on: true },
                { label: 'Allow public sign-up', on: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    {s.on ? <Eye className="h-4 w-4 text-success" /> : <EyeOff className="h-4 w-4 text-faint" />}
                    <span className="text-sm">{s.label}</span>
                  </div>
                  <button
                    onClick={() => push({ kind: 'info', title: 'Setting toggled', description: 'Enforced in Phase 2 backend.' })}
                    className={`relative h-6 w-11 rounded-full transition ${s.on ? 'bg-primary' : 'bg-surface-3'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${s.on ? 'left-0.5 right-5' : 'left-0.5'}`} style={{ left: s.on ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </CardBody>
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
