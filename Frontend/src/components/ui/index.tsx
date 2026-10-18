import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border p-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="mt-0.5 text-primary">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-text truncate">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted truncate">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-3 text-muted',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span className={cn('badge', badgeTones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="rounded-2xl bg-surface-3 p-4 text-faint">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        {description && <p className="mt-1 text-xs text-muted max-w-xs mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusDot({ tone = 'success', pulse }: { tone?: 'success' | 'warning' | 'error' | 'neutral'; pulse?: boolean }) {
  const color = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error', neutral: 'bg-faint' }[tone];
  return <span className={cn('inline-block h-2 w-2 rounded-full', color, pulse && 'animate-pulse-soft')} />;
}
