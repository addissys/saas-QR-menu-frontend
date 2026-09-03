import api from './axios';
import { User, UserRole } from '../types';
import { normalizeRole } from '../utils/roles';
import { branchApi } from './branch.api';
import { useAuthStore } from '../store/useAuthStore';

// ---------------------------------------------------------------------------
// Raw API shapes (as sent by the backend before mapping)
// ---------------------------------------------------------------------------

interface RawStaffProfile {
  branch_id?: string;
  branch?: { id?: string; tenant_id?: string };
}

interface RawExecutiveBranch {
  id?: string;
  branch_id?: string;
  branch?: { id?: string };
}

interface RawUserCore {
  id?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  profile_image?: string;
  profileImage?: string;
  role?: string | { name?: string };
  tenant_id?: string;
  tenantId?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
  staff_profile?: RawStaffProfile[];
}

interface RawUserEnvelope extends RawUserCore {
  user?: RawUserCore;
  branch?: { id?: string; tenant_id?: string };
  branch_id?: string;
  executive_branches?: RawExecutiveBranch[];
  assignedBranchIds?: string[];
  assigned_branch_ids?: string[];
}

interface ApiEnvelope<T> {
  data?: T;
}

interface RoleRecord {
  id: string;
  name: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export type UserWithStaffId = User & { _staffId?: string };

// ---------------------------------------------------------------------------
// Backend → Frontend mapper
// ---------------------------------------------------------------------------

const mapUser = (raw: RawUserEnvelope): UserWithStaffId => {
  const userData: RawUserCore = raw.user ?? raw;
  const branchId: string | undefined =
    raw.branch?.id ??
    raw.branch_id ??
    raw.staff_profile?.[0]?.branch_id ??
    raw.staff_profile?.[0]?.branch?.id ??
    userData.staff_profile?.[0]?.branch_id ??
    userData.staff_profile?.[0]?.branch?.id ??
    undefined;

  const executiveBranchIds: string[] = Array.isArray(raw.executive_branches)
    ? raw.executive_branches
        .map((eb) => eb.branch?.id ?? eb.branch_id ?? eb.id)
        .filter((id): id is string => Boolean(id))
    : [];

  const assignedBranchIds: string[] =
    executiveBranchIds.length > 0
      ? executiveBranchIds
      : branchId
      ? [branchId]
      : raw.assignedBranchIds ?? raw.assigned_branch_ids ?? [];

  const base: User = {
    id: userData.id ?? raw.id ?? '',
    email: userData.email ?? raw.email ?? '',
    fullName: userData.full_name ?? userData.fullName ?? raw.full_name ?? raw.fullName ?? '',
    phone: userData.phone ?? raw.phone ?? undefined,
    profileImage: userData.profile_image ?? userData.profileImage ?? undefined,
    role: (
      typeof raw.role === 'object'
        ? raw.role?.name
        : typeof userData.role === 'object'
        ? userData.role?.name
        : raw.role ?? userData.role
    ) as UserRole,
    tenantId:
      raw.branch?.tenant_id ??
      raw.staff_profile?.[0]?.branch?.tenant_id ??
      userData.staff_profile?.[0]?.branch?.tenant_id ??
      userData.tenant_id ??
      userData.tenantId ??
      raw.tenant_id ??
      raw.tenantId ??
      '',
    branchId: branchId ?? assignedBranchIds[0],
    assignedBranchIds,
    isActive: raw.is_active ?? userData.is_active ?? raw.isActive ?? userData.isActive ?? true,
    createdAt: raw.created_at ?? raw.createdAt ?? userData.created_at ?? new Date().toISOString(),
  };

  return {
    ...base,
    _staffId: raw.id !== userData.id ? raw.id : undefined,
  };
};

const extractRawList = (data: unknown, ...keys: string[]): RawUserEnvelope[] => {
  if (Array.isArray(data)) return data as RawUserEnvelope[];
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as RawUserEnvelope[];
    }
  }
  return [];
};

const extractRawOne = (data: unknown, ...keys: string[]): RawUserEnvelope => {
  if (data && typeof data === 'object') {
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (val && typeof val === 'object') return val as RawUserEnvelope;
    }
  }
  return (data as RawUserEnvelope) ?? {};
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  const apiErr = err as ApiErrorResponse;
  return apiErr?.response?.data?.message ?? apiErr?.message ?? fallback;
};

/** Re-throws as a friendly Error while preserving the original error via `cause`. */
const throwWithCause = (err: unknown, fallback: string): never => {
  throw new Error(getErrorMessage(err, fallback), { cause: err });
};

// ---------------------------------------------------------------------------
// Role ID cache (avoid fetching roles on every call)
// ---------------------------------------------------------------------------

let cachedRoleMap: Record<string, string> | null = null;

const getRoleMap = async (): Promise<Record<string, string>> => {
  if (cachedRoleMap) return cachedRoleMap;

  const res = await api.get<ApiEnvelope<RoleRecord[]> | RoleRecord[]>('/roles');
  const payload = (res.data as ApiEnvelope<RoleRecord[]>)?.data ?? res.data;
  const roles: RoleRecord[] = Array.isArray(payload) ? payload : [];

  cachedRoleMap = {};
  for (const r of roles) {
    const norm = normalizeRole(r.name);
    if (norm !== 'UNKNOWN') {
      cachedRoleMap[norm] = r.id;
    }
    cachedRoleMap[r.name.toUpperCase()] = r.id;
  }

  return cachedRoleMap;
};

const resolveRoleId = async (roleName: string): Promise<string> => {
  const map = await getRoleMap();
  const norm = normalizeRole(roleName);
  const id = map[norm] ?? map[roleName.toUpperCase()];
  if (!id) {
    throw new Error(`Role "${roleName}" not found. Make sure the backend has this role seeded.`);
  }
  return id;
};

// ---------------------------------------------------------------------------
// Public API surface
// ---------------------------------------------------------------------------

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  assignedBranchIds?: string[];
  tenantId?: string;
}

export interface UpdateUserInput {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  assignedBranchIds?: string[];
  isActive?: boolean;
}

interface UpdateUserRequestBody {
  full_name?: string;
  email?: string;
  phone?: string;
  branch_id?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const createUserAccount = async (input: CreateUserInput, roleName: string): Promise<string> => {
  const role_id = await resolveRoleId(roleName);
  const branch_id = input.assignedBranchIds?.[0];
  const res = await api.post<ApiEnvelope<RawUserEnvelope>>('/users', {
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    password: input.password,
    role_id,
    ...(branch_id && { branch_id }),
  });
  const raw = res.data.data ?? {};
  return raw.id ?? raw.user?.id ?? '';
};

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const userApi = {
  // ================= EXECUTIVES =================

  getExecutives: async (): Promise<{ data: User[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const res = await api.get<ApiEnvelope<unknown>>('/executives', { params: { limit: 100 } });
    const raw = extractRawList(res.data.data, 'executives');
    const mapped = raw.map(mapUser);

    if (!isSuperAdmin && user?.tenantId) {
      const branchesRes = await branchApi.getAll();
      const userBranchIds = new Set(branchesRes.data.map((b) => b.id));
      return {
        data: mapped.filter(
          (u) =>
            u.tenantId === user.tenantId ||
            u.assignedBranchIds?.some((bid) => userBranchIds.has(bid))
        ),
      };
    }

    return { data: mapped };
  },

  createExecutive: async (input: CreateUserInput): Promise<{ data: User }> => {
    const userId = await createUserAccount(input, 'EXECUTIVE');
    if (!userId) throw new Error('Failed to create user account');

    let staffId: string | undefined;
    try {
      const execRes = await api.post<ApiEnvelope<unknown>>('/executives', {
        user_id: userId,
        branch_ids: input.assignedBranchIds || [],
      });
      const execRaw = extractRawOne(execRes.data.data, 'executive');
      staffId = execRaw.id;
    } catch (err) {
      throwWithCause(err, 'Failed to register executive');
    }

    if (staffId && input.assignedBranchIds?.length) {
      try {
        await api.post(`/executives/${staffId}/branches`, {
          branch_ids: input.assignedBranchIds,
        });
      } catch {
        // Non-fatal
      }
    }

    return {
      data: {
        id: userId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: 'EXECUTIVE',
        tenantId: '',
        assignedBranchIds: input.assignedBranchIds ?? [],
        isActive: true,
        createdAt: new Date().toISOString(),
      } as User,
    };
  },

  updateExecutive: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const payload: UpdateUserRequestBody = {};
    if (input.fullName !== undefined) payload.full_name = input.fullName.trim();
    if (input.email !== undefined) payload.email = input.email.trim();
    if (input.phone !== undefined) payload.phone = input.phone.trim();

    if (Object.keys(payload).length > 0) {
      await api.patch(`/users/${id}`, payload);
    }

    if (input.assignedBranchIds) {
      try {
        const execsRes = await api.get<ApiEnvelope<unknown>>('/executives', {
          params: { limit: 100 },
        });
        const rawExecs = extractRawList(execsRes.data.data, 'executives');
        const targetExec = rawExecs.find((e) => (e.user?.id ?? e.id) === id || e.id === id);
        if (targetExec?.id) {
          await api.post(`/executives/${targetExec.id}/branches`, {
            branch_ids: input.assignedBranchIds,
          });
        }
      } catch {
        // Non-fatal
      }
    }

    return {
      data: {
        id,
        fullName: input.fullName ?? '',
        email: input.email ?? '',
        phone: input.phone,
        role: 'EXECUTIVE',
        tenantId: '',
        assignedBranchIds: input.assignedBranchIds ?? [],
        isActive: true,
        createdAt: new Date().toISOString(),
      } as User,
    };
  },

  deleteExecutive: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.patch(`/users/${id}/status`, { is_active: false });
    return { data: { success: true } };
  },

  // ================= BRANCH MANAGERS =================

  getBranchManagers: async (
    _branchIdFilter?: string
  ): Promise<{ data: User[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const res = await api.get<ApiEnvelope<unknown>>('/branch-managers', {
      params: { limit: 100 },
    });
    const raw = extractRawList(res.data.data, 'managers');
    const mapped = raw.map(mapUser);

    if (!isSuperAdmin && user?.tenantId) {
      const branchesRes = await branchApi.getAll();
      const userBranchIds = new Set(branchesRes.data.map((b) => b.id));
      return {
        data: mapped.filter(
          (u) =>
            u.tenantId === user.tenantId ||
            (u.branchId && userBranchIds.has(u.branchId)) ||
            u.assignedBranchIds?.some((bid) => userBranchIds.has(bid))
        ),
      };
    }

    return { data: mapped };
  },

  createBranchManager: async (input: CreateUserInput): Promise<{ data: User }> => {
    const userId = await createUserAccount(input, 'BRANCH_MANAGER');
    if (!userId) throw new Error('Failed to create user account');

    let staffId: string | undefined;
    try {
      const mgrRes = await api.post<ApiEnvelope<unknown>>('/branch-managers', {
        user_id: userId,
      });
      const mgrRaw = extractRawOne(mgrRes.data.data, 'manager');
      staffId = mgrRaw.id;
    } catch (err) {
      throwWithCause(err, 'Failed to register branch manager');
    }

    const branchId = input.assignedBranchIds?.[0];
    if (staffId && branchId) {
      try {
        await api.post(`/branch-managers/${staffId}/assign`, { branch_id: branchId });
      } catch {
        // Non-fatal
      }
    }

    return {
      data: {
        id: userId,
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        role: 'BRANCH_MANAGER',
        tenantId: '',
        assignedBranchIds: branchId ? [branchId] : [],
        isActive: true,
        createdAt: new Date().toISOString(),
      } as User,
    };
  },

  updateBranchManager: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const branchId = input.assignedBranchIds?.[0];
    const payload: UpdateUserRequestBody = {};
    if (input.fullName !== undefined) payload.full_name = input.fullName.trim();
    if (input.email !== undefined) payload.email = input.email.trim();
    if (input.phone !== undefined) payload.phone = input.phone.trim();
    if (branchId) payload.branch_id = branchId;

    if (Object.keys(payload).length > 0) {
      await api.patch(`/users/${id}`, payload);
    }

    if (branchId) {
      try {
        const mgrsRes = await api.get<ApiEnvelope<unknown>>('/branch-managers', {
          params: { limit: 100 },
        });
        const rawMgrs = extractRawList(mgrsRes.data.data, 'managers');
        const targetMgr = rawMgrs.find((m) => (m.user?.id ?? m.id) === id || m.id === id);
        if (targetMgr?.id) {
          await api.post(`/branch-managers/${targetMgr.id}/assign`, { branch_id: branchId });
        }
      } catch {
        // Non-fatal
      }
    }

    return {
      data: {
        id,
        fullName: input.fullName ?? '',
        email: input.email ?? '',
        phone: input.phone,
        role: 'BRANCH_MANAGER',
        tenantId: '',
        assignedBranchIds: input.assignedBranchIds ?? [],
        isActive: true,
        createdAt: new Date().toISOString(),
      } as User,
    };
  },

  deleteBranchManager: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.patch(`/users/${id}/status`, { is_active: false });
    return { data: { success: true } };
  },

  // ================= STAFF MEMBERS =================

  getStaff: async (
    _branchIdFilter?: string
  ): Promise<{ data: User[] }> => {
    const user = useAuthStore.getState().user;
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const res = await api.get<ApiEnvelope<RawUserEnvelope[]> | RawUserEnvelope[]>('/users');
    const payload = (res.data as ApiEnvelope<RawUserEnvelope[]>)?.data ?? res.data;
    const raw: RawUserEnvelope[] = Array.isArray(payload) ? payload : [];

    const mapped = raw
      .filter((u) => {
        const roleVal = typeof u.role === 'object' ? u.role?.name : u.role;
        return normalizeRole(roleVal ?? '') === 'STAFF';
      })
      .map(mapUser);

    if (!isSuperAdmin && user?.tenantId) {
      const branchesRes = await branchApi.getAll();
      const userBranchIds = new Set(branchesRes.data.map((b) => b.id));
      return {
        data: mapped.filter(
          (u) =>
            u.tenantId === user.tenantId ||
            (u.branchId && userBranchIds.has(u.branchId)) ||
            u.assignedBranchIds?.some((bid) => userBranchIds.has(bid))
        ),
      };
    }

    return { data: mapped };
  },

  createStaff: async (input: CreateUserInput): Promise<{ data: User }> => {
    const role_id = await resolveRoleId('STAFF');
    const branch_id = input.assignedBranchIds?.[0];
    const res = await api.post<ApiEnvelope<RawUserEnvelope>>('/users', {
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      phone: input.phone?.trim() || undefined,
      password: input.password,
      role_id,
      ...(branch_id && { branch_id }),
    });
    const raw = res.data.data ?? {};
    return { data: mapUser(raw) };
  },

  updateStaff: async (id: string, input: UpdateUserInput): Promise<{ data: User }> => {
    const branch_id = input.assignedBranchIds?.[0];
    const payload: UpdateUserRequestBody = {};
    if (input.fullName !== undefined) payload.full_name = input.fullName.trim();
    if (input.email !== undefined) payload.email = input.email.trim();
    if (input.phone !== undefined) payload.phone = input.phone.trim();
    if (branch_id) payload.branch_id = branch_id;

    const res = await api.patch<ApiEnvelope<RawUserEnvelope>>(`/users/${id}`, payload);
    const raw = res.data.data ?? {};
    return { data: mapUser(raw) };
  },

  deleteStaff: async (id: string): Promise<{ data: { success: boolean } }> => {
    await api.patch(`/users/${id}/status`, { is_active: false });
    return { data: { success: true } };
  },
};