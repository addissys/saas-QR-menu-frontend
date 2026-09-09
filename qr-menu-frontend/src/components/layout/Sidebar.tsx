import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { normalizeRole } from '../../utils/roles';
import {
  LayoutDashboard,
  Store,
  GitBranch,
  Table as TableIcon,
  QrCode,
  FolderTree,
  UtensilsCrossed,
  Bell,
  FileSpreadsheet,
  ShieldAlert,
  LogOut,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { hasPermission, hasAnyPermission } = usePermission();
  const normalizedRole = normalizeRole(user?.role);

  const getNavItems = () => {
    if (isAdmin || normalizedRole === 'SUPER_ADMIN') {
      return [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Tenants Directory', path: '/admin/restaurants', icon: Store },
        { name: 'Role Management', path: '/admin/roles', icon: ShieldAlert },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileSpreadsheet },
      ];
    }

    const items: { name: string; path: string; icon: typeof LayoutDashboard }[] = [];

    // Dashboard — always visible
    items.push({ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard });

    // Restaurant Info — owner roles or tenant permissions
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER'].includes(normalizedRole) || hasAnyPermission('tenants.read', 'tenants.update', 'tenants.create')) {
      items.push({ name: 'Restaurant Info', path: '/restaurants', icon: Store });
    }

    // Branches
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('branches.read', 'branches.create', 'branches.update', 'branches.delete')) {
      items.push({ name: 'Branches', path: '/branches', icon: GitBranch });
    }

    // User Management
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('users.read', 'users.create', 'users.update', 'users.delete', 'users.manage_permissions')) {
      items.push({ name: 'User Management', path: '/staff-members', icon: Users });
    }

    // Tables
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('tables.read', 'tables.create', 'tables.update', 'tables.delete')) {
      items.push({ name: 'Tables Management', path: '/tables', icon: TableIcon });
    }

    // QR Codes
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('qr_codes.read', 'qr_codes.create', 'qr_codes.delete')) {
      items.push({ name: 'QR Codes Generator', path: '/qr-codes', icon: QrCode });
    }

    // Categories
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('categories.read', 'categories.create', 'categories.update', 'categories.delete')) {
      items.push({ name: 'Menu Categories', path: '/categories', icon: FolderTree });
    }

    // Dishes & Menu Catalog — visible when user has any menu_items permission or has a management role
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(normalizedRole) || hasAnyPermission('menu_items.read', 'menu_items.create', 'menu_items.update', 'menu_items.delete', 'menu_items.toggle_availability', 'menu_items.toggle_featured')) {
      items.push({ name: 'Dishes & Menu Catalog', path: '/menu-items', icon: UtensilsCrossed });
    }

    // Notifications — always visible
    items.push({ name: 'Notifications', path: '/notifications', icon: Bell });

    // Audit Trail — owner roles or audit log permission
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER'].includes(normalizedRole) || hasPermission('audit_logs.read')) {
      items.push({ name: 'Audit Trail', path: '/audit-logs', icon: FileSpreadsheet });
    }

    return items;
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (normalizeRole(user?.role)) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'CAFE_OWNER':
        return 'Owner';
      case 'EXECUTIVE':
        return 'Executive';
      case 'BRANCH_MANAGER':
        return 'Branch Manager';
      case 'STAFF':
        return 'Staff';
      default:
        return 'Unknown Role';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight">QR DineMenu</h1>
            <p className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
              {getRoleLabel()}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-900 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
