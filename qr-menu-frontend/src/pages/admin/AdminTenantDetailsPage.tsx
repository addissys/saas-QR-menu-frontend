import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CheckCircle2, ExternalLink, MapPin, QrCode, Store, Users, UtensilsCrossed, XCircle } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { branchApi } from '../../api/branch.api';
import { menuItemApi } from '../../api/menu-item.api';
import { qrApi } from '../../api/qr.api';
import { tableApi } from '../../api/table.api';
import { Branch, MenuItem, QRCodeConfig, Table, Tenant, User } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table as TableUI } from '../../components/ui/Table';

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : 'Not available');
const EmptyState: React.FC<{ message: string }> = ({ message }) => <div className="p-8 text-center text-sm text-slate-500">{message}</div>;

export const AdminTenantDetailsPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { showToast } = useToast();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [qrCodes, setQrCodes] = useState<QRCodeConfig[]>([]);
  const [tab, setTab] = useState('information');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      setError('Tenant ID is missing.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const selectedTenant = await adminApi.getById(tenantId);
        const [branchResult, userResult, tableResult, menuResult, qrResult] = await Promise.all([
          branchApi.getAll(tenantId),
          adminApi.getUsers(tenantId),
          tableApi.getAll(undefined, tenantId),
          menuItemApi.getAll(undefined, undefined, tenantId),
          qrApi.getAll(tenantId),
        ]);
        const branchIds = new Set(branchResult.data.map((branch) => branch.id));
        setTenant(selectedTenant);
        setBranches(branchResult.data.filter((branch) => branch.tenantId === tenantId));
        setUsers(userResult.data);
        setTables(tableResult.data.filter((table) => branchIds.has(table.branchId)));
        setMenuItems(menuResult.data.filter((item) => item.tenantId === tenantId || (item.branchId ? branchIds.has(item.branchId) : false)));
        setQrCodes(qrResult.data.filter((qr) => branchIds.has(qr.branchId)));
      } catch (loadError) {
        console.error('Failed to load tenant details:', loadError);
        setTenant(null);
        setError('This tenant could not be loaded. It may not exist or you may not have access to it.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [tenantId]);

  const toggleTenant = async () => {
    if (!tenant) return;
    setUpdating(true);
    try {
      const updated = await adminApi.toggleTenantActive(tenant.id, !tenant.isActive);
      setTenant(updated);
      setConfirming(false);
      showToast(`Tenant ${updated.isActive ? 'activated' : 'suspended'}`, 'success');
    } catch (toggleError) {
      console.error('Failed to update tenant status:', toggleError);
      showToast('Failed to update tenant status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const branchNames = new Map(branches.map((branch) => [branch.id, branch.name]));
  const tabs = [
    ['information', 'Restaurant Information', Store],
    ['branches', 'Branches', Building2],
    ['users', 'Users / Staff', Users],
    ['tables', 'Tables', MapPin],
    ['menu', 'Menu Items', UtensilsCrossed],
    ['qr', 'QR Codes', QrCode],
  ] as const;

  if (loading) return <div className="p-10 text-center text-sm text-slate-500">Loading tenant details...</div>;
  if (error || !tenant) return <div className="space-y-5"><Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm font-semibold text-purple-700"><ArrowLeft className="h-4 w-4" /> Back to Tenants</Link><div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">{error || 'Tenant not found.'}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-purple-700"><ArrowLeft className="h-4 w-4" /> Back to Tenants</Link>
        <Button variant={tenant.isActive ? 'outline' : 'primary'} size="sm" disabled={updating} onClick={() => setConfirming(true)}>{tenant.isActive ? 'Suspend Tenant' : 'Activate Tenant'}</Button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-4">
          <img src={tenant.logoUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=160&q=80'} alt={tenant.businessName} className="h-20 w-20 rounded-2xl object-cover bg-slate-100" />
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-purple-600">Tenant Overview</p><h1 className="truncate text-2xl font-bold text-slate-900">{tenant.businessName}</h1><p className="mt-1 break-all font-mono text-xs text-slate-500">{tenant.id}</p></div>
          <div className="flex items-center gap-3"><div className="text-right"><p className="text-xs text-slate-500">Currency</p><p className="font-semibold text-slate-900">{tenant.currencySymbol || 'Not available'}</p></div><Badge variant={tenant.isActive ? 'success' : 'neutral'} size="sm">{tenant.isActive ? 'Active' : 'Suspended'}</Badge></div>
        </div>
        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3"><div><p className="text-xs text-slate-500">Created</p><p className="font-semibold">{formatDate(tenant.createdAt)}</p></div><div><p className="text-xs text-slate-500">Email</p><p className="break-words font-semibold">{tenant.email || 'Not available'}</p></div><div><p className="text-xs text-slate-500">Phone</p><p className="font-semibold">{tenant.phone || 'Not available'}</p></div></div>
      </section>

      <div className="overflow-x-auto border-b border-slate-200"><div className="flex min-w-max gap-1">{tabs.map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setTab(id)} className={`inline-flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold ${tab === id ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}><Icon className="h-4 w-4" />{label}</button>)}</div></div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {tab === 'information' && <div className="grid gap-5 p-6 sm:grid-cols-2">{[['Restaurant name', tenant.businessName], ['Email', tenant.email || 'Not available'], ['Phone', tenant.phone || 'Not available'], ['Address', [tenant.address, tenant.city, tenant.country].filter(Boolean).join(', ') || 'Not available'], ['Currency', tenant.currencySymbol || 'Not available'], ['Status', tenant.isActive ? 'Active' : 'Suspended'], ['Owner', tenant.ownerName || 'Not available'], ['Created date', formatDate(tenant.createdAt)]].map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p></div>)}{tenant.description && <div className="sm:col-span-2"><p className="text-xs text-slate-500">Description</p><p className="mt-1 text-sm text-slate-700">{tenant.description}</p></div>}</div>}
        {tab === 'branches' && (branches.length ? <TableUI columns={[{ header: 'Branch', accessor: (branch) => <><p className="font-semibold text-slate-900">{branch.name}</p><p className="text-[11px] text-slate-500">{branch.city || 'No city'}</p></> }, { header: 'Address', accessor: (branch) => branch.address || 'Not available' }, { header: 'Phone', accessor: (branch) => branch.phone || 'Not available' }, { header: 'Status', accessor: (branch) => <Badge variant={branch.isActive === false ? 'neutral' : 'success'} size="sm">{branch.isActive === false ? 'Inactive' : 'Active'}</Badge> }]} data={branches} /> : <EmptyState message="This tenant has no branches." />)}
        {tab === 'users' && (users.length ? <TableUI columns={[{ header: 'Name', accessor: (user) => <><p className="font-semibold text-slate-900">{user.fullName}</p><p className="text-[11px] text-slate-500">{user.email}</p></> }, { header: 'Role', accessor: (user) => user.role || 'Not available' }, { header: 'Branch', accessor: (user) => user.branchId ? branchNames.get(user.branchId) || 'Unknown branch' : 'Owner / all branches' }, { header: 'Status', accessor: (user) => <Badge variant={user.isActive ? 'success' : 'neutral'} size="sm">{user.isActive ? 'Active' : 'Inactive'}</Badge> }]} data={users} /> : <EmptyState message="This tenant has no users or staff." />)}
        {tab === 'tables' && (tables.length ? <TableUI columns={[{ header: 'Table', accessor: (table) => <span className="font-semibold text-slate-900">{table.tableNumber}</span> }, { header: 'Branch', accessor: (table) => branchNames.get(table.branchId) || 'Unknown branch' }, { header: 'Capacity', accessor: (table) => table.seatingCapacity ?? table.capacity ?? 'Not available' }, { header: 'QR', accessor: (table) => table.qrCodeUrl ? <a href={table.qrCodeUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4 text-purple-700" /></a> : 'Not generated' }, { header: 'Status', accessor: (table) => <Badge variant={table.isActive === false ? 'neutral' : 'success'} size="sm">{table.isActive === false ? 'Inactive' : 'Active'}</Badge> }]} data={tables} /> : <EmptyState message="This tenant has no tables." />)}
        {tab === 'menu' && (menuItems.length ? <TableUI columns={[{ header: 'Menu item', accessor: (item) => <span className="font-semibold text-slate-900">{item.name}</span> }, { header: 'Category', accessor: (item) => item.categoryName || 'Uncategorized' }, { header: 'Price', accessor: (item) => `${tenant.currencySymbol || '$'} ${item.price.toFixed(2)}` }, { header: 'Branch', accessor: (item) => branchNames.get(item.branchId || '') || 'Unknown branch' }, { header: 'Availability', accessor: (item) => item.isAvailable ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-slate-400" /> }, { header: 'Featured', accessor: (item) => item.isFeatured ? 'Yes' : 'No' }]} data={menuItems} /> : <EmptyState message="This tenant has no menu items." />)}
        {tab === 'qr' && (qrCodes.length ? <TableUI columns={[{ header: 'Table', accessor: (qr) => qr.tableNumber || 'Not available' }, { header: 'Branch', accessor: (qr) => qr.branchName || branchNames.get(qr.branchId) || 'Unknown branch' }, { header: 'Status', accessor: (qr) => <Badge variant={qr.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">{qr.status || 'Unknown'}</Badge> }, { header: 'Public URL', accessor: (qr) => qr.publicUrl ? <a href={qr.publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-purple-700">Open <ExternalLink className="h-3 w-3" /></a> : 'Not available' }]} data={qrCodes} /> : <EmptyState message="This tenant has no QR codes." />)}
      </section>
      <ConfirmModal isOpen={confirming} onClose={() => setConfirming(false)} onConfirm={toggleTenant} title="Toggle Tenant Account Status" message="Are you sure you want to change the active status of this restaurant tenant?" confirmText="Confirm Status Change" />
    </div>
  );
};
