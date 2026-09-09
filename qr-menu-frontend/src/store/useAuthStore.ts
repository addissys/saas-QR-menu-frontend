import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { authApi } from '../api/auth.api';


// Add this interface to model the backend response structure
interface RawUser {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  phone?: string | null;
  profile_image?: string | null;
  role?: string | { name?: string };
  owned_tenants?: { id: string }[];
  tenantId?: string;
  tenant_id?: string;
  branchId?: string;
  branch_id?: string;
  assignedBranchIds?: string[];
  assigned_branch_ids?: string[];
  branch?: { id?: string; tenant_id?: string };
  executive_branches?: { id?: string; branch_id?: string; branch?: { id?: string } }[];
  staff_profile?: { branch_id?: string; branch?: { id?: string; tenant_id?: string } }[];
  permissions?: string[];
  is_onboarding_completed?: boolean;
  isOnboardingCompleted?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
  createdAt?: string;
}

const mapRawUser = (raw: RawUser): User => {
  const roleName = (typeof raw.role === 'object' ? raw.role?.name : raw.role) as UserRole;
  const isSuperAdmin = roleName?.toUpperCase() === 'SUPER_ADMIN';
  const hasTenantInfo = Boolean(
    raw.owned_tenants?.[0]?.id ||
    raw.tenantId ||
    raw.tenant_id
  );

  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.full_name ?? raw.fullName ?? '',
    phone: raw.phone ?? undefined,
    profileImage: raw.profile_image ?? undefined,
    role: roleName,
    tenantId:
      raw.owned_tenants?.[0]?.id ??
      raw.tenantId ??
      raw.tenant_id ??
      raw.branch?.tenant_id ??
      raw.staff_profile?.[0]?.branch?.tenant_id ??
      '',
    branchId: raw.branchId ?? raw.branch_id ?? raw.branch?.id ?? raw.staff_profile?.[0]?.branch_id,
    assignedBranchIds:
      raw.assignedBranchIds ??
      raw.assigned_branch_ids ??
      raw.executive_branches?.map((branch) => branch.branch?.id ?? branch.branch_id ?? branch.id).filter((id): id is string => Boolean(id)) ??
      raw.staff_profile?.map((profile) => profile.branch_id).filter((id): id is string => Boolean(id)) ??
      (raw.branchId || raw.branch_id || raw.branch?.id ? [raw.branchId ?? raw.branch_id ?? raw.branch?.id!] : []),
    permissions: raw.permissions ?? [],
    isOnboardingCompleted: raw.is_onboarding_completed ?? raw.isOnboardingCompleted ?? (isSuperAdmin || hasTenantInfo),
    isActive: raw.is_active ?? raw.isActive ?? true,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  };
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      // ── Refresh user profile and permissions silently ───────────────────────
      refreshCurrentUser: async () => {
        const token = localStorage.getItem('qr_access_token');
        if (!token) return;
        try {
          const res = await authApi.getCurrentUser();
          const rawUser = res.data?.user ?? res.data;
          const user = mapRawUser(rawUser);
          set({ user });
        } catch {
          // Keep current state on transient error
        }
      },

      // ── Initialize auth state from stored token on app boot ──────────────────
      initAuth: async () => {
        const token = localStorage.getItem('qr_access_token');
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }
        try {
          // Backend: GET /auth/me → { success, message, data: { user } }
          const res = await authApi.getCurrentUser();
          const rawUser = res.data?.user ?? res.data;
          const user = mapRawUser(rawUser);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('qr_access_token');
          localStorage.removeItem('qr_refresh_token');
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        }
      },

      // ── Login ────────────────────────────────────────────────────────────────
      login: async (email: string, pass: string) => {
        set({ isLoading: true });
        try {
          // Backend: POST /auth/login → { success, message, data: { user, access_token, refresh_token } }
          const res = await authApi.login(email, pass);
          const { user: rawUser, access_token, refresh_token } = res.data;
          localStorage.setItem('qr_access_token', access_token);
          localStorage.setItem('qr_refresh_token', refresh_token);
          const user = mapRawUser(rawUser);
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ── Register ─────────────────────────────────────────────────────────────
      register: async (data) => {
        set({ isLoading: true });
        try {
          // Backend: POST /auth/register → { success, message, data: { user } }
          // Maps camelCase frontend fields → snake_case backend fields
          await authApi.register({
            full_name: data.fullName,
            email: data.email,
            password: data.password,
            confirm_password: data.confirmPassword,
            phone: data.phone,
          });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ── Logout ───────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Continue client-side logout even if backend call fails
        }
        localStorage.removeItem('qr_access_token');
        localStorage.removeItem('qr_refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'qr_auth_storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
);