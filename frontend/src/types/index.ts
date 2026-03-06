// GrantAgent Type Definitions

export interface Organization {
  id: string;
  name: string;
  mission: string;
  teamSize: number;
  budget: number;
  location: string;
  focusAreas: string[];
  pastProjects: string[];
  sector: string;
  country: string;
  fundingNeed: number;
  createdAt: string;
}

export interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: number;
  deadline: string;
  eligibility: string[];
  keywords: string[];
  fitScore: number;
  probabilityScore: number;
  status: 'open' | 'closing_soon' | 'closed';
  description: string;
  category: string;
}

export interface Application {
  id: string;
  orgId: string;
  grantId: string;
  grantTitle: string;
  funder: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  narrative: string;
  formData: Record<string, string>;
  complianceScore: number;
  probabilityScore: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCheck {
  id: string;
  category: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  suggestion?: string;
}

export interface ReviewFeedback {
  id: string;
  section: string;
  score: number;
  maxScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface AuditEntry {
  id: string;
  action: string;
  agent: string;
  timestamp: string;
  inputSummary: string;
  outputSummary: string;
}

export interface KPIData {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  agent: string;
  timestamp: string;
  details: string;
}

export interface ProposalQuestion {
  id: string;
  question: string;
  answer: string;
  wordCount: number;
  maxWords: number;
  status: 'draft' | 'approved' | 'edited';
  tone: 'professional' | 'compelling' | 'technical' | 'narrative';
}
