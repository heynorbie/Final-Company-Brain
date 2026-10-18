import { useMemo, useState } from 'react';
import { Building2, Users, FolderKanban, FileText, Search } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge } from '@/components/ui';
import { employees, documents, type Dept, DepartmentIcon } from '@/data/mockData';
import { cn } from '@/lib/utils';

export function DepartmentsPage() {
  const [query, setQuery] = useState('');
  const depts = useMemo(() => {
    const map = new Map<Dept, { employees: number; docs: number }>();
    employees.forEach((e) => {
      const cur = map.get(e.department) || { employees: 0, docs: 0 };
      cur.employees += 1;
      map.set(e.department, cur);
    });
    documents.forEach((d) => {
      const cur = map.get(d.department) || { employees: 0, docs: 0 };
      cur.docs += 1;
      map.set(d.department, cur);
    });
    return Array.from(map.entries()).map(([dept, v]) => ({ dept, ...v }));
  }, []);

  const filtered = depts.filter((d) => d.dept.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader title="Departments & Teams" description="Organizational structure with team-level knowledge and coverage stats." badge={{ label: 'Demo Data', tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search departments..." className="input pl-9" />
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => {
              const Icon = DepartmentIcon[d.dept];
              return (
                <Card key={d.dept} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{d.dept}</p>
                      <Badge tone="neutral" className="mt-0.5">Department</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-surface-2 p-2.5">
                      <Users className="mx-auto h-3.5 w-3.5 text-accent" />
                      <p className="mt-1 text-sm font-semibold text-text">{d.employees}</p>
                      <p className="text-[10px] text-muted">employees</p>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-2.5">
                      <FileText className="mx-auto h-3.5 w-3.5 text-primary" />
                      <p className="mt-1 text-sm font-semibold text-text">{d.docs}</p>
                      <p className="text-[10px] text-muted">documents</p>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-2.5">
                      <FolderKanban className="mx-auto h-3.5 w-3.5 text-success" />
                      <p className="mt-1 text-sm font-semibold text-text">{Math.ceil(d.employees / 4)}</p>
                      <p className="text-[10px] text-muted">teams</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[11px] text-muted mb-1.5">Team leads</p>
                    <div className="flex -space-x-2">
                      {employees.filter((e) => e.department === d.dept).slice(0, 4).map((e) => (
                        <div key={e.id} className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-surface" style={{ background: `hsl(${e.avatarHue} 70% 45%)` }}>
                          {e.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      </PageBody>
    </div>
  );
}
