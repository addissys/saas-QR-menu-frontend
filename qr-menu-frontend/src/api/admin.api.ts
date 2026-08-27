
import api from './axios'

export const adminApi = {
  //GET/api/v1/admin/dashboard
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  //GET/api/v1/admin/search
  search: async (query: string) => {
    const res = await api.get('/admin/search', { params: { query } });
    return res.data.data;
  },

  //GET/api/v1/admin/tenants
  getTenants: async () => {
    const res = await api.get('/admin/tenants');
    return res.data.data?.tenants ?? [];
  },

  //POST/api/v1/admin/tenants
  createTenant: async (payload: { name: string; email: string; password: string }) => {
    const res = await api.post('/admin/tenants', payload);
    return res.data.data?.tenant ?? res.data.data;
  },
  //GET/api/v1/admin/tenants:id
  getById: async (id: string) => {
    const res = await api.get(`/admin/tenants/${id}`);
    return res.data.data?.tenant ?? res.data.data;
  },

  //GET/api/v1/admin/tenants/:id



};
