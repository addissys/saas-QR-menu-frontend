import api from './axios';

export const adminApi = {
  // Get admin dashboard statistics
  getStatistics: async () => {
    const response = await api.get('/admin/dashboard');

    return response.data.data;
  },

  // Get all tenants
  getTenants: async () => {
    const response = await api.get('/admin/tenants');

    return response.data.data;
  },

  // Search across the admin platform
  search: async (query: string) => {
    const response = await api.get('/admin/search', {
      params: {
        query,
        page: 1,
        limit: 20,
      },
    });

    return response.data.data;
  },
};
