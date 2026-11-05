import apiClient from './axios';
import { User } from '../store/authStore';

export interface SkillItem {
  _id: string;
  name: string;
  aliases: string[];
  category: 'language' | 'framework' | 'tool' | 'soft';
}

export interface AnalyticsData {
  users: number;
  resumes: number;
  avgAtsScore: number;
  topSkills: Array<{ skill: string; count: number }>;
}

export const adminApi = {
  async getUsers(params?: { page?: number; limit?: number; q?: string }): Promise<{ items: User[]; total: number }> {
    const res = await apiClient.get<{ items: User[]; total: number }>('/admin/users', { params });
    return res.data;
  },

  async updateUser(id: string, data: { isActive?: boolean; role?: string }): Promise<{ user: User }> {
    const res = await apiClient.patch<{ user: User }>(`/admin/users/${id}`, data);
    return res.data;
  },

  async getSkills(params?: { page?: number; limit?: number; q?: string; category?: string }): Promise<{ items: SkillItem[]; total: number }> {
    const res = await apiClient.get<{ items: SkillItem[]; total: number }>('/admin/skills', { params });
    return res.data;
  },

  async createSkill(data: { name: string; aliases?: string[]; category?: string }): Promise<{ skill: SkillItem }> {
    const res = await apiClient.post<{ skill: SkillItem }>('/admin/skills', data);
    return res.data;
  },

  async updateSkill(id: string, data: Partial<SkillItem>): Promise<{ skill: SkillItem }> {
    const res = await apiClient.patch<{ skill: SkillItem }>(`/admin/skills/${id}`, data);
    return res.data;
  },

  async deleteSkill(id: string): Promise<void> {
    await apiClient.delete(`/admin/skills/${id}`);
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const res = await apiClient.get<AnalyticsData>('/admin/analytics');
    return res.data;
  }
};

