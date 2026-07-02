import api from './api';
import type { College } from '../types';

export const collegesService = {
  async getAll(params?: { query?: string; stream?: string; state?: string; city?: string }): Promise<College[]> {
    const response = await api.get<College[]>('/colleges', { params });
    return response.data;
  },

  async getById(id: string): Promise<College> {
    const response = await api.get<College>(`/colleges/${id}`);
    return response.data;
  },

  async seed(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/colleges/seed');
    return response.data;
  },
};
