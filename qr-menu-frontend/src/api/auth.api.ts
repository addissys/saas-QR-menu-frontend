import { mockStore } from '../services/mockStore';
import { User } from '../types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ data: AuthResponse }> => {
    const foundUser = mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      const token = `mock-token-${foundUser.id}-${Date.now()}`;
      localStorage.setItem('qr_token', token);
      localStorage.setItem('qr_user', JSON.stringify(foundUser));
      return { data: { user: foundUser, token } };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      tenantId: 'tenant-1',
      email,
      fullName: email.split('@')[0],
      role: email.includes('admin') ? 'SUPER_ADMIN' : 'RESTAURANT_OWNER',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const token = `mock-token-${newUser.id}`;
    localStorage.setItem('qr_token', token);
    localStorage.setItem('qr_user', JSON.stringify(newUser));
    return { data: { user: newUser, token } };
  },

  register: async (payload: {
    businessName: string;
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ data: AuthResponse }> => {
    const newTenant = {
      ...mockStore.tenant,
      id: `tenant-${Date.now()}`,
      businessName: payload.businessName,
      createdAt: new Date().toISOString(),
    };
    mockStore.tenant = newTenant;

    const newUser: User = {
      id: `user-${Date.now()}`,
      tenantId: newTenant.id,
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      role: 'RESTAURANT_OWNER',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    mockStore.users = [...mockStore.users, newUser];

    const token = `mock-token-${newUser.id}`;
    localStorage.setItem('qr_token', token);
    localStorage.setItem('qr_user', JSON.stringify(newUser));
    return { data: { user: newUser, token } };
  },

  getCurrentUser: async (): Promise<{ data: User }> => {
    const saved = localStorage.getItem('qr_user');
    if (saved) {
      return { data: JSON.parse(saved) };
    }
    return { data: mockStore.users[0] };
  },

  getAllUsers: async (): Promise<{ data: User[] }> => {
    return { data: mockStore.users };
  },

  forgotPassword: async (email: string): Promise<{ data: { success: boolean } }> => {
    return { data: { success: true } };
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ data: { success: boolean } }> => {
    return { data: { success: true } };
  },

  changePassword: async (oldPass: string, newPass: string): Promise<{ data: { success: boolean } }> => {
    return { data: { success: true } };
  },
};