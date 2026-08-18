import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../api/notification.api';
import { Menu, Bell, ExternalLink, User, Lock, LogOut } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    notificationApi.getAll().then((res) => {
      const count = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-none"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-800 hidden sm:inline">
          QR Menu Platform
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Public Menu Preview Button */}
        <NavLink
          to="/public/branches"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-purple-700 hover:bg-purple-50 hover:border-purple-200 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Live Public Menu</span>
        </NavLink>

        {/* Notification Icon */}
        <NavLink
          to="/notifications"
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-600 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </NavLink>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden md:inline">
              {user?.fullName}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150"
              onClick={() => setShowProfileMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{user?.role}</p>
              </div>

              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                Profile Settings
              </NavLink>

              <NavLink
                to="/change-password"
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Change Password
              </NavLink>

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
