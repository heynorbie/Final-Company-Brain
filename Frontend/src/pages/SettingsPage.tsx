import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Brain, Palette, Globe, Key, Server } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'general', label: 'General', icon: SettingsIcon },
  { id: 'ai', label: 'AI Models', icon: Brain },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'env', label: 'Environment', icon: Server },
] as const;

export function SettingsPage() {
  const { push } = useToast();
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState<typeof sections[number]['id']>('general');

  return (
    <div>
      <PageHeader title="Settings" description="Workspace configuration, AI models, appearance, and environment health." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <Card className="p-2 h-fit">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => setActive(s.id)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition', active === s.id ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface-2 hover:text-text')}>
                    <Icon className="h-4 w-4" /> {s.label}
                  </button>
                );
              })}
            </Card>

            <div className="space-y-4">
              {active === 'general' && (
                <Card>
                  <CardHeader title="Workspace" subtitle="Organization identity" />
                  <CardBody className="space-y-3">
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Organization name</label><input defaultValue="Company Brain AI" className="input mt-1.5" /></div>
                    <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Workspace URL</label><input defaultValue="company.brain.ai" className="input mt-1.5" /></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Default language</label><select className="input mt-1.5"><option>English</option><option>Deutsch</option><option>日本語</option></select></div>
                      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Timezone</label><select className="input mt-1.5"><option>UTC</option><option>America/Los_Angeles</option><option>Europe/London</option></select></div>
                    </div>
                    <button onClick={() => push({ kind: 'success', title: 'Settings saved' })} className="btn-primary">Save changes</button>
                  </CardBody>
                </Card>
              )}

              {active === 'ai' && (
                <Card>
                  <CardHeader title="AI Models" subtitle="Configure LLM providers — credentials are stored server-side" icon={<Key className="h-4 w-4" />} />
                  <CardBody className="space-y-3">
                    {[
                      { name: 'OpenAI', models: 'GPT-4o, GPT-4o-mini', configured: true },
                      { name: 'Anthropic', models: 'Claude 3.5 Sonnet, Haiku', configured: true },
                      { name: 'Google', models: 'Gemini 1.5 Pro', configured: false },
                      { name: 'Self-hosted (vLLM)', models: 'Llama 3.1 70B', configured: false },
                    ].map((p) => (
                      <div key={p.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-[11px] text-muted">{p.models}</p>
                        </div>
                        <Badge tone={p.configured ? 'success' : 'neutral'}>{p.configured ? 'Configured' : 'Not set'}</Badge>
                      </div>
                    ))}
                    <p className="rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-[11px] text-muted">API keys are never exposed to the client. All LLM calls are proxied through server-side edge functions.</p>
                  </CardBody>
                </Card>
              )}

              {active === 'appearance' && (
                <Card>
                  <CardHeader title="Appearance" subtitle="Theme and density" icon={<Palette className="h-4 w-4" />} />
                  <CardBody className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted">Theme</label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {(['light', 'dark'] as const).map((t) => (
                          <button key={t} onClick={() => setTheme(t)} className={cn('rounded-xl border-2 p-4 text-left transition', theme === t ? 'border-primary' : 'border-border')}>
                            <div className={cn('h-16 rounded-lg', t === 'dark' ? 'bg-[#0b0f18]' : 'bg-slate-100')}>
                              <div className={cn('m-2 h-3 w-12 rounded', t === 'dark' ? 'bg-primary' : 'bg-primary')} />
                              <div className={cn('mx-2 h-2 w-20 rounded', t === 'dark' ? 'bg-slate-700' : 'bg-slate-300')} />
                            </div>
                            <p className="mt-2 text-sm font-medium capitalize">{t}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {active === 'notifications' && (
                <Card>
                  <CardHeader title="Notifications" subtitle="When and how we contact you" icon={<Bell className="h-4 w-4" />} />
                  <CardBody className="space-y-2">
                    {['Ingestion failures', 'Knowledge gaps detected', 'Agent performance drops', 'Weekly digest'].map((n) => (
                      <label key={n} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="text-sm">{n}</span>
                        <input type="checkbox" defaultChecked className="accent-primary h-4 w-4" />
                      </label>
                    ))}
                  </CardBody>
                </Card>
              )}

              {active === 'security' && (
                <Card>
                  <CardHeader title="Security & Data Retention" subtitle="Retention windows and audit settings" icon={<Shield className="h-4 w-4" />} />
                  <CardBody className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Log retention (days)</label><input defaultValue="90" className="input mt-1.5" /></div>
                      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Audit retention (days)</label><input defaultValue="365" className="input mt-1.5" /></div>
                    </div>
                    <button onClick={() => push({ kind: 'success', title: 'Security settings saved' })} className="btn-primary">Save</button>
                  </CardBody>
                </Card>
              )}

              {active === 'env' && (
                <Card>
                  <CardHeader title="Environment Health" subtitle="Backend service status" icon={<Server className="h-4 w-4" />} />
                  <CardBody className="space-y-2.5">
                    {[
                      { name: 'API Gateway', status: 'healthy' },
                      { name: 'Postgres + pgvector', status: 'healthy' },
                      { name: 'Ingestion workers', status: 'healthy' },
                      { name: 'Embedding service', status: 'degraded' },
                      { name: 'LLM proxy', status: 'healthy' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="text-sm">{s.name}</span>
                        <Badge tone={s.status === 'healthy' ? 'success' : 'warning'}>{s.status}</Badge>
                      </div>
                    ))}
                    <p className="rounded-lg border border-border bg-surface-2 p-2.5 text-[11px] text-muted flex items-center gap-1.5"><Globe className="h-3 w-3" /> Region: us-east-1 · Version: 0.9.0-demo</p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </PageContainer>
      </PageBody>
    </div>
  );
}
