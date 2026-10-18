import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Activity, MessageSquare, Bot, PlayCircle, Library,
  FolderTree, FileText, Users, Building2, FolderKanban, ShieldCheck,
  Search, BarChart3, AlertTriangle, FileBarChart, Plug, UserCog,
  Lock, ScrollText, Settings, ChevronLeft,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoMark } from '@/components/ui/Logo';

interface NavItem { to: string; label: string; icon: LucideIcon; badge?: string }
interface NavGroup { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Executive Dashboard', icon: LayoutDashboard },
      { to: '/activity', label: 'Activity Center', icon: Activity },
    ],
  },
  {
    label: 'AI Workspace',
    items: [
      { to: '/chat', label: 'AI Chat', icon: MessageSquare },
      { to: '/agents', label: 'Agent Studio', icon: Bot },
      { to: '/agent-runs', label: 'Agent Runs', icon: PlayCircle },
      { to: '/prompts', label: 'Prompt Library', icon: Library },
    ],
  },
  {
    label: 'Company Knowledge',
    items: [
      { to: '/knowledge', label: 'Knowledge Explorer', icon: FolderTree },
      { to: '/documents', label: 'Document Library', icon: FileText },
      { to: '/employees', label: 'Employee Directory', icon: Users },
      { to: '/departments', label: 'Departments & Teams', icon: Building2 },
      { to: '/projects', label: 'Projects & Wiki', icon: FolderKanban },
      { to: '/policies', label: 'Company Policies', icon: ShieldCheck },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/search', label: 'Semantic Search', icon: Search },
      { to: '/insights', label: 'Insights & Analytics', icon: BarChart3 },
      { to: '/gaps', label: 'Knowledge Gaps', icon: AlertTriangle },
      { to: '/reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/integrations', label: 'Data Sources', icon: Plug },
      { to: '/users', label: 'Users & Roles', icon: UserCog },
      { to: '/access', label: 'Access Control', icon: Lock },
      { to: '/audit', label: 'Audit Logs', icon: ScrollText },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-[256px]',
      )}
    >
      <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed && 'justify-center px-0')}>
        {collapsed ? <LogoMark collapsed /> : <LogoMark />}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            {!collapsed && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{g.label}</p>
            )}
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    className={cn(
                      'group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-200',
                      collapsed && 'justify-center px-0',
                      active
                        ? 'bg-primary/10 text-primary shadow-glow scale-[1.03]'
                        : 'text-muted hover:bg-primary/8 hover:text-text hover:scale-[1.06] hover:shadow-glow',
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />}
                    <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110', active && 'text-primary')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto badge bg-accent/10 text-accent">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={onToggle}
          className={cn('btn-ghost w-full', collapsed && 'justify-center')}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
