import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { tenantApi } from '../../api/tenant.api';
import { branchApi } from '../../api/branch.api';
import { menuItemApi } from '../../api/menu-item.api';
import { tableApi } from '../../api/table.api';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/dashboard/StatCard';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { Button } from '../../components/ui/Button';
import { Store, GitBranch, UtensilsCrossed, Table as TableIcon, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      tenantApi.getProfile(),
      branchApi.getAll(),
      menuItemApi.getAll(),
      tableApi.getAll(),
    ])
      .then(([tRes, bRes, mRes, tblRes]) => {
        setTenant(tRes.data);
        setBranches(bRes.data);
        setMenuItems(mRes.data);
        setTables(tblRes.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const featuredDishes = menuItems.filter((i) => i.isFeatured).slice(0, 3);

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
            value={isLoading ? '...' : assignedBranches.length}
            subtitle={user?.role === 'EXECUTIVE' ? 'Multi-branch scope' : 'Active dining locations'}
            icon={GitBranch}
            color="purple"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Cataloged Dishes"
            value={isLoading ? '...' : menuItems.length}
            subtitle="Active menu items"
            icon={UtensilsCrossed}
            color="blue"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Dining Tables"
            value={isLoading ? '...' : tables.length}
            subtitle="Configured QR tables"
            icon={TableIcon}
            color="emerald"
          />
        </motion.div>
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
          <StatCard
            title="Featured Specials"
            value={isLoading ? '...' : featuredDishes.length}
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

        <MenuGrid items={featuredDishes} isLoading={isLoading} canManage={false} />
      </motion.div>
    </div>
  );
};