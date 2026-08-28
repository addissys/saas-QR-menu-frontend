import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  User,
  ShieldAlert,
  LogOut,
  Sparkles,
  Briefcase,
  UserCheck,
  Users,
} from 'lucide-react';

interface SidebarProps {
  isAdmin?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin = false, onCloseMobile }) => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    if (isAdmin || user?.role === 'SUPER_ADMIN') {
      return [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Tenants Directory', path: '/admin/restaurants', icon: Store },
        { name: 'Global Users', path: '/admin/users', icon: User },
        { name: 'Global Branches', path: '/admin/branches', icon: GitBranch },
        { name: 'Global Menu Items', path: '/admin/menu-items', icon: UtensilsCrossed },
        { name: 'Global Search', path: '/admin/search', icon: Sparkles },
        { name: 'Global Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
      ];
    }

    if (user?.role === 'STAFF') {
      return [
        { name: 'Dishes & Stock Availability', path: '/menu-items', icon: UtensilsCrossed },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ];
    }

    if (user?.role === 'BRANCH_MANAGER') {
      return [
        { name: 'Branch Operations', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Branch Info', path: '/branches', icon: GitBranch },
        { name: 'Staff Management', path: '/staff-members', icon: Users },
        { name: 'Branch Tables', path: '/tables', icon: TableIcon },
        { name: 'QR Codes Generator', path: '/qr-codes', icon: QrCode },
        { name: 'Menu Categories', path: '/categories', icon: FolderTree },
        { name: 'Dishes & Menu Catalog', path: '/menu-items', icon: UtensilsCrossed },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ];
    }

    if (user?.role === 'EXECUTIVE') {
      return [
        { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Assigned Branches', path: '/branches', icon: GitBranch },
        { name: 'Branch Managers', path: '/branch-managers', icon: UserCheck },
        { name: 'Staff Management', path: '/staff-members', icon: Users },
        { name: 'Tables Management', path: '/tables', icon: TableIcon },
        { name: 'QR Codes Generator', path: '/qr-codes', icon: QrCode },
        { name: 'Menu Categories', path: '/categories', icon: FolderTree },
        { name: 'Dishes & Menu Catalog', path: '/menu-items', icon: UtensilsCrossed },
        { name: 'Notifications', path: '/notifications', icon: Bell },
      ];
    }

    // Default: RESTAURANT_OWNER / CAFE_OWNER / OWNER
    return [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Restaurant Info', path: '/restaurants', icon: Store },
      { name: 'Branches', path: '/branches', icon: GitBranch },
      { name: 'Executives', path: '/executives', icon: Briefcase },
      { name: 'Branch Managers', path: '/branch-managers', icon: UserCheck },
      { name: 'Staff Members', path: '/staff-members', icon: Users },
      { name: 'Tables Management', path: '/tables', icon: TableIcon },
      { name: 'QR Codes Generator', path: '/qr-codes', icon: QrCode },
      { name: 'Menu Categories', path: '/categories', icon: FolderTree },
      { name: 'Dishes & Menu Items', path: '/menu-items', icon: UtensilsCrossed },
      { name: 'Notifications', path: '/notifications', icon: Bell },
      { name: 'Audit Trail', path: '/audit-logs', icon: FileSpreadsheet },
    ];
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'RESTAURANT_OWNER':
      case 'OWNER':
        return 'Cafe Owner';
      case 'EXECUTIVE':
        return `Executive (${user.assignedBranchIds?.length || 2} Branches)`;
      case 'BRANCH_MANAGER':
        return 'Branch Manager';
      case 'STAFF':
        return 'Kitchen/Dining Staff';
      default:
        return 'Portal User';
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
