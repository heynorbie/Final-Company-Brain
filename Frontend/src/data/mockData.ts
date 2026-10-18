import {
  Briefcase, Cpu, Database, Shield, Users, FolderKanban, FileText, Server,
  type LucideIcon,
} from 'lucide-react';

export type Dept = 'Engineering' | 'Product' | 'Design' | 'Sales' | 'Marketing' | 'Operations' | 'Security' | 'IT' | 'HR' | 'Finance';

export const DepartmentIcon: Record<Dept, LucideIcon> = {
  Engineering: Cpu,
  Product: Briefcase,
  Design: FileText,
  Sales: Users,
  Marketing: FileText,
  Operations: Server,
  Security: Shield,
  IT: Database,
  HR: Users,
  Finance: Briefcase,
};

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: Dept;
  title: string;
  skills: string[];
  experience: number;
  projects: string[];
  location: string;
  status: 'active' | 'away';
  avatarHue: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'md' | 'url' | 'api';
  category: string;
  department: Dept;
  owner: string;
  sizeKB: number;
  status: 'indexed' | 'processing' | 'failed' | 'queued';
  lastIndexed: string;
  chunks: number;
  freshness: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  sources: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  runs: number;
  successRate: number;
  updatedAt: string;
  template?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceCitation[];
  createdAt: string;
  status?: 'streaming' | 'complete' | 'failed';
  feedback?: 'up' | 'down' | null;
}

export interface SourceCitation {
  id: string;
  document: string;
  section: string;
  excerpt: string;
  relevance: number;
  department: Dept;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: string;
  agentId: string;
}

const firstNames = ['Ava', 'Liam', 'Mia', 'Noah', 'Zoe', 'Kai', 'Iris', 'Owen', 'Eli', 'Nora', 'Leo', 'Maya', 'Ada', 'Reza', 'Jin', 'Sara', 'Tom', 'Lina', 'Omar', 'Priya', 'Jonas', 'Yuki', 'Dmitri', 'Clara', 'Hugo'];
const lastNames = ['Chen', 'Patel', 'Rivera', 'Nguyen', 'Kim', 'Schultz', 'Okafor', 'Haddad', 'Larsson', 'Rossi', 'Yamamoto', 'Silva', 'Müller', 'Costa', 'Ivanov', 'Mansour', 'Dubois', 'Novak', 'Park', 'Hassan'];
const titles: Record<Dept, string[]> = {
  Engineering: ['Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'Platform Engineer', 'ML Engineer', 'Backend Engineer', 'Frontend Engineer', 'Site Reliability Engineer'],
  Product: ['Product Manager', 'Senior PM', 'Group PM', 'Technical PM', 'Product Lead'],
  Design: ['Product Designer', 'Senior Designer', 'Design Lead', 'UX Researcher'],
  Sales: ['Account Executive', 'Sales Director', 'SDR', 'Account Manager'],
  Marketing: ['Marketing Manager', 'Content Lead', 'Growth Manager', 'Brand Strategist'],
  Operations: ['Operations Lead', 'BizOps Manager', 'Program Manager'],
  Security: ['Security Engineer', 'AppSec Lead', 'SOC Analyst', 'GRC Manager'],
  IT: ['IT Support Engineer', 'IT Manager', 'Systems Administrator'],
  HR: ['HR Business Partner', 'People Ops Manager', 'Recruiter', 'L&D Specialist'],
  Finance: ['Financial Analyst', 'Controller', 'FP&A Manager'],
};
const skillsByDept: Record<Dept, string[]> = {
  Engineering: ['TypeScript', 'Go', 'Rust', 'Python', 'Kubernetes', 'Postgres', 'React', 'gRPC', 'AWS', 'Terraform'],
  Product: ['Roadmapping', 'Discovery', 'Analytics', 'JIRA', 'User Research', 'Prioritization'],
  Design: ['Figma', 'Design Systems', 'Prototyping', 'Research', 'Accessibility'],
  Sales: ['Enterprise Sales', 'Outbound', 'CRM', 'Negotiation', 'Forecasting'],
  Marketing: ['SEO', 'Content', 'Lifecycle', 'Brand', 'Paid Acquisition'],
  Operations: ['Process Design', 'OKRs', 'Vendor Mgmt', 'Analytics'],
  Security: ['SOC2', 'Pen Testing', 'IAM', 'Threat Modeling', 'SIEM'],
  IT: ['MDM', 'Networking', 'Identity', 'Helpdesk', 'Scripting'],
  HR: ['People Ops', 'Compensation', 'Onboarding', 'ATS', 'Coaching'],
  Finance: ['Excel', 'Modeling', 'Forecasting', 'NetSuite', 'Audit'],
};
const projectsByDept: Record<Dept, string[]> = {
  Engineering: ['Atlas API', 'Vector Store', 'Ingestion Pipeline', 'Frontend Revamp', 'Eval Harness'],
  Product: ['Brain v2 Roadmap', 'Onboarding Redesign', 'Enterprise Tier'],
  Design: ['Design System 3.0', 'Agent Studio UX', 'Dashboard Refresh'],
  Sales: ['Q4 Enterprise Pipeline', 'Strategic Accounts'],
  Marketing: ['Launch Campaign', 'Conference 2026'],
  Operations: ['Annual Planning', 'Vendor Consolidation'],
  Security: ['SOC2 Audit', 'Zero Trust Rollout'],
  IT: ['Device Fleet Upgrade', 'Identity Migration'],
  HR: ['Hiring Loop Revamp', 'Comp Bands'],
  Finance: ['Annual Budget', 'Audit Prep'],
};
const locations = ['San Francisco, US', 'New York, US', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Remote', 'Toronto, CA', 'Sydney, AU'];
const departments: Dept[] = ['Engineering', 'Product', 'Design', 'Security', 'IT', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance'];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

function seeded(i: number) {
  const x = Math.sin(i * 999) * 10000;
  return x - Math.floor(x);
}

export const employees: Employee[] = Array.from({ length: 48 }, (_, i) => {
  const dept = pick(departments, i);
  return {
    id: `EMP-${String(1000 + i).padStart(4, '0')}`,
    name: `${pick(firstNames, i)} ${pick(lastNames, i + 3)}`,
    email: `${pick(firstNames, i).toLowerCase()}.${pick(lastNames, i + 3).toLowerCase()}@company.ai`,
    department: dept,
    title: pick(titles[dept], i),
    skills: skillsByDept[dept].slice(0, 3 + Math.floor(seeded(i) * 3)),
    experience: 1 + Math.floor(seeded(i) * 14),
    projects: projectsByDept[dept].slice(0, 1 + Math.floor(seeded(i + 1) * 2)),
    location: pick(locations, i + 2),
    status: seeded(i + 5) > 0.3 ? 'active' : 'away',
    avatarHue: Math.floor(seeded(i + 7) * 360),
  };
});

const docNames = [
  ['Technology Stack Overview', 'md', 'Engineering', 'technical'],
  ['Onboarding Playbook', 'pdf', 'HR', 'policy'],
  ['API Reference v3', 'md', 'Engineering', 'technical'],
  ['Security Incident Response', 'pdf', 'Security', 'policy'],
  ['Q4 OKRs', 'docx', 'Operations', 'planning'],
  ['Design System 3.0', 'md', 'Design', 'technical'],
  ['Sales Playbook', 'pdf', 'Sales', 'enablement'],
  ['Data Retention Policy', 'docx', 'Security', 'policy'],
  ['Architecture Decision Records', 'md', 'Engineering', 'technical'],
  ['Brand Guidelines 2026', 'pdf', 'Marketing', 'brand'],
  ['Vendor Security Questionnaire', 'csv', 'Security', 'compliance'],
  ['Meeting Notes 2026-09', 'txt', 'Product', 'notes'],
  ['Incident Postmortem 0914', 'md', 'Engineering', 'incident'],
  ['Deployment Runbook', 'md', 'IT', 'runbook'],
  ['Compensation Bands', 'csv', 'HR', 'people'],
  ['Forecast Model Q4', 'csv', 'Finance', 'planning'],
  ['Knowledge Management Spec', 'md', 'Product', 'spec'],
  ['Eval Harness Design', 'md', 'Engineering', 'technical'],
  ['Travel and Expense Policy', 'pdf', 'Operations', 'policy'],
  ['Remote Work Guidelines', 'docx', 'HR', 'policy'],
  ['API Gateway Config', 'txt', 'IT', 'runbook'],
  ['Internal API: Vector Search', 'url', 'Engineering', 'api'],
  ['Customer Onboarding Guide', 'pdf', 'Sales', 'enablement'],
  ['Accessibility Standards', 'md', 'Design', 'technical'],
] as const;

export const documents: DocumentRecord[] = docNames.map((d, i) => {
  const dept = d[2] as Dept;
  return {
    id: `DOC-${String(100 + i).padStart(4, '0')}`,
    name: d[0],
    type: d[1] as DocumentRecord['type'],
    category: d[3],
    department: dept,
    owner: `${pick(firstNames, i + 1)} ${pick(lastNames, i + 4)}`,
    sizeKB: 40 + Math.floor(seeded(i + 3) * 8000),
    status: seeded(i + 2) > 0.12 ? 'indexed' : seeded(i + 4) > 0.5 ? 'processing' : 'failed',
    lastIndexed: new Date(Date.now() - Math.floor(seeded(i + 6) * 1000 * 60 * 60 * 24 * 21)).toISOString(),
    chunks: 20 + Math.floor(seeded(i + 8) * 320),
    freshness: Math.floor(seeded(i + 9) * 100),
  };
});

export const agents: Agent[] = [
  { id: 'AGT-001', name: 'HR Policy Assistant', description: 'Answers questions about company policies, benefits, leave, and onboarding.', model: 'gpt-4o-mini', sources: 12, status: 'active', category: 'HR', runs: 1284, successRate: 96, updatedAt: new Date(Date.now() - 3600_000 * 3).toISOString(), template: 'HR Policy Assistant' },
  { id: 'AGT-002', name: 'Engineering Documentation Assistant', description: 'Technical queries across architecture, ADRs, runbooks, and API references.', model: 'claude-3.5-sonnet', sources: 34, status: 'active', category: 'Engineering', runs: 3421, successRate: 92, updatedAt: new Date(Date.now() - 3600_000 * 18).toISOString(), template: 'Engineering Documentation Assistant' },
  { id: 'AGT-003', name: 'Employee Knowledge Assistant', description: 'Directory and org intelligence — who works on what and where to find expertise.', model: 'gpt-4o-mini', sources: 8, status: 'active', category: 'People', runs: 988, successRate: 89, updatedAt: new Date(Date.now() - 3600_000 * 48).toISOString(), template: 'Employee Knowledge Assistant' },
  { id: 'AGT-004', name: 'IT Helpdesk Assistant', description: 'Handles access requests, device issues, and runbook lookups.', model: 'gpt-4o-mini', sources: 15, status: 'active', category: 'IT', runs: 2150, successRate: 88, updatedAt: new Date(Date.now() - 3600_000 * 9).toISOString(), template: 'IT Helpdesk Assistant' },
  { id: 'AGT-005', name: 'Project Knowledge Assistant', description: 'Cross-team project context, milestones, owners, and status.', model: 'claude-3.5-sonnet', sources: 21, status: 'draft', category: 'Product', runs: 0, successRate: 0, updatedAt: new Date(Date.now() - 3600_000 * 72).toISOString(), template: 'Project Knowledge Assistant' },
  { id: 'AGT-006', name: 'Company Research Assistant', description: 'Broad research across internal knowledge graph and external signals.', model: 'gpt-4o', sources: 56, status: 'archived', category: 'Research', runs: 612, successRate: 84, updatedAt: new Date(Date.now() - 3600_000 * 120).toISOString(), template: 'Company Research Assistant' },
];

export const agentTemplates = [
  { name: 'HR Policy Assistant', description: 'Benefits, leave, onboarding, and policy Q&A.', icon: Users, category: 'HR' },
  { name: 'Engineering Documentation Assistant', description: 'ADRs, runbooks, API references, and architecture.', icon: Cpu, category: 'Engineering' },
  { name: 'Employee Knowledge Assistant', description: 'Org intelligence and expertise discovery.', icon: Users, category: 'People' },
  { name: 'IT Helpdesk Assistant', description: 'Access, devices, runbooks, and ticket triage.', icon: Server, category: 'IT' },
  { name: 'Project Knowledge Assistant', description: 'Project context, owners, milestones, and status.', icon: FolderKanban, category: 'Product' },
  { name: 'Company Research Assistant', description: 'Broad research with the knowledge graph.', icon: Database, category: 'Research' },
];

export const integrations = [
  { id: 'csv', name: 'CSV & Spreadsheets', connected: true, lastSync: '2 hours ago', icon: FileText, items: 24 },
  { id: 'pdf', name: 'PDF & Documents', connected: true, lastSync: '5 hours ago', icon: FileText, items: 142 },
  { id: 'github', name: 'GitHub', connected: true, lastSync: '14 minutes ago', icon: Cpu, items: 38 },
  { id: 'gdrive', name: 'Google Drive', connected: false, lastSync: null, icon: Database, items: 0 },
  { id: 'notion', name: 'Notion', connected: false, lastSync: null, icon: FileText, items: 0 },
  { id: 'confluence', name: 'Confluence', connected: true, lastSync: '1 day ago', icon: FileText, items: 89 },
  { id: 'slack', name: 'Slack', connected: false, lastSync: null, icon: Users, items: 0 },
  { id: 'api', name: 'Internal REST APIs', connected: true, lastSync: '3 minutes ago', icon: Server, items: 12 },
];

export const activityFeed = [
  { id: 1, type: 'agent', text: 'Engineering Documentation Assistant answered 14 questions', at: new Date(Date.now() - 600_000).toISOString(), dept: 'Engineering' as Dept },
  { id: 2, type: 'document', text: 'Security Incident Response PDF reindexed', at: new Date(Date.now() - 1800_000).toISOString(), dept: 'Security' as Dept },
  { id: 3, type: 'user', text: 'Maya Rossi joined the Design department', at: new Date(Date.now() - 3600_000).toISOString(), dept: 'Design' as Dept },
  { id: 4, type: 'agent', text: 'HR Policy Assistant created from template', at: new Date(Date.now() - 7200_000).toISOString(), dept: 'HR' as Dept },
  { id: 5, type: 'document', text: 'API Reference v3 chunks updated (312)', at: new Date(Date.now() - 14400_000).toISOString(), dept: 'Engineering' as Dept },
  { id: 6, type: 'ingestion', text: 'Ingestion failed for Vendor Security Questionnaire', at: new Date(Date.now() - 21600_000).toISOString(), dept: 'Security' as Dept },
  { id: 7, type: 'agent', text: 'IT Helpdesk Assistant run completed (87 queries)', at: new Date(Date.now() - 36000_000).toISOString(), dept: 'IT' as Dept },
  { id: 8, type: 'document', text: 'Design System 3.0 uploaded by Lina Park', at: new Date(Date.now() - 43200_000).toISOString(), dept: 'Design' as Dept },
];

export const auditLogs = [
  { id: 'AUD-7821', actor: 'admin@company.ai', action: 'Updated RLS policy on documents', target: 'documents', at: new Date(Date.now() - 1200_000).toISOString(), ip: '10.0.4.21' },
  { id: 'AUD-7820', actor: 'reza.haddad@company.ai', action: 'Created agent "Project Knowledge Assistant"', target: 'agents/AGT-005', at: new Date(Date.now() - 7200_000).toISOString(), ip: '10.0.4.88' },
  { id: 'AUD-7819', actor: 'system', action: 'Scheduled reindex for Engineering docs', target: 'documents', at: new Date(Date.now() - 14400_000).toISOString(), ip: '127.0.0.1' },
  { id: 'AUD-7818', actor: 'ava.chen@company.ai', action: 'Exported conversation "API auth flow"', target: 'conversations', at: new Date(Date.now() - 28800_000).toISOString(), ip: '10.0.4.12' },
  { id: 'AUD-7817', actor: 'admin@company.ai', action: 'Granted Manager role to 4 users', target: 'users', at: new Date(Date.now() - 36000_000).toISOString(), ip: '10.0.4.21' },
  { id: 'AUD-7816', actor: 'system', action: 'Rotated API key for GitHub integration', target: 'integrations/github', at: new Date(Date.now() - 86400_000).toISOString(), ip: '127.0.0.1' },
];

export const users = [
  { id: 'USR-01', name: 'Ava Chen', email: 'ava.chen@company.ai', role: 'Admin', status: 'active', lastActive: '5m ago' },
  { id: 'USR-02', name: 'Reza Haddad', email: 'reza.haddad@company.ai', role: 'Manager', status: 'active', lastActive: '1h ago' },
  { id: 'USR-03', name: 'Lina Park', email: 'lina.park@company.ai', role: 'Employee', status: 'active', lastActive: '2h ago' },
  { id: 'USR-04', name: 'Omar Hassan', email: 'omar.hassan@company.ai', role: 'Employee', status: 'away', lastActive: '1d ago' },
  { id: 'USR-05', name: 'Dmitri Ivanov', email: 'dmitri.ivanov@company.ai', role: 'Manager', status: 'active', lastActive: '15m ago' },
  { id: 'USR-06', name: 'Clara Costa', email: 'clara.costa@company.ai', role: 'Employee', status: 'active', lastActive: '3h ago' },
  { id: 'USR-07', name: 'Hugo Dubois', email: 'hugo.dubois@company.ai', role: 'Employee', status: 'suspended', lastActive: '12d ago' },
  { id: 'USR-08', name: 'Yuki Yamamoto', email: 'yuki.yamamoto@company.ai', role: 'Manager', status: 'active', lastActive: '22m ago' },
];

export const roles = [
  { name: 'Admin', description: 'Full platform access including settings, billing, and audit.', users: 3, permissions: 48 },
  { name: 'Manager', description: 'Manage teams, projects, and view department analytics.', users: 12, permissions: 22 },
  { name: 'Employee', description: 'Search, chat with agents, and view permitted documents.', users: 184, permissions: 9 },
  { name: 'Viewer', description: 'Read-only access to shared knowledge.', users: 6, permissions: 4 },
];

export const usageTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  questions: 120 + Math.floor(seeded(i) * 240) + (i > 20 ? 80 : 0),
  retrievals: 220 + Math.floor(seeded(i + 2) * 380),
  unanswered: 8 + Math.floor(seeded(i + 5) * 30),
}));

export const departmentCoverage = departments.map((d, i) => ({
  department: d,
  coverage: 55 + Math.floor(seeded(i + 1) * 45),
  documents: documents.filter((x) => x.department === d).length + 2 + i,
  employees: employees.filter((x) => x.department === d).length,
}));

export const sourceHealth = [
  { source: 'GitHub', health: 98, status: 'healthy' },
  { source: 'Confluence', health: 92, status: 'healthy' },
  { source: 'PDF Docs', health: 88, status: 'healthy' },
  { source: 'Internal APIs', health: 95, status: 'healthy' },
  { source: 'CSV Uploads', health: 76, status: 'degraded' },
  { source: 'Google Drive', health: 0, status: 'offline' },
];

export const topTopics = [
  { topic: 'API authentication', count: 412 },
  { topic: 'Onboarding process', count: 318 },
  { topic: 'Security procedures', count: 287 },
  { topic: 'Tech stack', count: 264 },
  { topic: 'Project owners', count: 211 },
  { topic: 'Incident postmortems', count: 168 },
];

export const unansweredTopics = [
  { topic: 'Q4 budget approval threshold', count: 22 },
  { topic: 'VPN setup for contractors', count: 18 },
  { topic: 'Latest SOC2 audit status', count: 15 },
  { topic: 'Design system contribution guide', count: 12 },
  { topic: 'Vendor SLA requirements', count: 9 },
];

export const knowledgeGaps = [
  { id: 'GAP-1', area: 'Finance — Q4 Budget Process', severity: 'high', missingDocs: 3, lastRaised: '2d ago' },
  { id: 'GAP-2', area: 'IT — Contractor VPN Runbook', severity: 'medium', missingDocs: 1, lastRaised: '4d ago' },
  { id: 'GAP-3', area: 'Security — SOC2 Audit Status', severity: 'high', missingDocs: 2, lastRaised: '1d ago' },
  { id: 'GAP-4', area: 'Design — Contribution Guide', severity: 'low', missingDocs: 1, lastRaised: '6d ago' },
  { id: 'GAP-5', area: 'Sales — Enterprise SLA Terms', severity: 'medium', missingDocs: 2, lastRaised: '3d ago' },
];

export const knowledgeGraph = {
  nodes: [
    { id: 'eng', label: 'Engineering', type: 'department', x: 200, y: 200 },
    { id: 'sec', label: 'Security', type: 'department', x: 400, y: 120 },
    { id: 'hr', label: 'HR', type: 'department', x: 600, y: 200 },
    { id: 'it', label: 'IT', type: 'department', x: 300, y: 340 },
    { id: 'prod', label: 'Product', type: 'department', x: 500, y: 340 },
    { id: 'atlas', label: 'Atlas API', type: 'project', x: 150, y: 100 },
    { id: 'vector', label: 'Vector Store', type: 'project', x: 250, y: 90 },
    { id: 'apiref', label: 'API Reference v3', type: 'document', x: 120, y: 260 },
    { id: 'adr', label: 'ADRs', type: 'document', x: 220, y: 280 },
    { id: 'onboard', label: 'Onboarding Playbook', type: 'document', x: 620, y: 130 },
    { id: 'incident', label: 'Incident Response', type: 'document', x: 420, y: 60 },
    { id: 'runbook', label: 'Deployment Runbook', type: 'document', x: 320, y: 410 },
    { id: 'ava', label: 'Ava Chen', type: 'employee', x: 80, y: 180 },
    { id: 'reza', label: 'Reza Haddad', type: 'employee', x: 380, y: 220 },
    { id: 'lina', label: 'Lina Park', type: 'employee', x: 560, y: 290 },
  ],
  edges: [
    { from: 'eng', to: 'atlas' }, { from: 'eng', to: 'vector' }, { from: 'eng', to: 'apiref' }, { from: 'eng', to: 'adr' },
    { from: 'sec', to: 'incident' }, { from: 'hr', to: 'onboard' }, { from: 'it', to: 'runbook' },
    { from: 'prod', to: 'atlas' }, { from: 'ava', to: 'eng' }, { from: 'reza', to: 'sec' }, { from: 'reza', to: 'prod' },
    { from: 'lina', to: 'prod' }, { from: 'incident', to: 'runbook' }, { from: 'apiref', to: 'atlas' },
  ],
};

export const dashboardStats = {
  employees: employees.length,
  sources: integrations.filter((i) => i.connected).length,
  documents: documents.length + 158,
  questions: 8420,
  retrievalRate: 91,
  freshness: 84,
};

export function sampleCitations(): SourceCitation[] {
  return [
    { id: 'c1', document: 'Technology Stack Overview', section: 'Core Stack', excerpt: 'Primary backend in Go and TypeScript with Postgres + pgvector for retrieval; React + TypeScript frontend deployed on Vercel.', relevance: 0.94, department: 'Engineering' },
    { id: 'c2', document: 'API Reference v3', section: 'Authentication', excerpt: 'All internal APIs require short-lived JWTs issued by the identity service; service-to-service uses mTLS.', relevance: 0.88, department: 'Engineering' },
    { id: 'c3', document: 'Architecture Decision Records', section: 'ADR-014 Vector Store', excerpt: 'We selected pgvector over a dedicated vector DB to keep operational surface area small at our scale.', relevance: 0.81, department: 'Engineering' },
  ];
}

export const suggestedQuestions = [
  'What is our company technology stack?',
  'Summarize our employee onboarding process.',
  'Which team owns the Atlas API project?',
  'Find technical documentation about our APIs.',
  'What are the approved security procedures?',
  'Identify knowledge gaps in the Security department.',
];
