import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { tenantApi } from '../../api/tenant.api';
import { branchApi } from '../../api/branch.api';
import { menuItemApi } from '../../api/menu-item.api';
import { tableApi } from '../../api/table.api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { normalizeRole } from '../../utils/roles';
import { StatCard } from '../../components/dashboard/StatCard';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { Button } from '../../components/ui/Button';
import {
  Store,
  GitBranch,
  UtensilsCrossed,
  Table as TableIcon,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Building,
  ArrowRight,
  User,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tenant, setTenant] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTenant, setHasTenant] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoading(true);

    // Step 1: Check if user has a tenant profile
    tenantApi
      .getProfile()
      .then((tRes) => {
        const tenantData = tRes.data;
        setTenant(tenantData);

        if (!tenantData) {
          // New user — no tenant — show onboarding
          setHasTenant(false);
          setIsLoading(false);
          return;
        }

        // Step 2: Tenant exists — load full dashboard data
        setHasTenant(true);
        return Promise.all([
          branchApi.getAll(),
          menuItemApi.getAll(),
          tableApi.getAll(),
        ]).then(([bRes, mRes, tblRes]) => {
          setBranches(Array.isArray(bRes.data) ? bRes.data : []);
          setMenuItems(Array.isArray(mRes.data) ? mRes.data : []);
          setTables(Array.isArray(tblRes.data) ? tblRes.data : []);
        });
      })
      .catch(() => {
        setTenant(null);
        setHasTenant(false);
        setBranches([]);
        setMenuItems([]);
        setTables([]);
      })
      .finally(() => setIsLoading(false));
  }, [showToast]);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // ── NEW USER ONBOARDING VIEW ─────────────────────────────────────────────────
  if (hasTenant === false) {
    const normalizedUserRole = normalizeRole(user?.role);
    const canCreateRestaurant =
      normalizedUserRole === 'SUPER_ADMIN' || normalizedUserRole === 'CAFE_OWNER';

    const joinedDate = user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Recently';

    if (!canCreateRestaurant) {
      return (
        <div className="space-y-8 font-sans max-w-4xl mx-auto">
          {/* Staff/Executive Notice Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-500/10 border border-slate-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="inline-flex p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/25"
              >
                <ShieldCheck className="h-7 w-7" />
              </motion.div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome, {user?.fullName || 'there'}!
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Your account is active. You are currently not assigned to an active restaurant branch.
                Please reach out to your restaurant owner or administrator to configure your branch assignment.
              </p>
            </div>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8"
          >
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Your Account Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {user?.fullName || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {user?.email || '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Account Role
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {user?.role?.replace(/_/g, ' ') || 'Staff Member'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Member Since
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{joinedDate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    const setupSteps = [
      {
        step: 1,
        title: 'Create Your Restaurant',
        description: 'Set up your business name, contact info, and branding',
        icon: Store,
        active: true,
      },
      {
        step: 2,
        title: 'Add Branch Locations',
        description: 'Configure your physical dining venues',
        icon: Building,
        active: false,
      },
      {
        step: 3,
        title: 'Build Your Menu',
        description: 'Add categories, dishes, and QR codes',
        icon: UtensilsCrossed,
        active: false,
      },
    ];

    return (
      <div className="space-y-8 font-sans max-w-4xl mx-auto">
        {/* Welcome Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-amber-500/10 border border-slate-800 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-600/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-lg shadow-amber-500/25"
            >
              <Sparkles className="h-7 w-7" />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome, {user?.fullName || 'there'}!
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Your account is ready. Let's get your restaurant set up so customers can start
              scanning QR codes and browsing your digital menu.
            </p>

            <Link to="/restaurants">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block mt-2"
              >
                <Button
                  variant="primary"
                  size="lg"
                  icon={Store}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20 text-sm sm:text-base"
                >
                  Create Your Restaurant
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Your Account Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            {/* Full Name */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {user?.fullName || '—'}
                </p>
              </div>
            </div>

            {/* Email Address */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {user?.email || '—'}
                </p>
              </div>
            </div>

            {/* Account Role */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Account Role
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {user?.role?.replace(/_/g, ' ') || 'Cafe Owner'}
                </p>
              </div>
            </div>

            {/* Joined Date */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{joinedDate}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Setup Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Getting Started
            </h2>
          </div>

          <div className="mt-5 space-y-3">
            {setupSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + idx * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    step.active
                      ? 'bg-amber-50/60 border-amber-200/80 shadow-sm'
                      : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-black shrink-0 ${
                      step.active
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold ${
                        step.active ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                  </div>
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      step.active
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-slate-200/50 text-slate-400'
                    }`}
                  >
                    <StepIcon className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── EXISTING USER FULL DASHBOARD ─────────────────────────────────────────────
  const featuredDishes = Array.isArray(menuItems)
    ? menuItems.filter((i) => i.isFeatured).slice(0, 3)
    : [];

  // Filter branches based on assigned ids
  const assignedBranches =
    user?.assignedBranchIds && user.assignedBranchIds.length > 0
      ? branches.filter((b) => user.assignedBranchIds?.includes(b.id))
      : branches;

  const getRoleHeader = () => {
    switch (user?.role) {
      case 'RESTAURANT_OWNER':
      case 'OWNER':
        return {
          title: 'Cafe Owner Operations Center',
          subtitle: 'Full administrative authority across all branches, menu categories, tables, and audit trail logs.',
          badge: 'Cafe Owner',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'EXECUTIVE':
        return {
          title: 'Executive Multi-Branch Dashboard',
          subtitle: `Monitoring ${assignedBranches.length} assigned branch locations: ${assignedBranches.map((b) => b.name).join(', ')}.`,
          badge: `Executive (${assignedBranches.length} Branches)`,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'BRANCH_MANAGER':
        return {
          title: 'Branch Operations Portal',
          subtitle: `Managing branch operations, table QR codes, and local categories for ${assignedBranches[0]?.name || 'assigned location'}.`,
          badge: 'Branch Manager',
          color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        };
      case 'STAFF':
        return {
          title: 'Kitchen & Operational Staff Portal',
          subtitle: 'Fast real-time toggling of dish inventory availability (In Stock / Sold Out) and customer service notifications.',
          badge: 'Kitchen Staff',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        };
      default:
        return {
          title: 'Restaurant Management Dashboard',
          subtitle: 'Monitor active branches, digital QR menus, table configurations, and dish catalogs across your account.',
          badge: 'SaaS Tenant',
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
    }
  };

  const roleInfo = getRoleHeader();

  return (
    <div className="space-y-8 font-sans">
      {/* Banner with Animated Depth */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 border border-slate-800 space-y-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-amber-400 rounded-full text-xs font-bold shadow-xs">
                <Store className="h-3.5 w-3.5" />
                {tenant?.businessName || 'Artisan Bistro'}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 border rounded-full text-xs font-extrabold ${roleInfo.color}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {roleInfo.badge}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{roleInfo.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">{roleInfo.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link to="/qr-codes">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="primary" size="sm" icon={QrCode} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-500/20">
                  Generate QR Codes
                </Button>
              </motion.div>
            </Link>
            <Link to="/public/branches" target="_blank">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="sm" icon={ExternalLink} className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
                  View Guest Menu
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Branch Manager Assigned Branch Card */}
      {user?.role === 'BRANCH_MANAGER' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Assigned Branch</h2>
                <p className="text-xs text-slate-500">Read-only operational venue details</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full border border-sky-200">
              Assigned Venue
            </span>
          </div>

          {assignedBranches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Branch</p>
                <p className="text-base font-black text-slate-900 mt-1">{assignedBranches[0]?.name}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {assignedBranches[0]?.address}
                  {assignedBranches[0]?.city ? `, ${assignedBranches[0].city}` : ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-sm font-semibold text-slate-600">No branch is currently assigned to your account.</p>
              <p className="text-xs text-slate-400 mt-1">Please contact your administrator to assign a branch venue.</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Cards with Hover Elevation */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Assigned Branches"
            value={assignedBranches.length}
            subtitle={user?.role === 'EXECUTIVE' ? 'Multi-branch scope' : 'Active dining locations'}
            icon={GitBranch}
            color="purple"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Cataloged Dishes"
            value={menuItems.length}
            subtitle="Active menu items"
            icon={UtensilsCrossed}
            color="blue"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Dining Tables"
            value={tables.length}
            subtitle="Configured QR tables"
            icon={TableIcon}
            color="emerald"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Featured Specials"
            value={featuredDishes.length}
            subtitle="Chef's special items"
            icon={Store}
            color="amber"
          />
        </motion.div>
      </motion.div>

      {/* Chef Specials Preview */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Chef's Featured Specials</h2>
          <Link to="/menu-items" className="text-xs font-bold text-amber-600 hover:underline">
            Manage All Dishes &rarr;
          </Link>
        </div>

        <MenuGrid items={featuredDishes} isLoading={false} canManage={false} />
      </motion.div>
    </div>
  );
};
