import { useState } from 'react';
import { UserCog, Plus, Search, MoreVertical, Shield, Clock } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, StatusDot } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { users, roles } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusTone = { active: 'success', away: 'warning', suspended: 'error' } as const;
const roleTone: Record<string, 'primary' | 'accent' | 'neutral' | 'warning'> = { Admin: 'primary', Manager: 'accent', Employee: 'neutral', Viewer: 'warning' };

export function UsersPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()) || u.role.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Manage workspace members, their roles, and access levels."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button onClick={() => setInviteOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> Invite</button>}
      />
      <PageBody>
        <PageContainer>
          <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface p-0.5 w-fit">
            <button onClick={() => setTab('users')} className={cn('rounded-md px-3 py-1.5 text-xs font-medium', tab === 'users' ? 'bg-primary text-white' : 'text-muted')}>Users</button>
            <button onClick={() => setTab('roles')} className={cn('rounded-md px-3 py-1.5 text-xs font-medium', tab === 'roles' ? 'bg-primary text-white' : 'text-muted')}>Roles</button>
          </div>

          {tab === 'users' ? (
            <>
              <Card className="mb-4">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="input pl-9" />
                  </div>
                </div>
              </Card>
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                      <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last active</th><th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[11px] font-semibold text-white">
                              {u.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text">{u.name}</p>
                              <p className="text-[11px] text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge tone={roleTone[u.role]}>{u.role}</Badge></td>
                        <td className="px-4 py-3"><span className="flex items-center gap-1.5"><StatusDot tone={statusTone[u.status as keyof typeof statusTone]} /><span className="text-xs capitalize text-muted">{u.status}</span></span></td>
                        <td className="px-4 py-3 text-xs text-muted">{u.lastActive}</td>
                        <td className="px-4 py-3"><button className="btn-ghost p-1.5"><MoreVertical className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {roles.map((r) => (
                <Card key={r.name} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Shield className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-semibold text-text">{r.name}</p>
                        <p className="text-[11px] text-muted">{r.users} users · {r.permissions} permissions</p>
                      </div>
                    </div>
                    <Badge tone={r.name === 'Admin' ? 'primary' : 'neutral'}>{r.users}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-muted">{r.description}</p>
                </Card>
              ))}
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite users" description="Send invitations to join the workspace"
        footer={<><button onClick={() => setInviteOpen(false)} className="btn-ghost">Cancel</button><button onClick={() => { push({ kind: 'success', title: 'Invitations sent' }); setInviteOpen(false); }} className="btn-primary">Send invites</button></>}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Email addresses</label>
            <textarea placeholder="alice@company.ai, bob@company.ai" rows={3} className="input mt-1.5" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Default role</label>
            <select className="input mt-1.5"><option>Employee</option><option>Manager</option><option>Viewer</option></select>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-faint"><Clock className="h-3 w-3" /> Invitations expire after 7 days.</p>
        </div>
      </Modal>
    </div>
  );
}
