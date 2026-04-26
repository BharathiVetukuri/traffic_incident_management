import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface Incident {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  latitude: number;
  longitude: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export const getIncidents = async (severity?: string, status?: string): Promise<Incident[]> => {
  const params = new URLSearchParams();
  if (severity) params.append('severity', severity);
  if (status) params.append('status', status);
  const response = await api.get(`/incidents?${params.toString()}`);
  return response.data;
};

export const updateIncident = async (
  id: string,
  updates: Partial<Pick<Incident, 'severity' | 'status'>>
): Promise<Incident> => {
  const response = await api.put(`/incidents/${id}`, updates);
  return response.data;
};
