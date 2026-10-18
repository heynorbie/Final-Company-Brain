import { useState, useMemo } from 'react';
import { Library, Search, Plus, Copy, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface Prompt { id: string; title: string; category: string; body: string; uses: number; tags: string[] }

const prompts: Prompt[] = [
  { id: 'P-01', title: 'Summarize a policy', category: 'Policy', body: 'Summarize the {policy_name} in 5 bullet points, noting who it applies to and the key compliance requirements.', uses: 142, tags: ['summary', 'policy'] },
  { id: 'P-02', title: 'Find a project owner', category: 'Projects', body: 'Who owns the {project} project? List their team, related documents, and recent decisions.', uses: 98, tags: ['project', 'owner'] },
  { id: 'P-03', title: 'Explain an ADR', category: 'Engineering', body: 'Explain ADR-{number}: what problem it solves, the alternatives considered, and the tradeoffs.', uses: 76, tags: ['adr', 'engineering'] },
  { id: 'P-04', title: 'Onboarding checklist', category: 'HR', body: 'Generate a day-1 to day-14 onboarding checklist for a new {role}, referencing our official onboarding playbook.', uses: 211, tags: ['hr', 'onboarding'] },
  { id: 'P-05', title: 'Security incident triage', category: 'Security', body: 'Given the incident description: {description}, classify severity per our incident response procedure and list next steps.', uses: 44, tags: ['security', 'incident'] },
  { id: 'P-06', title: 'API authentication guide', category: 'Engineering', body: 'How do I authenticate to the {api_name} API? Include code examples and token lifecycle.', uses: 187, tags: ['api', 'auth'] },
  { id: 'P-07', title: 'Department expertise search', category: 'People', body: 'Find employees in {department} with skills in {skill}. Show their projects and availability.', uses: 63, tags: ['people', 'search'] },
  { id: 'P-08', title: 'Knowledge gap report', category: 'Intelligence', body: 'Identify knowledge gaps in the {department} department based on recent unanswered questions.', uses: 29, tags: ['gaps', 'analysis'] },
];

const categories = ['All', 'Policy', 'Projects', 'Engineering', 'HR', 'Security', 'People', 'Intelligence'];

export function PromptsPage() {
  const { push } = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => prompts.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    const q = query.toLowerCase();
    return !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q));
  }), [query, category]);

  return (
    <div>
      <PageHeader
        title="Prompt Library"
        description="Reusable prompt templates for common questions across the company."
        badge={{ label: 'Demo Data', tone: 'warning' }}
        actions={<button onClick={() => setCreateOpen(true)} className="btn-primary"><Plus className="h-4 w-4" /> New Prompt</button>}
      />
      <PageBody>
        <PageContainer>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompts..." className="input pl-9" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 border-t border-border p-3">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={cn('rounded-full px-3 py-1 text-xs font-medium transition', category === c ? 'bg-primary text-white' : 'bg-surface-2 text-muted hover:text-text')}>{c}</button>
              ))}
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card><EmptyState icon={<Library className="h-6 w-6" />} title="No prompts found" description="Try a different search or category." /></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Card key={p.id} className="group p-4 cursor-pointer transition hover:border-primary/40" onClick={() => setSelected(p)}>
                  <div className="flex items-start justify-between">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div>
                    <Badge tone="accent">{p.uses} uses</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text">{p.title}</p>
                  <p className="mt-1 text-xs text-muted line-clamp-2">{p.body}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                    <Badge tone="neutral">{p.category}</Badge>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(p.body); push({ kind: 'success', title: 'Prompt copied' }); }} className="btn-ghost p-1.5"><Copy className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); push({ kind: 'success', title: 'Prompt deleted' }); }} className="btn-ghost p-1.5 hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageContainer>
      </PageBody>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="lg"
        footer={<><button onClick={() => setSelected(null)} className="btn-ghost">Close</button><button onClick={() => { navigator.clipboard?.writeText(selected?.body || ''); push({ kind: 'success', title: 'Copied' }); }} className="btn-primary"><Copy className="h-4 w-4" /> Copy prompt</button></>}
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge tone="primary">{selected.category}</Badge>
              {selected.tags.map((t) => <Badge key={t} tone="neutral">#{t}</Badge>)}
            </div>
            <div className="card-2 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Prompt body</p>
              <p className="text-sm text-text font-mono whitespace-pre-wrap">{selected.body}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <MessageSquare className="h-3.5 w-3.5" /> Used {selected.uses} times
            </div>
          </div>
        )}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Prompt Template" size="lg"
        footer={<><button onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button><button onClick={() => { push({ kind: 'success', title: 'Prompt created' }); setCreateOpen(false); }} className="btn-primary"><Plus className="h-4 w-4" /> Create</button></>}
      >
        <div className="space-y-3">
          <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Title</label><input placeholder="e.g. Draft a release note" className="input mt-1.5" /></div>
          <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Category</label><select className="input mt-1.5">{categories.slice(1).map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-xs font-semibold uppercase tracking-wider text-muted">Prompt body</label><textarea rows={4} placeholder="Use {placeholders} for variables..." className="input mt-1.5" /></div>
        </div>
      </Modal>
    </div>
  );
}
