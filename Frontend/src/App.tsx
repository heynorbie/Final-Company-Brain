import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { ChatPage } from '@/pages/ChatPage';
import { AgentsPage } from '@/pages/AgentsPage';
import { AgentRunsPage } from '@/pages/AgentRunsPage';
import { PromptsPage } from '@/pages/PromptsPage';
import { KnowledgeExplorerPage } from '@/pages/KnowledgeExplorerPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { DepartmentsPage } from '@/pages/DepartmentsPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { PoliciesPage } from '@/pages/PoliciesPage';
import { SearchPage } from '@/pages/SearchPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { KnowledgeGapsPage } from '@/pages/KnowledgeGapsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AccessControlPage } from '@/pages/AccessControlPage';
import { AuditPage } from '@/pages/AuditPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/agent-runs" element={<AgentRunsPage />} />
              <Route path="/prompts" element={<PromptsPage />} />
              <Route path="/knowledge" element={<KnowledgeExplorerPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/gaps" element={<KnowledgeGapsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/access" element={<AccessControlPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
