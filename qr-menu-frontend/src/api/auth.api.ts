import api from './axios';

export const authApi = {
  // POST /api/v1/auth/login
  // Response: { success, message, data: { user, access_token, refresh_token } }
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  // POST /api/v1/auth/register
  // Accepts: { full_name, email, password, phone? }
  // Response: { success, message, data: { user } }
  register: async (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  // GET /api/v1/auth/me
  // Response: { success, message, data: { user } }
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // POST /api/v1/auth/logout
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  // POST /api/v1/auth/refresh-token
  // Accepts: { refresh_token }
  // Response: { success, message, data: { access_token } }
  refreshToken: async (refresh_token: string) => {
    const res = await api.post('/auth/refresh-token', { refresh_token });
    return res.data;
  },

  // PATCH /api/v1/auth/change-password
  changePassword: async (current_password: string, new_password: string) => {
    const res = await api.patch('/auth/change-password', { current_password, new_password });
    return res.data;
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  // POST /api/v1/auth/reset-password
  // Accepts: { token, new_password, confirm_password }
  resetPassword: async (payload: { token: string; new_password: string; confirm_password: string }) => {
    const res = await api.post('/auth/reset-password', payload);
    return res.data;
  },

  // GET /api/v1/users
  getAllUsers: async () => {
    const res = await api.get('/users');
    return res.data;
  },
};
