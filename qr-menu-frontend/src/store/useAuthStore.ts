import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      initAuth: async () => {
        const { token, user } = get();
        if (token && user) {
          // Already rehydrated from localStorage by persist middleware
          set({ isLoading: false });
          return;
        }
        try {
          // Load default/mock user when no token exists
          const res = await authApi.getCurrentUser();
          set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email: string, pass: string) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login(email, pass);
          set({
            user: res.data.user,
            token: res.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: any) => {
        set({ isLoading: true });
        try {
          const res = await authApi.register(data);
          set({
            user: res.data.user,
            token: res.data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'qr_auth_storage',
      // Only persist user and token to localStorage; keep loading state fresh
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Once rehydration completes, mark loading as false
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
