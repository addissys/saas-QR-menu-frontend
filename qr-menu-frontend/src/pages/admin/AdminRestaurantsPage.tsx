import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin.api';
import { Tenant } from '../../types';
import { useToast } from '../../hooks/useToast';

import { Table as TableUI } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

import { Search } from 'lucide-react';

export const AdminRestaurantsPage: React.FC = () => {
  const { showToast } = useToast();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toggleId, setToggleId] = useState<string | null>(null);

  // ================================
  // Get tenants from backend
  // ================================
  const fetchTenants = useCallback(async () => {
    setIsLoading(true);

    try {
      const tenants = await adminApi.getTenants();

      console.log('Admin tenants response:', tenants);

      if (Array.isArray(tenants)) {
        setTenants(tenants);
      } else {
        setTenants([]);
        console.warn('Unexpected tenants response:', tenants);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);

      showToast('Failed to load tenants', 'error');

      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // ================================
  // Load tenants when page opens
  // ================================
  useEffect(() => {
    let isMounted = true;

    const loadTenants = async () => {
      if (!isMounted) return;
      await fetchTenants();
    };

    void loadTenants();

    return () => {
      isMounted = false;
    };
  }, [fetchTenants]);

  // ================================
  // Toggle tenant status
  // ================================
  const handleToggleActive = async () => {
    if (!toggleId) return;

    const tenant = tenants.find(
      (tenant) => tenant.id === toggleId
    );

    if (!tenant) return;

    try {
      await adminApi.toggleTenantActive(
        toggleId,
        !tenant.isActive
      );

      showToast(
        `Tenant ${
          !tenant.isActive
            ? 'activated'
            : 'deactivated'
        }`,
        'success'
      );

      setToggleId(null);

      // Reload tenants
      await fetchTenants();

    } catch (error) {
      console.error(
        'Failed to update tenant status:',
        error
      );

      showToast(
        'Failed to update tenant status',
        'error'
      );
    }
  };

  // ================================
  // Search all tenants through the admin search endpoint
  // ================================
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      await fetchTenants();
      return;
    }

    setIsLoading(true);

    try {
      const results = await adminApi.search(query);
      setTenants(results.tenants);
    } catch (error) {
      console.error('Failed to search tenants:', error);
      showToast('Failed to search tenants', 'error');
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================================
          Page Header
      ================================= */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">
          Restaurant Tenant Directory
        </h1>

        <p className="text-xs text-slate-500">
          Super admin management for registered
          restaurant and cafe organizations
        </p>
      </div>

      {/* ================================
          Search
      ================================= */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-2"
      >
        <Input
          placeholder="Search all restaurant tenants..."
          icon={Search}
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
        />

        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {/* ================================
          Tenant Table
      ================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading restaurants...
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            {searchQuery
              ? 'No restaurants found.'
              : 'No restaurant tenants available.'}
          </div>
        ) : (
          <TableUI
            columns={[
              {
                header: 'Restaurant Name',

                accessor: (tenant: Tenant) => (
                  <Link to={`/admin/restaurants/${tenant.id}`} className="flex items-center gap-3 hover:opacity-80">

                    <img
                      src={
                        tenant.logoUrl ||
                        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={tenant.businessName}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                    />

                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {tenant.businessName}
                      </p>

                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {tenant.id}
                      </span>
                    </div>

                  </Link>
                ),
              },

              {
                header: 'Currency',

                accessor: (tenant: Tenant) => (
                  <span className="font-mono text-xs">
                    {tenant.currencySymbol || '$'}
                  </span>
                ),
              },

              {
                header: 'Status',

                accessor: (tenant: Tenant) => (
                  <Badge
                    variant={
                      tenant.isActive
                        ? 'success'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {tenant.isActive
                      ? 'Active'
                      : 'Suspended'}
                  </Badge>
                ),
              },

              {
                header: 'Actions',

                accessor: (tenant: Tenant) => (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/admin/restaurants/${tenant.id}`} className="text-xs font-semibold text-purple-700 hover:text-purple-900">View Details</Link>
                    <Button variant={tenant.isActive ? 'outline' : 'primary'} size="sm" onClick={() => setToggleId(tenant.id)}>
                      {tenant.isActive ? 'Suspend Tenant' : 'Activate Tenant'}
                    </Button>
                  </div>
                ),
              },
            ]}

            data={tenants}
          />
        )}
      </div>

      {/* ================================
          Confirmation Modal
      ================================= */}
      <ConfirmModal
        isOpen={!!toggleId}
        onClose={() => setToggleId(null)}
        onConfirm={handleToggleActive}
        title="Toggle Tenant Account Status"
        message="Are you sure you want to change the active status of this restaurant tenant?"
        confirmText="Confirm Status Change"
      />

    </div>
  );
};
