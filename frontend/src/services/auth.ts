import api from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async signup(payload: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/signup', payload);
    return response.data;
  },

  async login(payload: any): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string; reset_token?: string; reset_url?: string; dev_notice?: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(payload: any): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
