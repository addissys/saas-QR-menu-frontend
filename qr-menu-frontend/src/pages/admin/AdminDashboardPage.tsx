import React, { useEffect, useState } from 'react';
import { tenantApi } from '../../api/tenant.api';
import { branchApi } from '../../api/branch.api';
import { menuItemApi } from '../../api/menu-item.api';
import { StatCard } from '../../components/dashboard/StatCard';
import { Store, GitBranch, UtensilsCrossed, ShieldAlert, Sparkles } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([tenantApi.getAll(), branchApi.getAll(), menuItemApi.getAll()])
      .then(([tRes, bRes, mRes]) => {
        setTenants(tRes.data);
        setBranches(bRes.data);
        setMenuItems(mRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-800 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-3.5 w-3.5" /> Super Admin Control Plane
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Platform Overview</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Global monitoring of all restaurant tenants, cross-tenant venues, and dish catalogs
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Restaurant Tenants"
          value={isLoading ? '...' : tenants.length}
          subtitle="Registered businesses"
          icon={Store}
          color="purple"
        />
        <StatCard
          title="Total Venue Branches"
          value={isLoading ? '...' : branches.length}
          subtitle="Active branch locations"
          icon={GitBranch}
          color="blue"
        />
        <StatCard
          title="Global Menu Items"
          value={isLoading ? '...' : menuItems.length}
          subtitle="Cataloged food dishes"
          icon={UtensilsCrossed}
          color="emerald"
        />
        <StatCard
          title="Platform Version"
          value="v1.0 Free"
          subtitle="All features unlocked"
          icon={Sparkles}
          color="amber"
        />
      </div>
    </div>
  );
};
