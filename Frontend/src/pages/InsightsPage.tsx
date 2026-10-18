import { useState } from 'react';
import {
  BarChart3, TrendingUp, AlertTriangle, FileText, MessageSquare,
  Download, ThumbsUp, ThumbsDown, Bot, Filter, Users,
} from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { BarsChart, TrendLine, DonutChart, TrendArea } from '@/components/charts/Charts';
import {
  usageTrend, topTopics, unansweredTopics, departmentCoverage,
  knowledgeGaps, sourceHealth, agents,
} from '@/data/mockData';
import { cn, formatNumber } from '@/lib/utils';

const ranges = ['7d', '30d', '90d', '12m'];

export function InsightsPage() {
  const [range, setRange] = useState('30d');

  const feedbackData = [
    { name: 'Helpful', value: 74 },
    { name: 'Neutral', value: 18 },
    { name: 'Not helpful', value: 8 },
  ];

  const agentPerf = agents.filter((a) => a.runs > 0).map((a) => ({ name: a.name.split(' ')[0], rate: a.successRate, runs: a.runs }));

  return (
    <div>
      <PageHeader
        title="Insights & Analytics"
        description="AI usage, retrieval quality, knowledge gaps, and feedback trends across the platform."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={
          <>
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
              {ranges.map((r) => (
                <button key={r} onClick={() => setRange(r)} className={cn('rounded-md px-2.5 py-1 text-xs font-medium', range === r ? 'bg-primary text-white' : 'text-muted')}>{r}</button>
              ))}
            </div>
            <button className="btn-outline"><Filter className="h-4 w-4" /> Filters</button>
            <button className="btn-outline"><Download className="h-4 w-4" /> Export</button>
          </>
        }
      />
      <PageBody>
        <PageContainer>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-4">
            {[
              { label: 'Total questions', value: '8,420', delta: '+12%', icon: MessageSquare, tone: 'primary' },
              { label: 'Retrieval success', value: '91%', delta: '+2.4%', icon: TrendingUp, tone: 'success' },
              { label: 'Unanswered rate', value: '3.1%', delta: '-0.6%', icon: AlertTriangle, tone: 'warning' },
              { label: 'Positive feedback', value: '74%', delta: '+5%', icon: ThumbsUp, tone: 'accent' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={cn('rounded-lg p-2',
                      s.tone === 'primary' && 'bg-primary/10 text-primary',
                      s.tone === 'success' && 'bg-success/10 text-success',
                      s.tone === 'warning' && 'bg-warning/10 text-warning',
                      s.tone === 'accent' && 'bg-accent/10 text-accent',
                    )}><Icon className="h-4 w-4" /></div>
                    <span className="text-xs font-medium text-success">{s.delta}</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-text">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Questions vs Unanswered" subtitle={`Daily volume · ${range}`} icon={<BarChart3 className="h-4 w-4" />} />
              <CardBody>
                <TrendLine data={usageTrend} xKey="day" lines={[
                  { key: 'questions', color: '#3b82f6', name: 'Questions' },
                  { key: 'unanswered', color: '#fbbf24', name: 'Unanswered' },
                ]} height={240} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Feedback Trends" subtitle="User sentiment on answers" icon={<ThumbsUp className="h-4 w-4" />} />
              <CardBody>
                <DonutChart data={feedbackData} height={180} />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-success"><ThumbsUp className="h-3 w-3" /> 74% helpful</span>
                  <span className="flex items-center gap-1 text-error"><ThumbsDown className="h-3 w-3" /> 8% negative</span>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Most Searched Topics" subtitle="Top queries this period" icon={<TrendingUp className="h-4 w-4" />} />
              <CardBody>
                <BarsChart data={topTopics} xKey="topic" yKey="count" horizontal height={260} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Common Unanswered Questions" subtitle="Candidates for knowledge gaps" icon={<AlertTriangle className="h-4 w-4" />} />
              <CardBody>
                <div className="space-y-2">
                  {unansweredTopics.map((t, i) => (
                    <div key={t.topic} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-6 w-6 place-items-center rounded bg-warning/10 text-[11px] font-semibold text-warning">{i + 1}</span>
                        <span className="truncate text-sm text-text">{t.topic}</span>
                      </div>
                      <Badge tone="warning">{t.count}×</Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Agent Performance" subtitle="Success rate by agent" icon={<Bot className="h-4 w-4" />} />
              <CardBody>
                <BarsChart data={agentPerf} xKey="name" yKey="rate" color="#22d3ee" height={220} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Usage by Department" subtitle="Questions per dept" icon={<Users className="h-4 w-4" />} />
              <CardBody>
                <TrendArea data={departmentCoverage.slice(0, 6).map((d) => ({ name: d.department, v: d.documents * 12 + 40 }))} xKey="name" yKey="v" color="#3b82f6" height={220} />
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Knowledge Gaps" subtitle="Areas where retrieval frequently misses" icon={<AlertTriangle className="h-4 w-4" />} />
              <CardBody className="space-y-2">
                {knowledgeGaps.map((g) => (
                  <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-text">{g.area}</p>
                      <p className="text-[11px] text-muted">{g.missingDocs} missing · raised {g.lastRaised}</p>
                    </div>
                    <Badge tone={g.severity === 'high' ? 'error' : g.severity === 'medium' ? 'warning' : 'neutral'}>{g.severity}</Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Source Ingestion Errors" subtitle="Pipeline health by source" icon={<FileText className="h-4 w-4" />} />
              <CardBody className="space-y-2.5">
                {sourceHealth.map((s) => (
                  <div key={s.source} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">{s.source}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-3">
                        <div className={cn('h-full rounded-full', s.status === 'healthy' ? 'bg-success' : s.status === 'degraded' ? 'bg-warning' : 'bg-error')} style={{ width: `${s.health}%` }} />
                      </div>
                      <span className="text-xs text-muted w-10 text-right">{s.health}%</span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </PageContainer>
      </PageBody>
    </div>
  );
}
