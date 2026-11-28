import { apiClient } from './client';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  me: () => apiClient.get('/auth/me'),
};