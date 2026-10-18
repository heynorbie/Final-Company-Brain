import { AlertTriangle, ArrowUpRight, Plus, Filter } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { knowledgeGaps, departmentCoverage } from '@/data/mockData';
import { BarsChart } from '@/components/charts/Charts';

export function KnowledgeGapsPage() {
  const { push } = useToast();

  return (
    <div>
      <PageHeader
        title="Knowledge Gaps"
        description="Topics where retrieval frequently misses, with severity and suggested remediation."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button className="btn-outline"><Filter className="h-4 w-4" /> Filter</button>}
      />
      <PageBody>
        <PageContainer>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold">Detected Gaps</h3>
                <p className="text-xs text-muted mt-0.5">Inferred from unanswered questions and missing source coverage</p>
              </div>
              <div className="divide-y divide-border">
                {knowledgeGaps.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-3">
                      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${g.severity === 'high' ? 'bg-error/10 text-error' : g.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-surface-3 text-faint'}`}>
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text">{g.area}</p>
                        <p className="text-[11px] text-muted">{g.missingDocs} missing docs · raised {g.lastRaised}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={g.severity === 'high' ? 'error' : g.severity === 'medium' ? 'warning' : 'neutral'}>{g.severity}</Badge>
                      <button onClick={() => push({ kind: 'info', title: 'Remediation queued', description: g.area })} className="btn-outline text-xs"><Plus className="h-3.5 w-3.5" /> Add doc</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="border-b border-border p-4">
                <h3 className="text-sm font-semibold">Coverage by Department</h3>
                <p className="text-xs text-muted mt-0.5">Lower bars indicate higher gap risk</p>
              </div>
              <div className="p-4">
                <BarsChart data={departmentCoverage} xKey="department" yKey="coverage" height={280} />
              </div>
            </Card>
          </div>

          <Card className="mt-4 p-4 flex items-center gap-3">
            <ArrowUpRight className="h-4 w-4 text-success" />
            <p className="text-sm text-muted">Closing the top 3 gaps would lift retrieval success by an estimated <span className="font-semibold text-text">+4.2%</span>.</p>
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
