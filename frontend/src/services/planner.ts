import api from './api';
import type { AdmissionRoadmap } from '../types';

export const plannerService = {
  async generate(payload: {
    preferred_course: string;
    preferred_state: string;
    preferred_city: string;
    marks_12: number;
    entrance_score?: number;
    category: string;
    budget: number;
    preferred_college_type: string;
  }): Promise<AdmissionRoadmap> {
    const response = await api.post<AdmissionRoadmap>('/planner/generate', payload);
    return response.data;
  },

  async getSaved(): Promise<AdmissionRoadmap | null> {
    const response = await api.get<AdmissionRoadmap | null>('/planner/saved');
    return response.data;
  },

  async save(payload: {
    preferred_course: string;
    preferred_state: string;
    preferred_city: string;
    roadmap: any[];
  }): Promise<AdmissionRoadmap> {
    const response = await api.post<AdmissionRoadmap>('/planner/save', payload);
    return response.data;
  },
};
