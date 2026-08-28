import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { adminApi } from '../../api/admin.api';

import { StatCard } from '../../components/dashboard/StatCard';

import {
  Store,
  GitBranch,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    data: statistics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: adminApi.getStatistics,
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
          Global monitoring of all restaurant tenants,
          cross-tenant venues, and dish catalogs
        </p>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Restaurant Tenants"
          value={
            isLoading
              ? '...'
              : statistics?.tenants?.total ?? 0
          }
          subtitle="Registered businesses"
          icon={Store}
          color="purple"
        />

        <StatCard
          title="Total Venue Branches"
          value={
            isLoading
              ? '...'
              : statistics?.branches?.total ?? 0
          }
          subtitle="Active branch locations"
          icon={GitBranch}
          color="blue"
        />

        <StatCard
          title="Global Menu Items"
          value={
            isLoading
              ? '...'
              : statistics?.menuItems?.total ?? 0
          }
          subtitle="Cataloged food dishes"
          icon={UtensilsCrossed}
          color="emerald"
        />

        <StatCard
          title="Total Users"
          value={
            isLoading
              ? '...'
              : statistics?.users?.total ?? 0
          }
          subtitle="Registered platform users"
          icon={Sparkles}
          color="amber"
        />

      </div>
    </div>
  );
};

