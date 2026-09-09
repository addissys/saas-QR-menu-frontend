import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { adminApi } from '../../api/admin.api';
import { StatCard } from '../../components/dashboard/StatCard';

import {
  Store,
  GitBranch,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: statistics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: adminApi.getDashboard,
  });

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-700">
            Failed to load admin statistics
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Please check your authentication and backend server.
          </p>
        </div>
      </div>
    );
  }

  const tenantCount = statistics?.tenants?.total ?? 0;
  const branchCount = statistics?.branches?.total ?? 0;
  const menuItemsCount = statistics?.menuItems?.total ?? 0;
  const userCount = statistics?.users?.total ?? 0;

  const quickLinks = [
    {
      title: 'Restaurant Tenants Directory',
      description: 'View, onboard, and manage registered restaurant organizations and owners.',
      count: tenantCount,
      path: '/admin/restaurants',
      icon: Store,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Venue Branches',
      description: 'Explore all active and suspended branch locations across tenants.',
      count: branchCount,
      path: '/admin/branches',
      icon: GitBranch,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Global Platform Users',
      description: 'Inspect platform user accounts, authentication states, and assigned roles.',
      count: userCount,
      path: '/admin/users',
      icon: Sparkles,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Global Menu Items',
      description: 'Browse the complete global catalog of dishes and food items.',
      count: menuItemsCount,
      path: '/admin/menu-items',
      icon: UtensilsCrossed,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-2">

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 border border-purple-800 text-purple-300 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="h-3.5 w-3.5" />

          Super Admin Control Plane
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Platform Overview
        </h1>

        <p className="text-xs sm:text-sm text-slate-400">
          Global monitoring of all restaurant tenants, cross-tenant venues, user accounts, and dish catalogs. Click any metric card to inspect its full list.
        </p>

      </div>

      {/* Statistics Cards - Clickable to drill-down */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Restaurant Tenants"
          value={isLoading ? '...' : tenantCount}
          subtitle="Registered businesses"
          icon={Store}
          color="purple"
          onClick={() => navigate('/admin/restaurants')}
          clickableHint="Browse all restaurants"
        />

        <StatCard
          title="Total Venue Branches"
          value={isLoading ? '...' : branchCount}
          subtitle="Active branch locations"
          icon={GitBranch}
          color="blue"
          onClick={() => navigate('/admin/branches')}
          clickableHint="Browse all venues"
        />

        <StatCard
          title="Total Users"
          value={isLoading ? '...' : userCount}
          subtitle="Registered platform users"
          icon={Sparkles}
          color="amber"
          onClick={() => navigate('/admin/users')}
          clickableHint="Browse all users"
        />

        <StatCard
          title="Global Menu Items"
          value={isLoading ? '...' : menuItemsCount}
          subtitle="Cataloged food dishes"
          icon={UtensilsCrossed}
          color="emerald"
          onClick={() => navigate('/admin/menu-items')}
          clickableHint="Browse all dishes"
        />

      </div>

      

      
    </div>
  );
};

