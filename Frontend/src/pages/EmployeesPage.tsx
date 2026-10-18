import { useMemo, useState } from 'react';
import { Search, Users, Mail, MapPin, Briefcase, Award, FolderKanban, X, Building2 } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { employees, type Employee, type Dept, DepartmentIcon } from '@/data/mockData';
import { cn } from '@/lib/utils';

const departments: (Dept | 'all')[] = ['all', 'Engineering', 'Product', 'Design', 'Security', 'IT', 'HR', 'Sales', 'Marketing', 'Operations', 'Finance'];

export function EmployeesPage() {
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState<Dept | 'all'>('all');
  const [skill, setSkill] = useState<string>('');
  const [selected, setSelected] = useState<Employee | null>(null);

  const allSkills = useMemo(() => Array.from(new Set(employees.flatMap((e) => e.skills))).sort(), []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return employees.filter((e) => {
      if (dept !== 'all' && e.department !== dept) return false;
      if (skill && !e.skills.includes(skill)) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || e.title.toLowerCase().includes(q) || e.skills.some((s) => s.toLowerCase().includes(q));
    });
  }, [query, dept, skill]);

  const deptCounts = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => map.set(e.department, (map.get(e.department) || 0) + 1));
    return map;
  }, []);

  return (
    <div>
      <PageHeader
        title="Employee Directory"
        description="Searchable index of employees, teams, and expertise across the company."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<Badge tone="primary"><Users className="h-3 w-3" /> {employees.length} indexed</Badge>}
      />
      <PageBody>
        <PageContainer>
          {/* Filters */}
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, title, or skill..."
                  className="input pl-9"
                />
              </div>
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className="input lg:w-48">
                <option value="">All skills</option>
                {allSkills.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-border p-3">
              {departments.map((d) => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={cn('rounded-full px-3 py-1 text-xs font-medium transition',
                    dept === d ? 'bg-primary text-white' : 'bg-surface-2 text-muted hover:text-text')}
                >
                  {d === 'all' ? 'All' : `${d} (${deptCounts.get(d) || 0})`}
                </button>
              ))}
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={<Search className="h-6 w-6" />} title="No employees found" description="Try adjusting your filters or search." /></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((e) => {
                const Icon = DepartmentIcon[e.department];
                return (
                  <button key={e.id} onClick={() => setSelected(e)} className="card group p-4 text-left transition hover:border-primary/40 hover:shadow-glow">
                    <div className="flex items-start gap-3">
                      <div
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                        style={{ background: `hsl(${e.avatarHue} 70% 45%)` }}
                      >
                        {e.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text">{e.name}</p>
                        <p className="truncate text-xs text-muted">{e.title}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-faint">
                          <Icon className="h-3 w-3" /> {e.department}
                        </div>
                      </div>
                      <span className={cn('h-2 w-2 rounded-full', e.status === 'active' ? 'bg-success' : 'bg-faint')} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {e.skills.slice(0, 3).map((s) => <Badge key={s} tone="primary">{s}</Badge>)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Employee Profile" size="lg">
        {selected && (
          <div>
            <div className="flex items-start gap-4">
              <div
                className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-xl font-semibold text-white"
                style={{ background: `hsl(${selected.avatarHue} 70% 45%)` }}
              >
                {selected.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text">{selected.name}</h3>
                <p className="text-sm text-muted">{selected.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="primary"><Building2 className="h-3 w-3" /> {selected.department}</Badge>
                  <Badge tone={selected.status === 'active' ? 'success' : 'neutral'}>{selected.status}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Employee ID', value: selected.id, icon: Users },
                { label: 'Email', value: selected.email, icon: Mail },
                { label: 'Location', value: selected.location, icon: MapPin },
                { label: 'Experience', value: `${selected.experience} years`, icon: Briefcase },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="card-2 p-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-faint">
                      <Icon className="h-3 w-3" /> {row.label}
                    </p>
                    <p className="mt-1 text-sm text-text">{row.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><Award className="h-3.5 w-3.5" /> Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.skills.map((s) => <Badge key={s} tone="accent">{s}</Badge>)}
              </div>
            </div>

            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><FolderKanban className="h-3.5 w-3.5" /> Projects</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.projects.map((p) => <Badge key={p} tone="info">{p}</Badge>)}
              </div>
            </div>

            <p className="mt-5 rounded-lg border border-warning/20 bg-warning/5 p-2.5 text-[11px] text-muted">
              Contact information is restricted by role-based access. Sensitive fields are hidden for unauthorized users.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
