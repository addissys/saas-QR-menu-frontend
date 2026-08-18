import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin.api';
import { Tenant } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Table as TableUI } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Store, Search, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const AdminRestaurantsPage: React.FC = () => {
  const { showToast } = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toggleId, setToggleId] = useState<string | null>(null);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getTenants();
      setTenants(res.data);
    } catch (err) {
      showToast('Failed to load tenants', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleToggleActive = async () => {
    if (!toggleId) return;
    const tenant = tenants.find((t) => t.id === toggleId);
    if (!tenant) return;

    try {
      await adminApi.toggleTenantActive(toggleId, !tenant.isActive);
      showToast(`Tenant ${!tenant.isActive ? 'activated' : 'deactivated'}`, 'success');
      setToggleId(null);
      fetchTenants();
    } catch (err) {
      showToast('Failed to update tenant status', 'error');
    }
  };

  const filteredTenants = tenants.filter((t) =>
    t.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Restaurant Tenant Directory</h1>
        <p className="text-xs text-slate-500">
          Super admin management for registered restaurant and cafe organizations
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <Input
          placeholder="Search restaurant by business name..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading restaurants...</div>
        ) : (
          <TableUI
            columns={[
              {
                header: 'Restaurant Name',
                accessor: (t: Tenant) => (
                  <div className="flex items-center gap-3">
                    <img
                      src={t.logoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=100&q=80'}
                      alt={t.businessName}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{t.businessName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {t.id}</span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Currency',
                accessor: (t: Tenant) => <span className="font-mono text-xs">{t.currencySymbol || '$'}</span>,
              },
              {
                header: 'Status',
                accessor: (t: Tenant) => (
                  <Badge variant={t.isActive ? 'success' : 'neutral'} size="sm">
                    {t.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                accessor: (t: Tenant) => (
                  <Button
                    variant={t.isActive ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setToggleId(t.id)}
                  >
                    {t.isActive ? 'Suspend Tenant' : 'Activate Tenant'}
                  </Button>
                ),
              },
            ]}
            data={filteredTenants}
          />
        )}
      </div>

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
