import api from './api';
import type { SavedCollege } from '../types';

export const savedService = {
  async getAll(): Promise<SavedCollege[]> {
    const response = await api.get<SavedCollege[]>('/saved-colleges');
    return response.data;
  },

  async save(collegeId: string): Promise<SavedCollege> {
    const response = await api.post<SavedCollege>('/saved-colleges', { college_id: collegeId });
    return response.data;
  },

  async unsave(collegeId: string): Promise<void> {
    await api.delete(`/saved-colleges/${collegeId}`);
  },
};
