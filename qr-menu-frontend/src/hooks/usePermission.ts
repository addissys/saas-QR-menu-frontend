import { useAuthStore } from '../store/useAuthStore';

export const usePermission = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (code: string): boolean =>
    user?.permissions?.includes(code) ?? false;

  const hasAnyPermission = (...codes: string[]): boolean =>
    codes.some((code) => user?.permissions?.includes(code) ?? false);

  return { hasPermission, hasAnyPermission };
};
