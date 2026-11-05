import apiClient from './axios';

export interface ParsedProfile {
  name: string;
  email: string;
  phone: string;
  links: string[];
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
}

export interface ResumeItem {
  id: string;
  _id?: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  status: 'uploaded' | 'parsing' | 'parsed' | 'failed';
  createdAt: string;
}

export interface ResumeDetailResponse {
  resume: ResumeItem;
  parsed: ParsedProfile;
  status: string;
}

export const resumesApi = {
  async upload(file: File): Promise<{ resumeId: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<{ resumeId: string; status: string }>('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  async list(): Promise<{ items: ResumeItem[] }> {
    const res = await apiClient.get<{ items: ResumeItem[] }>('/resumes');
    return res.data;
  },

  async getOne(id: string): Promise<ResumeDetailResponse> {
    const res = await apiClient.get<ResumeDetailResponse>(`/resumes/${id}`);
    return res.data;
  },

  async updateParsed(id: string, data: Partial<ParsedProfile>): Promise<{ resume: any }> {
    const res = await apiClient.patch<{ resume: any }>(`/resumes/${id}/parsed`, data);
    return res.data;
  },

  async analyze(id: string, payload?: { jobId?: string; jobText?: string }): Promise<{ analysisId: string }> {
    const res = await apiClient.post<{ analysisId: string }>(`/resumes/${id}/analyze`, payload || {});
    return res.data;
  },

  async getRecommendations(id: string, limit: number = 10): Promise<{ items: any[] }> {
    const res = await apiClient.get<{ items: any[] }>(`/resumes/${id}/recommendations?limit=${limit}`);
    return res.data;
  }
};

