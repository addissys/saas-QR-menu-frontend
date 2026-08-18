import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../api/notification.api';
import { Menu, Bell, User, QrCode, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar, title }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    notificationApi.getAll().then((res) => {
      const unread = res.data.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    }).catch(() => {});
  }, [location.pathname]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs font-sans">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h2 className="text-base font-bold text-slate-800 hidden sm:block">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        {/* Public Menu Preview Button */}
        <Link
          to="/public/branches"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Live Digital Menu</span>
        </Link>

        {/* Notifications Icon with count badge */}
        <Link
          to="/notifications"
          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-xl relative transition-colors"
          title="View Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Link */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 text-xs font-black flex items-center justify-center">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <span className="text-xs font-bold text-slate-700 hidden md:inline">{user?.fullName}</span>
        </Link>
      </div>
    </header>
  );
};

