import { cn } from '@/lib/utils';

export function Logo({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="cb-logo-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgb(var(--primary-soft))" />
          <stop offset="1" stopColor="rgb(var(--accent-soft))" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#cb-logo-g)" opacity="0.12" />
      <rect x="2.5" y="2.5" width="43" height="43" rx="11.5" stroke="url(#cb-logo-g)" strokeOpacity="0.5" />
      {/* brain hemisphere nodes */}
      <g stroke="url(#cb-logo-g)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M16 14c-4 2-6 6-6 10s2 8 6 10" />
        <path d="M32 14c4 2 6 6 6 10s-2 8-6 10" />
        <path d="M24 12v24" />
        <path d="M14 22h6M28 22h6M16 30h5M27 30h5" />
      </g>
      <g fill="url(#cb-logo-g)">
        <circle cx="16" cy="14" r="2.2" />
        <circle cx="32" cy="14" r="2.2" />
        <circle cx="24" cy="12" r="2.4" />
        <circle cx="10" cy="24" r="2.2" />
        <circle cx="38" cy="24" r="2.2" />
        <circle cx="16" cy="34" r="2.2" />
        <circle cx="32" cy="34" r="2.2" />
        <circle cx="24" cy="36" r="2.4" />
        <circle cx="20" cy="22" r="1.6" />
        <circle cx="28" cy="22" r="1.6" />
        <circle cx="21" cy="30" r="1.6" />
        <circle cx="27" cy="30" r="1.6" />
      </g>
    </svg>
  );
}

export function LogoMark({ name = 'Company Brain AI', collapsed }: { name?: string; collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Logo size={30} className="drop-shadow-[0_0_10px_rgb(var(--primary)/0.18)]" />
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-tight text-text leading-none">Company Brain</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-accent font-medium leading-none mt-1">AI Platform</p>
        </div>
      )}
    </div>
  );
}
