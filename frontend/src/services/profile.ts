import api from './api';
import type { User, UserPreferences } from '../types';

export const profileService = {
  async get(): Promise<User> {
    const response = await api.get<User>('/profile');
    return response.data;
  },

  async update(payload: { full_name: string; preferences: UserPreferences }): Promise<User> {
    const response = await api.put<User>('/profile', payload);
    return response.data;
  },
};
