import { mockStore } from '../services/mockStore';
import { Tenant } from '../types';

export const tenantApi = {
  getProfile: async (): Promise<{ data: Tenant }> => {
    return { data: mockStore.tenant };
  },

  getAll: async (): Promise<{ data: Tenant[] }> => {
    return { data: [mockStore.tenant] };
  },

  getById: async (id: string): Promise<{ data: Tenant }> => {
    return { data: mockStore.tenant };
  },

  update: async (id: string, payload: Partial<Tenant>): Promise<{ data: Tenant }> => {
    const updated = { ...mockStore.tenant, ...payload };
    mockStore.tenant = updated;
    return { data: updated };
  },
};
