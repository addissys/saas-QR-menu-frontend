import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../../components/ui/Badge';
import { User, Mail, Phone, ShieldCheck, Store } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile Settings</h1>
        <p className="text-xs text-slate-500">Personal identity and tenant access privileges</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="pt-2">
              <Badge variant="purple" size="sm">{user?.role}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Phone className="h-4 w-4 text-slate-400" /> Phone Number
            </span>
            <span className="font-bold text-slate-900">{user?.phone || 'Not configured'}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <Store className="h-4 w-4 text-slate-400" /> Organization ID
            </span>
            <span className="font-mono font-bold text-slate-900">{user?.tenantId || 'Super Admin'}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-slate-500 flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-slate-400" /> Status
            </span>
            <Badge variant="success" size="sm">Active Account</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};