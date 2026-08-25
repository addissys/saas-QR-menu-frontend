import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleProtectedRoute } from './routes/RoleProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import { ToastRenderer } from './components/ui/ToastRenderer';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Public Menu Pages
import { PublicBranchesPage } from './pages/public/PublicBranchesPage';
import { PublicMenuPage } from './pages/public/PublicMenuPage';

// Tenant Management Pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { RestaurantProfilePage } from './pages/restaurants/RestaurantProfilePage';
import { BranchesListPage } from './pages/branches/BranchesListPage';
import { TablesListPage } from './pages/tables/TablesListPage';
import { QRCodesPage } from './pages/qr/QRCodesPage';
import { CategoriesListPage } from './pages/categories/CategoriesListPage';
import { MenuItemsListPage } from './pages/menu-items/MenuItemsListPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { AuditLogsPage } from './pages/audit-logs/AuditLogsPage';
import { UserProfilePage } from './pages/Profile/UserProfilePage';
import { ChangePasswordPage } from './pages/Profile/ChangePasswordPage';

// Super Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminRestaurantsPage } from './pages/admin/AdminRestaurantsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBranchesPage } from './pages/admin/AdminBranchesPage';
import { AdminMenuItemsPage } from './pages/admin/AdminMenuItemsPage';
import { AdminSearchPage } from './pages/admin/AdminSearchPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Initialize auth state once on app mount (replaces the old AuthProvider useEffect)
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      {/* Global toast notification renderer — reads from Zustand store, no provider needed */}
      <ToastRenderer />
      <Routes>
        {/* 1. Public Marketing Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 2. Public QR Digital Menu Links */}
        <Route path="/public/branches" element={<PublicBranchesPage />} />
        <Route path="/public/branches/:branchId/menu" element={<PublicMenuPage />} />
        <Route path="/public/branches/:branchId/categories" element={<PublicMenuPage />} />
        <Route path="/public/branches/:branchId/tables/:tableId/menu" element={<PublicMenuPage />} />
        <Route path="/public/branches/:branchId/menu-items/:menuItemId" element={<PublicMenuPage />} />
        <Route path="/public/search" element={<PublicBranchesPage />} />

        {/* 3. Tenant Dashboard Management Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/restaurants" element={<RestaurantProfilePage />} />
          <Route path="/branches" element={<BranchesListPage />} />
          <Route path="/tables" element={<TablesListPage />} />
          <Route path="/qr-codes" element={<QRCodesPage />} />
          <Route path="/categories" element={<CategoriesListPage />} />
          <Route path="/menu-items" element={<MenuItemsListPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* 4. Super Admin Management Routes */}
        <Route
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminLayout />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/branches" element={<AdminBranchesPage />} />
          <Route path="/admin/menu-items" element={<AdminMenuItemsPage />} />
          <Route path="/admin/search" element={<AdminSearchPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>

        {/* 5. Fallback 404 Route */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

