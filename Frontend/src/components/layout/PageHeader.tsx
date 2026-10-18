import { type ReactNode } from 'react';
import { Badge } from '@/components/ui';

export function PageHeader({
  title, description, actions, badge,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: { label: string; tone?: 'neutral' | 'primary' | 'accent' | 'warning' };
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border bg-surface/40 px-6 py-5 backdrop-blur-sm">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
          {badge && <Badge tone={badge.tone || 'neutral'}>{badge.label}</Badge>}
        </div>
        {description && <p className="mt-1 text-sm text-muted max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className || ''}`}>{children}</div>;
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1400px]">{children}</div>;
}
