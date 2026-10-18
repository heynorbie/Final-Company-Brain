import type { Dept, SourceCitation } from '@/data/mockData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/+$/, '');

export interface CompanyBrainResult {
  answer: string;
  agent: string;
  sources: SourceCitation[];
  evidence: unknown[];
}

function evidenceToSources(items: unknown[]): SourceCitation[] {
  return items.map((item, index) => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const source = String(record.source || record.dataset || 'Company graph');
    const section = String(record.type || record.relationship || 'Graph evidence');
    const details = record.details ?? {
      source: record.source,
      relationship: record.relationship,
      target: record.target,
    };
    return {
      id: `graph-source-${index + 1}`,
      document: source,
      section,
      excerpt: typeof details === 'string' ? details : JSON.stringify(details, null, 2),
      relevance: 1,
      department: 'IT' as Dept,
    };
  });
}

export async function askCompanyBrain(question: string): Promise<CompanyBrainResult> {
  const cleanQuestion = question.trim();
  if (!cleanQuestion) throw new Error('Please enter a question.');

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ question: cleanQuestion }),
    });
  } catch {
    throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Start FastAPI and check VITE_API_BASE_URL.`);
  }

  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const detail = typeof body.detail === 'string' ? body.detail : `HTTP ${response.status}`;
    throw new Error(detail);
  }
  if (typeof body.answer !== 'string') throw new Error('Backend response is missing the answer field.');

  const evidence = Array.isArray(body.evidence) ? body.evidence : Array.isArray(body.sources) ? body.sources : [];
  return {
    answer: body.answer,
    agent: typeof body.agent === 'string' ? body.agent : 'Company Generalist',
    evidence,
    sources: evidenceToSources(evidence),
  };
}

export async function checkCompanyBrainHealth(): Promise<Record<string, unknown>> {
  const response = await fetch(`${API_BASE_URL}/api/health`, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : `Health check failed: HTTP ${response.status}`);
  return body;
}
