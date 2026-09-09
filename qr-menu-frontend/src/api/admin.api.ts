import api from './axios';
import { Tenant, User } from '../types';
import { normalizeRole } from '../utils/roles';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawOwner {
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
  owner?: RawOwner;
  ownerName?: string;
  created_at?: string;
  createdAt?: string;
}

interface RawUser {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  profile_image?: string;
  profileImage?: string;
  role?: string | { name?: string };
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  staff_profile?: Array<{
    branch_id?: string;
    branch?: {
      id?: string;
      branch_name?: string;
      tenant_id?: string;
      tenant?: { id?: string; business_name?: string };
    };
  }>;
  branch?: {
    id?: string;
    branch_name?: string;
    tenant_id?: string;
  };
  tenant?: {
    id?: string;
    business_name?: string;
  };
}

/** Branches/menuItems in admin search are returned raw (not mapped) — same as original behavior. */
interface RawSearchBranch {
  id: string;
  [key: string]: unknown;
}

interface RawSearchMenuItem {
  id: string;
  [key: string]: unknown;
}

interface ApiEnvelope<T> {
  data?: T;
}

interface DashboardPayload {
  statistics?: DashboardStatistics;
}

interface DashboardMetric {
  total: number;
  active?: number;
}

interface DashboardStatistics {
  tenants?: DashboardMetric;
  users?: DashboardMetric;
  branches?: DashboardMetric;
  menuItems?: DashboardMetric;
}

interface SearchResultsPayload {
  results?: SearchResults;
}

interface SearchResults {
  tenants?: RawTenant[];
  users?: RawUser[];
  branches?: RawSearchBranch[];
  menuItems?: RawSearchMenuItem[];
}

interface SearchResponse {
  tenants: Tenant[];
  users: User[];
  branches: RawSearchBranch[];
  menuItems: RawSearchMenuItem[];
}

interface TenantListPayload {
  tenants?: RawTenant[];
}

interface TenantDetailPayload {
  tenant?: RawTenant;
}

interface CreateTenantPayload {
  name: string;
  email: string;
  password: string;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

const mapTenant = (t: RawTenant): Tenant => ({
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

const mapUser = (u: RawUser): User => {
  const staffProfile = u.staff_profile?.[0];
  const branchId = staffProfile?.branch_id ?? staffProfile?.branch?.id ?? u.branch?.id ?? '';
  const branchName = staffProfile?.branch?.branch_name ?? u.branch?.branch_name ?? '';
  const tenantId = u.tenant_id ?? u.tenantId ?? staffProfile?.branch?.tenant_id ?? u.branch?.tenant_id ?? u.tenant?.id ?? '';
  const tenantName = u.tenant?.business_name ?? staffProfile?.branch?.tenant?.business_name ?? '';
  const assignedBranchIds = u.staff_profile?.map((sp) => sp.branch_id).filter(Boolean) as string[] ?? [];
  return {
    id: u.id,
    tenantId,
    tenantName,
    branchId: branchId || undefined,
    branchName,
    email: u.email ?? '',
    fullName: u.full_name ?? u.fullName ?? u.email ?? 'User',
    phone: u.phone ?? undefined,
    profileImage: u.profile_image ?? u.profileImage,
    role: (typeof u.role === 'object' ? u.role?.name : u.role) as User['role'],
    assignedBranchIds: assignedBranchIds.length > 0 ? assignedBranchIds : (branchId ? [branchId] : []),
    isActive: u.is_active ?? u.isActive ?? true,
    createdAt: u.created_at ?? u.createdAt ?? new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const adminApi = {
  // GET /api/v1/admin/dashboard
  getDashboard: async (): Promise<DashboardStatistics> => {
    const response = await api.get<ApiEnvelope<DashboardPayload | DashboardStatistics>>(
      '/admin/dashboard'
    );
    const payload = response.data.data;
    return (payload as DashboardPayload)?.statistics ?? (payload as DashboardStatistics) ?? {};
  },

  // GET /api/v1/admin/search
  search: async (query: string): Promise<SearchResponse> => {
    const response = await api.get<ApiEnvelope<SearchResultsPayload | SearchResults>>(
      '/admin/search',
      {
        params: {
          query,
          page: 1,
          limit: 50,
        },
      }
    );

    const payload = response.data.data;
    const results: SearchResults =
      (payload as SearchResultsPayload)?.results ?? (payload as SearchResults) ?? {};

    return {
      tenants: Array.isArray(results.tenants) ? results.tenants.map(mapTenant) : [],
      users: Array.isArray(results.users) ? results.users.map(mapUser) : [],
      branches: Array.isArray(results.branches) ? results.branches : [],
      menuItems: Array.isArray(results.menuItems) ? results.menuItems : [],
    };
  },

  // GET /api/v1/admin/tenants
  getTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<ApiEnvelope<TenantListPayload | RawTenant[]>>(
      '/admin/tenants',
      { params: { limit: 100 } }
    );
    const payload = response.data.data;
    const tenants = Array.isArray(payload) ? payload : (payload as TenantListPayload)?.tenants;
    return Array.isArray(tenants) ? tenants.map(mapTenant) : [];
  },

  // POST /api/v1/admin/tenants
  createTenant: async (payload: CreateTenantPayload): Promise<Tenant> => {
    const response = await api.post<ApiEnvelope<TenantDetailPayload | RawTenant>>(
      '/admin/tenants',
      payload
    );
    const data = response.data.data;
    const raw = (data as TenantDetailPayload)?.tenant ?? (data as RawTenant);
    return mapTenant(raw);
  },

  // GET /api/v1/admin/tenants/:id
  getById: async (id: string): Promise<Tenant> => {
    const response = await api.get<ApiEnvelope<TenantDetailPayload | RawTenant>>(
      `/admin/tenants/${id}`
    );
    const data = response.data.data;
    const raw = (data as TenantDetailPayload)?.tenant ?? (data as RawTenant);
    return mapTenant(raw);
  },

  // PATCH /api/v1/admin/tenants/:id
  toggleTenantActive: async (id: string, isActive: boolean): Promise<Tenant> => {
    const response = await api.patch<ApiEnvelope<TenantDetailPayload | RawTenant>>(
      `/admin/tenants/${id}`,
      {
        is_active: isActive,
        status: isActive ? 'ACTIVE' : 'SUSPENDED',
      }
    );
    const data = response.data.data;
    const raw = (data as TenantDetailPayload)?.tenant ?? (data as RawTenant);
    return mapTenant(raw);
  },

  // GET /api/v1/users (Global Users list)
  getUsers: async (tenantId?: string): Promise<{ data: User[] }> => {
    const response = await api.get<ApiEnvelope<RawUser[]> | RawUser[]>(
      '/users',
      { params: { limit: 100, ...(tenantId && { tenant_id: tenantId }) } }
    );
    const payload = (response.data as ApiEnvelope<RawUser[]>)?.data ?? response.data;
    const list = Array.isArray(payload) ? payload : [];
    return { data: list.map(mapUser) };
  },
};