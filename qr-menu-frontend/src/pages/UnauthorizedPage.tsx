import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { getDashboardRouteForRole, getRoleDisplayName, normalizeRole } from '../utils/roles';

export const UnauthorizedPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userDashboard = getDashboardRouteForRole(user?.role);
  const roleName = user ? getRoleDisplayName(user.role) : 'Unauthenticated User';
  const isUnknown = normalizeRole(user?.role) === 'UNKNOWN';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 text-center space-y-6 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="mx-auto w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Access Restricted</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {isUnknown
              ? 'Your account does not have a recognized role assigned. Please sign in with a valid role account.'
              : `Your account role (${roleName}) does not have permission to access the requested route.`}
          </p>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-left space-y-1">
          <div className="text-slate-400 text-[11px]">Current Session:</div>
          <div className="font-semibold text-slate-200 truncate">{user?.fullName || 'Not logged in'}</div>
          <div className="text-[11px] text-amber-400 font-mono">Role: {user?.role || 'None'}</div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {!isUnknown && user && (
            <Button
              variant="primary"
              size="md"
              icon={LayoutDashboard}
              onClick={() => navigate(userDashboard)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20"
            >
              Go to {roleName} Dashboard
            </Button>
          )}

          <Button
            variant="outline"
            size="md"
            icon={LogOut}
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            Sign In as Different Role
          </Button>

          <Link to="/" className="inline-flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white transition-colors pt-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

