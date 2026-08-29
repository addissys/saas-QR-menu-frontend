import api from './axios';

export const adminApi = {
  // GET /api/v1/admin/dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  },

  // GET /api/v1/admin/search
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

  // GET /api/v1/admin/tenants
  getTenants: async () => {
    const response = await api.get('/admin/tenants');
    return response.data.data?.tenants ?? [];
  },

  // POST /api/v1/admin/tenants
  createTenant: async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/admin/tenants', payload);
    return response.data.data?.tenant ?? response.data.data;
  },

  // GET /api/v1/admin/tenants/:id
  getById: async (id: string) => {
    const response = await api.get(`/admin/tenants/${id}`);
    return response.data.data?.tenant ?? response.data.data;
  },
};