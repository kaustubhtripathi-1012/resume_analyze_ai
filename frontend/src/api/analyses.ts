import apiClient from './axios';

export interface Breakdown {
  format: number;
  keywords: number;
  sections: number;
  readability: number;
  length: number;
  contactInfo: number;
}

export interface AnalysisData {
  id: string;
  resumeId: string;
  status: 'pending' | 'done' | 'failed';
  atsScore: number;
  breakdown: Breakdown;
  matchPercent: number | null;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  createdAt: string;
  job?: {
    _id: string;
    title: string;
    company: string;
  };
}

export const analysesApi = {
  async getOne(id: string): Promise<AnalysisData> {
    const res = await apiClient.get<AnalysisData>(`/analyses/${id}`);
    return res.data;
  },

  async downloadPdf(id: string): Promise<Blob> {
    const res = await apiClient.get(`/analyses/${id}/report.pdf`, {
      responseType: 'blob'
    });
    return res.data;
  },

  async getHistoryByResume(resumeId: string): Promise<{ items: AnalysisData[] }> {
    const res = await apiClient.get<{ items: AnalysisData[] }>(`/analyses/resume/${resumeId}`);
    return res.data;
  }
};

