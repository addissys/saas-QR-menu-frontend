import React, { useEffect, useState } from 'react';
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
  const fetchTenants = async () => {
    setIsLoading(true);

    try {
      const res = await adminApi.getTenants();

      console.log('Admin tenants response:', res.data);

      /*
       * Backend response is:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: result
       * }
       *
       * result may contain:
       * {
       *   tenants: [],
       *   total: ...,
       *   page: ...,
       *   limit: ...
       * }
       */

      const data = res.data?.data;

      if (Array.isArray(data)) {
        // If backend directly returns an array
        setTenants(data);
      } else if (Array.isArray(data?.tenants)) {
        // If backend returns { tenants: [] }
        setTenants(data.tenants);
      } else {
        // Safety fallback
        setTenants([]);
        console.warn('Unexpected tenants response:', res.data);
      }
    } catch (error) {
      console.error('Failed to load tenants:', error);

      showToast('Failed to load tenants', 'error');

      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // Load tenants when page opens
  // ================================
  useEffect(() => {
    fetchTenants();
  }, []);

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
  // Search tenants
  // ================================
  const filteredTenants = tenants.filter((tenant) =>
    tenant.businessName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search restaurant by business name..."
          icon={Search}
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
        />
      </div>

      {/* ================================
          Tenant Table
      ================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading restaurants...
          </div>
        ) : filteredTenants.length === 0 ? (
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
                  <div className="flex items-center gap-3">

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

                  </div>
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
                  <Button
                    variant={
                      tenant.isActive
                        ? 'outline'
                        : 'primary'
                    }
                    size="sm"
                    onClick={() =>
                      setToggleId(tenant.id)
                    }
                  >
                    {tenant.isActive
                      ? 'Suspend Tenant'
                      : 'Activate Tenant'}
                  </Button>
                ),
              },
            ]}

            data={filteredTenants}
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
