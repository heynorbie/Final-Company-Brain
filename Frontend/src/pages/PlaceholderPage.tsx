import { type LucideIcon } from 'lucide-react';
import { PageHeader, PageBody, PageContainer } from '@/components/layout/PageHeader';
import { Card, Badge, EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status?: string;
  actionLabel?: string;
}

export function PlaceholderPage({ title, description, icon: Icon, status = 'Coming in Phase 2', actionLabel }: PlaceholderPageProps) {
  const { push } = useToast();
  return (
    <div>
      <PageHeader title={title} description={description} badge={{ label: status, tone: 'warning' }} />
      <PageBody>
        <PageContainer>
          <Card>
            <EmptyState
              icon={<Icon className="h-7 w-7" />}
              title={`${title} is scaffolded`}
              description={`This screen is part of the navigation. The full ${title.toLowerCase()} experience ships with backend wiring in ${status.toLowerCase()}.`}
              action={actionLabel ? (
                <button onClick={() => push({ kind: 'info', title: 'Not available in demo', description: 'Backend wiring required.' })} className="btn-primary mt-2">{actionLabel}</button>
              ) : undefined}
            />
            <div className="border-t border-border p-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="primary">Phase 1 · UI shell</Badge>
                <Badge tone="warning">Phase 2 · Backend</Badge>
                <Badge tone="neutral">Phase 3 · Full features</Badge>
              </div>
            </div>
          </Card>
        </PageContainer>
      </PageBody>
    </div>
  );
}
