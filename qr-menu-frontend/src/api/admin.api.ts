import { tenantApi } from './tenant.api';
import { mockStore } from '../services/mockStore';

export const adminApi = {
  getTenants: () => tenantApi.getAll(),
  toggleTenantActive: (id: string, isActive: boolean) => {
    mockStore.updateTenantStatus(id, isActive);
    return Promise.resolve({ data: { success: true } });
  },
};
