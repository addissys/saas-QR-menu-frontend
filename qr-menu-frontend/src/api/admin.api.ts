import api from './axios';
import { Tenant, User } from '../types';
import { normalizeRole } from '../utils/roles';

const mapTenant = (t: any): Tenant => ({
  id: t.id,
  businessName: t.business_name ?? t.businessName ?? '',
  businessSlug: t.business_slug ?? t.businessSlug,
  email: t.email ?? '',
  phone: t.phone ?? '',
  address: t.address ?? '',
  city: t.city ?? '',
  country: t.country ?? '',
  logoUrl: t.logo_url ?? t.logoUrl,
  brandColor: t.brand_color ?? t.brandColor ?? t.primaryColor,
  primaryColor: t.brand_color ?? t.primaryColor,
  currencySymbol: t.currency_symbol ?? t.currencySymbol ?? '$',
  description: t.description,
  status: t.status ?? (t.is_active !== false ? 'ACTIVE' : 'SUSPENDED'),
  isActive: t.is_active ?? t.isActive ?? t.status === 'ACTIVE',
  ownerId: t.owner_id ?? t.ownerId ?? t.owner?.id,
  ownerName: t.owner?.full_name ?? t.ownerName,
  createdAt: t.created_at ?? t.createdAt ?? new Date().toISOString(),
});

const mapUser = (u: any): User => ({
  id: u.id,
  tenantId: u.tenant_id ?? u.tenantId ?? '',
  email: u.email ?? '',
  fullName: u.full_name ?? u.fullName ?? u.email ?? 'User',
  phone: u.phone ?? undefined,
  profileImage: u.profile_image ?? u.profileImage,
  role: (typeof u.role === 'object' ? u.role?.name : u.role) as any,
  isActive: u.is_active ?? u.isActive ?? true,
  createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
});

export const adminApi = {
  // GET /api/v1/admin/dashboard
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    const payload = response.data?.data;
    return payload?.statistics ?? payload;
  },

  // GET /api/v1/admin/search
  search: async (query: string) => {
    const response = await api.get('/admin/search', {
      params: {
        query,
        page: 1,
        limit: 50,
      },
    });

    const payload = response.data?.data;
    const results = payload?.results ?? payload ?? {};

    return {
      tenants: Array.isArray(results.tenants) ? results.tenants.map(mapTenant) : [],
      users: Array.isArray(results.users) ? results.users.map(mapUser) : [],
      branches: Array.isArray(results.branches) ? results.branches : [],
      menuItems: Array.isArray(results.menuItems) ? results.menuItems : [],
    };
  },

  // GET /api/v1/admin/tenants
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get('/admin/tenants', { params: { limit: 100 } });
    const payload = response.data?.data;
    const tenants = payload?.tenants ?? payload;
    return Array.isArray(tenants) ? tenants.map(mapTenant) : [];
  },

  // POST /api/v1/admin/tenants
  createTenant: async (payload: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/admin/tenants', payload);
    const raw = response.data?.data?.tenant ?? response.data?.data;
    return mapTenant(raw);
  },

  // GET /api/v1/admin/tenants/:id
  getById: async (id: string): Promise<Tenant> => {
    const response = await api.get(`/admin/tenants/${id}`);
    const raw = response.data?.data?.tenant ?? response.data?.data;
    return mapTenant(raw);
  },

  // PATCH /api/v1/admin/tenants/:id
  toggleTenantActive: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/admin/tenants/${id}`, {
      is_active: isActive,
      status: isActive ? 'ACTIVE' : 'SUSPENDED',
    });
    const raw = response.data?.data?.tenant ?? response.data?.data;
    return mapTenant(raw);
  },

  // GET /api/v1/users (Global Users list)
  getUsers: async (): Promise<{ data: User[] }> => {
    const response = await api.get('/users', { params: { limit: 100 } });
    const payload = response.data?.data ?? response.data;
    const list = Array.isArray(payload) ? payload : [];
    return { data: list.map(mapUser) };
  },
};