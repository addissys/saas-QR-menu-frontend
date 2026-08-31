import api from './axios';
import { Tenant } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mapTenant = (tenant: any): Tenant => ({
  id: tenant.id,
  businessName: tenant.business_name ?? tenant.businessName ?? '',
  businessSlug: tenant.business_slug ?? tenant.businessSlug,
  email: tenant.email ?? '',
  phone: tenant.phone ?? '',
  address: tenant.address ?? '',
  city: tenant.city ?? '',
  country: tenant.country ?? '',
  logoUrl: tenant.logo_url ?? tenant.logoUrl,
  brandColor: tenant.brand_color ?? tenant.brandColor ?? tenant.primaryColor,
  primaryColor: tenant.brand_color ?? tenant.primaryColor,
  currencySymbol: tenant.currency_symbol ?? tenant.currencySymbol ?? '$',
  description: tenant.description,
  status: tenant.status ?? (tenant.is_active !== false ? 'ACTIVE' : 'SUSPENDED'),
  isActive: tenant.is_active ?? tenant.isActive ?? tenant.status === 'ACTIVE',
  ownerId: tenant.owner_id ?? tenant.ownerId ?? tenant.owner?.id,
  ownerName: tenant.owner?.full_name ?? tenant.ownerName,
  createdAt: tenant.created_at ?? tenant.createdAt ?? new Date().toISOString(),
});

const unwrapTenants = (response: any): Tenant[] => {
  const payload = response.data?.data ?? response.data;
  const tenants = payload?.tenants ?? payload;
  return Array.isArray(tenants) ? tenants.map(mapTenant) : [];
};

export const tenantApi = {
  getProfile: async (): Promise<{ data: Tenant | null }> => {
    const user = useAuthStore.getState().user;

    // 1. If user already has tenantId set in store, fetch that tenant's profile
    if (user?.tenantId) {
      try {
        const tenant = await tenantApi.getById(user.tenantId);
        if (tenant.data) return tenant;
      } catch {
        // Fall back to /auth/me check
      }
    }

    // 2. Query /auth/me to check owned_tenants or staff tenant for logged-in user
    try {
      const response = await api.get('/auth/me');
      const rawUser = response.data.data?.user ?? response.data.data;
      const ownedTenant = rawUser?.owned_tenants?.[0];
      if (ownedTenant) {
        const mapped = mapTenant(ownedTenant);
        if (user) {
          useAuthStore.setState({ user: { ...user, tenantId: mapped.id } });
        }
        return { data: mapped };
      }
      
      const staffTenantId = rawUser?.staff?.[0]?.tenant_id || rawUser?.staff?.[0]?.branch?.tenant_id;
      if (staffTenantId) {
        const tenant = await tenantApi.getById(staffTenantId);
        if (tenant.data) {
          if (user) {
            useAuthStore.setState({ user: { ...user, tenantId: staffTenantId } });
          }
          return tenant;
        }
      }
    } catch {
      // Fallback
    }

    // 3. User has no tenant profile yet - return null so they can create their own
    return { data: null };
  },

  getAll: async (): Promise<{ data: Tenant[] }> => {
    const response = await api.get('/tenants');
    return { data: unwrapTenants(response) };
  },

  getById: async (id: string): Promise<{ data: Tenant }> => {
    const response = await api.get(`/tenants/${id}`);
    return { data: mapTenant(response.data.data?.tenant ?? response.data.data) };
  },

  create: async (payload: {
    businessName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    logoUrl?: string;
    primaryColor?: string;
    currencySymbol?: string;
    description?: string;
  }): Promise<{ data: Tenant }> => {
    const user = useAuthStore.getState().user;
    if (!user?.id) throw new Error('User not logged in');

    const cleanSlug = slugify(payload.businessName) || 'restaurant';
    const uniqueSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const response = await api.post('/tenants', {
      owner_id: user.id,
      business_name: payload.businessName.trim(),
      business_slug: uniqueSlug,
      email: payload.email?.trim() || user.email,
      phone: payload.phone?.trim() || undefined,
      address: payload.address?.trim() || 'Main Restaurant Location',
      city: payload.city?.trim() || 'Addis Ababa',
      country: payload.country?.trim() || 'Ethiopia',
      ...(payload.logoUrl?.trim() && { logo_url: payload.logoUrl.trim() }),
      ...(payload.primaryColor && { brand_color: payload.primaryColor }),
      ...(payload.currencySymbol && { currency_symbol: payload.currencySymbol }),
      ...(payload.description && { description: payload.description }),
    });

    const newTenant = mapTenant(response.data.data?.tenant ?? response.data.data);

    // Update Zustand store immediately so tenantId is globally set across app
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      useAuthStore.setState({
        user: { ...currentUser, tenantId: newTenant.id },
      });
    }

    return { data: newTenant };
  },

  update: async (id: string, payload: Partial<Tenant>): Promise<{ data: Tenant }> => {
    const response = await api.patch(`/tenants/${id}`, {
      ...(payload.businessName !== undefined && {
        business_name: payload.businessName,
        business_slug: slugify(payload.businessName),
      }),
      ...(payload.email !== undefined && { email: payload.email }),
      ...(payload.phone !== undefined && { phone: payload.phone }),
      ...(payload.address !== undefined && { address: payload.address }),
      ...(payload.city !== undefined && { city: payload.city }),
      ...(payload.country !== undefined && { country: payload.country }),
      ...(payload.logoUrl !== undefined && { logo_url: payload.logoUrl }),
      ...(payload.primaryColor !== undefined && { brand_color: payload.primaryColor }),
      ...(payload.currencySymbol !== undefined && { currency_symbol: payload.currencySymbol }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.isActive !== undefined && { is_active: payload.isActive }),
    });
    return { data: mapTenant(response.data.data?.tenant ?? response.data.data) };
  },
};
