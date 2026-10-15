import { Project, MRVSubmission, BlockchainTransaction, AuditEvent } from '../types';

const API_BASE = '/api';

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function getProjects(params?: { ecosystem?: string; status?: string; search?: string }): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.ecosystem) query.set('ecosystem', params.ecosystem);
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
  const data = await res.json();
  return data.data || [];
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Project not found');
  return data.data;
}

export async function createProject(projectData: any): Promise<{ project: Project; overlapWarning?: string; overlapDetails?: any[] }> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create project');
  return { project: data.data, overlapWarning: data.overlapWarning, overlapDetails: data.overlapDetails };
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to update project');
  return data.data;
}

export async function checkProjectOverlap(data: any): Promise<any> {
  const res = await fetch(`${API_BASE}/projects/check-overlap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return json.data;
}

export async function getSubmissions(params?: { projectId?: string; status?: string }): Promise<MRVSubmission[]> {
  const query = new URLSearchParams();
  if (params?.projectId) query.set('projectId', params.projectId);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${API_BASE}/submissions?${query.toString()}`);
  const data = await res.json();
  return data.data || [];
}

export async function getSubmission(id: string): Promise<MRVSubmission> {
  const res = await fetch(`${API_BASE}/submissions/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Submission not found');
  return data.data;
}

export async function createSubmission(formData: FormData): Promise<MRVSubmission> {
  const res = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create submission');
  return data.data;
}

export async function reviewSubmission(
  id: string,
  decision: { status: string; reviewerName?: string; reviewerRole?: string; comments?: string }
): Promise<MRVSubmission> {
  const res = await fetch(`${API_BASE}/submissions/${id}/review`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decision)
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to review submission');
  return data.data;
}

export async function syncOfflineObservations(observations: any[]): Promise<any> {
  const res = await fetch(`${API_BASE}/field-observations/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ observations })
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to sync observations');
  return data;
}

export async function analyzeImage(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to run AI analysis');
  return data.data;
}

export async function verifyEvidenceHash(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/evidence/verify-hash`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Verification failed');
  return data.data;
}

export async function getBlockchainTransactions(): Promise<BlockchainTransaction[]> {
  const res = await fetch(`${API_BASE}/blockchain/transactions`);
  const data = await res.json();
  return data.data || [];
}

export async function recordOnBlockchain(data: {
  submissionId: string;
  verifierAddress?: string;
  network?: string;
  simulated?: boolean;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/blockchain/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to anchor record');
  return json;
}

export async function getAuditLogs(): Promise<AuditEvent[]> {
  const res = await fetch(`${API_BASE}/audit-logs`);
  const data = await res.json();
  return data.data || [];
}

export async function resetDemoData(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/reset-demo`, {
    method: 'POST'
  });
  return res.json();
}
