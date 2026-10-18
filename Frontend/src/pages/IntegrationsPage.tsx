import { Plug, CheckCircle2, XCircle, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, StatusDot } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { integrations } from '@/data/mockData';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function IntegrationsPage() {
  const { push } = useToast();
  const [setup, setSetup] = useState<typeof integrations[number] | null>(null);

  return (
    <div>
      <PageHeader title="Data Sources & Integrations" description="Connect external systems to feed knowledge into the Brain. Only configured integrations are active." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((i) => {
              const Icon: LucideIcon = i.icon;
              return (
                <Card key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('grid h-10 w-10 place-items-center rounded-lg', i.connected ? 'bg-primary/10 text-primary' : 'bg-surface-3 text-faint')}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{i.name}</p>
                        <p className="text-[11px] text-muted">{i.items > 0 ? `${i.items} items indexed` : 'Not connected'}</p>
                      </div>
                    </div>
                    {i.connected ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-faint" />}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <StatusDot tone={i.connected ? 'success' : 'neutral'} />
                      <span className={cn(i.connected ? 'text-success' : 'text-faint')}>{i.connected ? 'Connected' : 'Available'}</span>
                    </span>
                    <span className="text-faint">{i.lastSync ? `Synced ${i.lastSync}` : '—'}</span>
                  </div>

                  <div className="mt-3 border-t border-border pt-3">
                    {i.connected ? (
                      <div className="flex items-center justify-between">
                        <button onClick={() => push({ kind: 'info', title: 'Settings', description: i.name })} className="btn-ghost p-1.5 text-xs"><SettingsIcon className="h-3.5 w-3.5" /> Configure</button>
                        <Badge tone="success">Healthy</Badge>
                      </div>
                    ) : (
                      <button onClick={() => setSetup(i)} className="btn-outline w-full text-xs">Connect <ArrowRight className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-3 text-[11px] text-muted">
            Integrations show as connected only when actually configured. Setup screens walk through the required credentials and scopes. No secrets are stored client-side.
          </p>
        </PageContainer>
      </PageBody>

      <Modal open={!!setup} onClose={() => setSetup(null)} title={`Connect ${setup?.name}`} description="Provide credentials and scopes to enable this integration"
        footer={<><button onClick={() => setSetup(null)} className="btn-ghost">Cancel</button><button onClick={() => { push({ kind: 'info', title: 'Demo only', description: 'Backend wiring required to connect.' }); setSetup(null); }} className="btn-primary">Connect</button></>}
      >
        <div className="space-y-3">
          <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">API key / token</label><input type="password" placeholder="••••••••" className="input mt-1.5" /></div>
          <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Workspace / org</label><input placeholder="company-ai" className="input mt-1.5" /></div>
          <p className="rounded-lg border border-border bg-surface-2 p-2.5 text-[11px] text-muted">Credentials are stored encrypted on the server and never exposed to the browser.</p>
        </div>
      </Modal>
    </div>
  );
}
