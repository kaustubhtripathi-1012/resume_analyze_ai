import apiClient from './axios';

export interface JobItem {
  _id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  location: string;
  experienceLevel: 'fresher' | 'junior' | 'mid' | 'senior';
  isActive: boolean;
  createdAt: string;
}

export interface CandidateRankItem {
  resumeId: string;
  candidateAlias: string;
  matchPercent: number;
  topSkills: string[];
  matchedSkills: string[];
  education: string;
}

export const jobsApi = {
  async list(params?: { q?: string; skill?: string; page?: number; limit?: number }): Promise<{ items: JobItem[]; total: number }> {
    const res = await apiClient.get<{ items: JobItem[]; total: number }>('/jobs', { params });
    return res.data;
  },

  async getOne(id: string): Promise<{ job: JobItem }> {
    const res = await apiClient.get<{ job: JobItem }>(`/jobs/${id}`);
    return res.data;
  },

  async create(data: Partial<JobItem>): Promise<{ job: JobItem }> {
    const res = await apiClient.post<{ job: JobItem }>('/jobs', data);
    return res.data;
  },

  async update(id: string, data: Partial<JobItem>): Promise<{ job: JobItem }> {
    const res = await apiClient.patch<{ job: JobItem }>(`/jobs/${id}`, data);
    return res.data;
  },

  async getCandidates(jobId: string, limit: number = 20): Promise<{ items: CandidateRankItem[] }> {
    const res = await apiClient.get<{ items: CandidateRankItem[] }>(`/jobs/${jobId}/candidates?limit=${limit}`);
    return res.data;
  }
};

