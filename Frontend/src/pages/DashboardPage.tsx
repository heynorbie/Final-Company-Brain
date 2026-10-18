import { useState } from 'react';
import {
  Users, Database, FileText, MessageSquare, TrendingUp, Clock,
  ArrowUpRight, Bot, Download, Plus, FileStack, ShieldAlert, Sparkles,
} from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge, StatusDot } from '@/components/ui';
import { BarsChart, DonutChart, RadialGauge, TrendLine } from '@/components/charts/Charts';
import { dashboardStats, usageTrend, departmentCoverage, sourceHealth, agents } from '@/data/mockData';
import { csvMetrics, datasetCards } from '@/data/csvData';
import { cn, formatNumber } from '@/lib/utils';

const dateRanges = ['24h', '7d', '30d', '90d'];

const statCards = [
  { key: 'employees', label: 'Employees Indexed', value: csvMetrics.employeesIndexed, icon: Users, delta: '+3,000', trend: 'up', tone: 'primary' as const },
  { key: 'sources', label: 'Knowledge Sources', value: dashboardStats.sources, icon: Database, delta: '+1', trend: 'up', tone: 'accent' as const },
  { key: 'documents', label: 'Documents Processed', value: dashboardStats.documents, icon: FileText, delta: '+27', trend: 'up', tone: 'info' as const },
  { key: 'questions', label: 'AI Questions Answered', value: dashboardStats.questions, icon: MessageSquare, delta: '+12%', trend: 'up', tone: 'primary' as const },
];

const toneClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
};

export function DashboardPage() {
  const [range, setRange] = useState('30d');

  const coverageData = departmentCoverage.slice(0, 6).map((d) => ({ name: d.department, coverage: d.coverage }));
  const donutData = [
    { name: 'Indexed', value: 168 },
    { name: 'Processing', value: 12 },
    { name: 'Failed', value: 4 },
    { name: 'Queued', value: 6 },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Real-time view of knowledge coverage, AI performance, and platform health."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={
          <>
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
              {dateRanges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition',
                    range === r ? 'bg-primary text-white' : 'text-muted hover:text-text')}
                >
                  {r}
                </button>
              ))}
            </div>
            <button className="btn-outline"><Download className="h-4 w-4" /> Export</button>
            <button className="btn-primary"><Plus className="h-4 w-4" /> New Agent</button>
          </>
        }
      />

      <PageBody>
        <PageContainer>
          {/* Hero stat cards */}
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {statCards.map((s) => {
              const Icon = s.icon;
              return (
                <Card
                  key={s.key}
                  className="group relative overflow-hidden transition-shadow duration-300 hover:shadow-glow"
                >
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/[0.04] blur-2xl transition-opacity duration-300 group-hover:bg-primary/[0.08]" />
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between">
                      <div className={cn('rounded-xl p-2.5', toneClasses[s.tone])}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={cn('flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        s.trend === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error')}>
                        {s.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : null}
                        {s.delta}
                      </span>
                    </div>
                    <p className="mt-4 text-[28px] font-semibold leading-none tracking-tight text-text">{formatNumber(s.value)}</p>
                    <p className="mt-2 text-[12.5px] text-muted">{s.label}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          {/* Imported dataset overview */}
          <div className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text">Connected datasets</p>
                <p className="mt-0.5 text-xs text-muted">All imported CSV sources are ready for analysis</p>
              </div>
              <Badge tone="success">{formatNumber(datasetCards.reduce((total, dataset) => total + dataset.rows, 0))} records</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {datasetCards.map((dataset) => (
                <Card key={dataset.key} className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={cn('rounded-lg p-2', toneClasses[dataset.tone])}>
                        <Database className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-text">{formatNumber(dataset.rows)}</span>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-text">{dataset.label}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted">{dataset.detail}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              <span><b className="text-text">{formatNumber(csvMetrics.activeEmployees)}</b> active employees</span>
              <span><b className="text-text">{csvMetrics.averageEngagement}%</b> engagement index</span>
              <span><b className="text-text">{formatNumber(csvMetrics.candidates)}</b> candidates</span>
              <span><b className="text-text">{formatNumber(csvMetrics.completedTraining)}</b> completed training records</span>
            </div>
          </div>

          {/* Gauges + donut */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <Card className="transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Retrieval Rate" subtitle="Cited answers vs. misses" icon={<TrendingUp className="h-4 w-4" />} />
              <CardBody>
                <div className="relative">
                  <RadialGauge value={dashboardStats.retrievalRate} label="Retrieval" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-semibold text-text">{dashboardStats.retrievalRate}%</p>
                    <p className="text-xs text-muted">last {range}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[{ l: 'Cited', v: '91%' }, { l: 'Partial', v: '6%' }, { l: 'Miss', v: '3%' }].map((x) => (
                    <div key={x.l} className="rounded-lg bg-surface-2 p-2">
                      <p className="text-sm font-semibold text-text">{x.v}</p>
                      <p className="text-[11px] text-muted">{x.l}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Knowledge Freshness" subtitle="Docs younger than 30 days" icon={<Clock className="h-4 w-4" />} />
              <CardBody>
                <div className="relative">
                  <RadialGauge value={dashboardStats.freshness} color="#22d3ee" label="Freshness" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-3xl font-semibold text-text">{dashboardStats.freshness}%</p>
                    <p className="text-xs text-muted">fresh</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
                  <span>Oldest <b className="text-text">38d</b></span>
                  <span>Avg <b className="text-text">11d</b></span>
                  <span>Stale <b className="text-text">24</b></span>
                </div>
              </CardBody>
            </Card>

            <Card className="transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Document Status" subtitle="Indexing pipeline" icon={<FileStack className="h-4 w-4" />} />
              <CardBody>
                <DonutChart data={donutData} height={170} />
              </CardBody>
            </Card>
          </div>

          {/* Trends + agent activity */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2 transition-shadow duration-300 hover:shadow-glow">
              <CardHeader
                title="AI Usage Trends"
                subtitle={`Daily questions and retrievals · ${range}`}
                icon={<TrendingUp className="h-4 w-4" />}
                action={<Badge tone="primary">+18% WoW</Badge>}
              />
              <CardBody>
                <TrendLine
                  data={usageTrend}
                  xKey="day"
                  lines={[
                    { key: 'questions', color: '#3b82f6', name: 'Questions' },
                    { key: 'retrievals', color: '#22d3ee', name: 'Retrievals' },
                    { key: 'unanswered', color: '#fbbf24', name: 'Unanswered' },
                  ]}
                  height={260}
                />
              </CardBody>
            </Card>

            <Card className="transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Agent Activity" subtitle="Latest runs" icon={<Bot className="h-4 w-4" />} />
              <CardBody className="space-y-2.5">
                {agents.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{a.name}</p>
                      <p className="text-[11px] text-muted">{formatNumber(a.runs)} runs · {a.successRate}% success</p>
                    </div>
                    <StatusDot tone={a.status === 'active' ? 'success' : a.status === 'draft' ? 'warning' : 'neutral'} />
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Coverage + source health */}
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2 transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Department Coverage" subtitle="Indexed topics vs. expected" icon={<Database className="h-4 w-4" />} />
              <CardBody>
                <BarsChart data={coverageData} xKey="name" yKey="coverage" height={240} />
              </CardBody>
            </Card>

            <Card className="transition-shadow duration-300 hover:shadow-glow">
              <CardHeader title="Source Health" subtitle="Ingestion status" icon={<ShieldAlert className="h-4 w-4" />} />
              <CardBody className="space-y-2.5">
                {sourceHealth.map((s) => (
                  <div key={s.source} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
                    <div className="flex items-center gap-2.5">
                      <StatusDot tone={s.status === 'healthy' ? 'success' : s.status === 'degraded' ? 'warning' : 'error'} />
                      <span className="text-sm font-medium">{s.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={cn('h-full rounded-full transition-all',
                            s.status === 'healthy' ? 'bg-success' : s.status === 'degraded' ? 'bg-warning' : 'bg-error')}
                          style={{ width: `${s.health}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted w-8 text-right">{s.health}%</span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-faint">
            <Sparkles className="h-3 w-3" /> Insights generated from demo data — connect sources for live metrics
          </p>
        </PageContainer>
      </PageBody>
    </div>
  );
}
