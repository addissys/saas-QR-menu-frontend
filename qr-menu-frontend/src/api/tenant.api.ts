import { AxiosResponse } from 'axios';
import api from './axios';
import { Tenant } from '../types';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawTenantOwner {
  id?: string;
  full_name?: string;
}

interface RawTenant {
  id: string;
  business_name?: string;
  businessName?: string;
  business_slug?: string;
  businessSlug?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  logo_url?: string;
  logoUrl?: string;
  brand_color?: string;
  brandColor?: string;
  primaryColor?: string;
  currency_symbol?: string;
  currencySymbol?: string;
  description?: string;
  status?: string;
  is_active?: boolean;
  isActive?: boolean;
  owner_id?: string;
  ownerId?: string;
  owner?: RawTenantOwner;
  ownerName?: string;
  created_at?: string;
  createdAt?: string;
}

interface RawStaffEntry {
  tenant_id?: string;
  branch?: {
    tenant_id?: string;
  };
}

interface RawAuthMeUser {
  id?: string;
  owned_tenants?: RawTenant[];
  staff?: RawStaffEntry[];
}

interface ApiEnvelope<T> {
  data?: T;
}

interface AuthMePayload {
  user?: RawAuthMeUser;
}

interface TenantListPayload {
  tenants?: RawTenant[];
}

interface TenantDetailPayload {
  tenant?: RawTenant;
}

interface CreateTenantPayload {
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const mapTenant = (tenant: RawTenant): Tenant => ({
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

const unwrapTenants = (
  response: AxiosResponse<ApiEnvelope<TenantListPayload | RawTenant[]>>
): Tenant[] => {
  const payload = response.data.data ?? response.data;
  const tenants = Array.isArray(payload) ? payload : (payload as TenantListPayload)?.tenants;
  return Array.isArray(tenants) ? tenants.map(mapTenant) : [];
};

const unwrapTenant = (
  response: AxiosResponse<ApiEnvelope<TenantDetailPayload | RawTenant>>
): Tenant => {
  const payload = response.data.data;
  const raw = (payload as TenantDetailPayload)?.tenant ?? (payload as RawTenant);
  return mapTenant(raw);
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

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
      const response = await api.get<ApiEnvelope<AuthMePayload | RawAuthMeUser>>('/auth/me');
      const payload = response.data.data;
      const rawUser = (payload as AuthMePayload)?.user ?? (payload as RawAuthMeUser);

      const ownedTenant = rawUser?.owned_tenants?.[0];
      if (ownedTenant) {
        const mapped = mapTenant(ownedTenant);
        if (user) {
          useAuthStore.setState({ user: { ...user, tenantId: mapped.id } });
        }
        return { data: mapped };
      }

      const staffTenantId =
        rawUser?.staff?.[0]?.tenant_id || rawUser?.staff?.[0]?.branch?.tenant_id;
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
    const response = await api.get<ApiEnvelope<TenantListPayload | RawTenant[]>>('/tenants');
    return { data: unwrapTenants(response) };
  },

  getById: async (id: string): Promise<{ data: Tenant }> => {
    const response = await api.get<ApiEnvelope<TenantDetailPayload | RawTenant>>(
      `/tenants/${id}`
    );
    return { data: unwrapTenant(response) };
  },

  create: async (payload: CreateTenantPayload): Promise<{ data: Tenant }> => {
    const user = useAuthStore.getState().user;
    if (!user?.id) throw new Error('User not logged in');

    const cleanSlug = slugify(payload.businessName) || 'restaurant';
    const uniqueSlug = `${cleanSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const response = await api.post<ApiEnvelope<TenantDetailPayload | RawTenant>>('/tenants', {
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

    const newTenant = unwrapTenant(response);

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
    const response = await api.patch<ApiEnvelope<TenantDetailPayload | RawTenant>>(
      `/tenants/${id}`,
      {
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
        ...(payload.currencySymbol !== undefined && {
          currency_symbol: payload.currencySymbol,
        }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.isActive !== undefined && { is_active: payload.isActive }),
      }
    );
    return { data: unwrapTenant(response) };
  },
};