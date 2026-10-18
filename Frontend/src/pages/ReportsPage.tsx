import { FileBarChart, Download, Calendar, TrendingUp, Bot, FileText, Users } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody, Badge } from '@/components/ui';
import { TrendLine, BarsChart } from '@/components/charts/Charts';
import { usageTrend, departmentCoverage, agents } from '@/data/mockData';
import { useState } from 'react';

const reportTypes = [
  { name: 'AI Usage Report', icon: Bot, period: 'Last 30 days', desc: 'Questions, retrievals, unanswered, and feedback trends.' },
  { name: 'Knowledge Coverage Report', icon: FileText, period: 'Last 30 days', desc: 'Department coverage, gaps, and stale documents.' },
  { name: 'User Activity Report', icon: Users, period: 'Last 30 days', desc: 'Active users, role breakdown, and adoption.' },
  { name: 'Agent Performance Report', icon: TrendingUp, period: 'Last 30 days', desc: 'Per-agent success rates, runs, and latency.' },
];

export function ReportsPage() {
  const [range, setRange] = useState('30d');
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Compile and export platform analytics for stakeholders."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button className="btn-outline"><Download className="h-4 w-4" /> Export all</button>}
      />
      <PageBody>
        <PageContainer>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
            {reportTypes.map((r) => {
              const Icon = r.icon;
              return (
                <Card key={r.name} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                    <Badge tone="neutral"><Calendar className="h-3 w-3" /> {r.period}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text">{r.name}</p>
                  <p className="mt-1 text-[11px] text-muted">{r.desc}</p>
                  <button className="btn-outline mt-3 w-full text-xs"><Download className="h-3.5 w-3.5" /> Export</button>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Usage trend" subtitle={`Range: ${range}`} />
              <CardBody>
                <TrendLine data={usageTrend} xKey="day" lines={[
                  { key: 'questions', color: '#3b82f6', name: 'Questions' },
                  { key: 'retrievals', color: '#22d3ee', name: 'Retrievals' },
                ]} height={240} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Agent runs by name" subtitle="Top performers" />
              <CardBody>
                <BarsChart data={agents.filter((a) => a.runs > 0).map((a) => ({ name: a.name.split(' ')[0], runs: a.runs }))} xKey="name" yKey="runs" height={240} />
              </CardBody>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader title="Department Coverage" subtitle="Cross-department view" />
            <CardBody>
              <BarsChart data={departmentCoverage} xKey="department" yKey="documents" height={220} />
            </CardBody>
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
