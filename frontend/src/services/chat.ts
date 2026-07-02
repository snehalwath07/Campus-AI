import api from './api';
import type { ChatSession, College } from '../types';

export const chatService = {
  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get<ChatSession[]>('/chat/sessions');
    return response.data;
  },

  async getSessionById(id: string): Promise<ChatSession> {
    const response = await api.get<ChatSession>(`/chat/sessions/${id}`);
    return response.data;
  },

  async ask(query: string, sessionId?: string): Promise<{ session_id: string; response: string; structured_data?: College }> {
    const response = await api.post<{ session_id: string; response: string; structured_data?: College }>('/chat/query', {
      query,
      session_id: sessionId,
    });
    return response.data;
  },

  async deleteSession(id: string): Promise<void> {
    await api.delete(`/chat/sessions/${id}`);
  },
};
