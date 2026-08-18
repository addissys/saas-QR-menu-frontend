import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard, GitBranch, UtensilsCrossed, QrCode, Bell } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const links = [
    { label: 'Home', path: user.role === 'SUPER_ADMIN' ? '/admin/dashboard' : '/dashboard', icon: LayoutDashboard },
    { label: 'Branches', path: user.role === 'SUPER_ADMIN' ? '/admin/branches' : '/branches', icon: GitBranch },
    { label: 'Menu', path: user.role === 'SUPER_ADMIN' ? '/admin/menu-items' : '/menu-items', icon: UtensilsCrossed },
    { label: 'QR Codes', path: '/qr-codes', icon: QrCode },
    { label: 'Alerts', path: '/notifications', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 py-2 px-3 flex items-center justify-around lg:hidden shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-purple-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
