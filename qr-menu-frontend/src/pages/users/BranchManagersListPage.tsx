import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { userApi } from '../../api/user.api';
import { branchApi } from '../../api/branch.api';
import { User, Branch } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserCheck, Plus, Edit2, Trash2, Mail, Phone, GitBranch, Shield, Store } from 'lucide-react';
import { normalizeRole } from '../../utils/roles';

export const BranchManagersListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [managers, setManagers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [assignedBranchId, setAssignedBranchId] = useState('');

  const normalizedRole = normalizeRole(user?.role);
  const isCafeOwner =
    normalizedRole === 'CAFE_OWNER' ||
    normalizedRole === 'OWNER' ||
    normalizedRole === 'RESTAURANT_OWNER' ||
    normalizedRole === 'SUPER_ADMIN';
  const isExecutive = normalizedRole === 'EXECUTIVE';

  // Cafe Owners and Super Admins can see ALL branches.
  // Executives only see the branches they are assigned to.
  const allowedBranches = branches.filter((b) => {
    if (isCafeOwner) return true;
    if (isExecutive) return user?.assignedBranchIds?.includes(b.id);
    return false;
  });

  // Cafe Owners can always create. Executives need at least one assigned branch.
  const canCreate = isCafeOwner || (isExecutive && allowedBranches.length > 0);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [mgrRes, branchRes] = await Promise.all([
        userApi.getBranchManagers(branchFilter !== 'all' ? branchFilter : undefined),
        branchApi.getAll(),
      ]);
      setManagers(mgrRes.data);
      setBranches(branchRes.data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load branch managers';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [branchFilter]);

  const openCreateModal = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    // Preselect currently selected branch filter if available
    const initialBranchId =
      branchFilter !== 'all' && allowedBranches.some((b) => b.id === branchFilter)
        ? branchFilter
        : allowedBranches[0]?.id || '';
    setAssignedBranchId(initialBranchId);
    setIsCreateOpen(true);
  };

  const openEditModal = (mgr: User) => {
    setSelectedManager(mgr);
    setFullName(mgr.fullName);
    setEmail(mgr.email);
    setPhone(mgr.phone || '');
    setAssignedBranchId(mgr.assignedBranchIds?.[0] || allowedBranches[0]?.id || '');
    setIsEditOpen(true);
  };

  const openDeleteModal = (mgr: User) => {
    setSelectedManager(mgr);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !assignedBranchId) {
      showToast('Please fill all required fields and select a branch', 'error');
      return;
    }
    if (!password || password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await userApi.createBranchManager({
        fullName,
        email,
        phone,
        password,
        role: 'BRANCH_MANAGER',
        assignedBranchIds: [assignedBranchId],
      });
      showToast(`Branch Manager ${fullName} created successfully`, 'success');
      setIsCreateOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create branch manager';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager || !assignedBranchId) return;

    setIsSubmitting(true);
    try {
      await userApi.updateBranchManager(selectedManager.id, {
        fullName,
        email,
        phone,
        assignedBranchIds: [assignedBranchId],
      });
      showToast('Branch Manager updated successfully', 'success');
      setIsEditOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update branch manager';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedManager) return;
    setIsSubmitting(true);
    try {
      await userApi.deleteBranchManager(selectedManager.id);
      showToast(`Branch Manager ${selectedManager.fullName} deactivated`, 'success');
      setIsDeleteOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to deactivate branch manager';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Branch Managers
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isExecutive
              ? 'Manage branch leadership across your assigned regional branch locations.'
              : 'Appoint, govern, and assign branch managers responsible for on-site operations and local staff.'}
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openCreateModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
          >
            Add Branch Manager
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter By Location:</span>
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            options={[
              { value: 'all', label: `All Authorized Branches (${allowedBranches.length})` },
              ...allowedBranches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3">
          <span>{errorMessage}</span>
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs shrink-0">
            Retry
          </Button>
        </div>
      )}

      {/* Grid List */}
      {(() => {
        const filteredManagers = managers.filter((mgr) => {
          if (branchFilter === 'all') return true;
          return (
            mgr.branchId === branchFilter ||
            mgr.assignedBranchIds?.includes(branchFilter)
          );
        });

        if (isLoading) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-3xl" />
              ))}
            </div>
          );
        }

        if (filteredManagers.length === 0) {
          return (
            <EmptyState
              icon={UserCheck}
              title={branchFilter !== 'all' ? 'No Branch Managers Yet' : 'No Branch Managers Found'}
              description={
                branchFilter !== 'all'
                  ? 'There are no branch managers assigned to this branch location yet.'
                  : 'There are no branch managers found in your authorized jurisdiction yet.'
              }
              actionText={canCreate ? '+ Add Branch Manager' : undefined}
              onAction={openCreateModal}
            />
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredManagers.map((mgr) => {
              const assignedBranch = branches.find(
                (b) => mgr.assignedBranchIds?.includes(b.id) || b.id === mgr.branchId
              );

            return (
              <motion.div
                key={mgr.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 font-bold flex items-center justify-center text-sm border border-amber-100">
                        {mgr.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{mgr.fullName}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                          <Shield className="h-3 w-3" /> Branch Manager
                        </span>
                      </div>
                    </div>

                    <Badge variant={mgr.isActive !== false ? 'success' : 'neutral'} size="sm">
                      {mgr.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{mgr.email}</span>
                    </div>
                    {mgr.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{mgr.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Branch Assignment */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-slate-400" />
                      <span>Assigned Branch:</span>
                    </div>
                    {assignedBranch ? (
                      <div className="px-2.5 py-1.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs font-semibold text-amber-900">
                        {assignedBranch.name}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No branch assigned</span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => openEditModal(mgr)}
                    className="text-xs"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={() => openDeleteModal(mgr)}
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    Deactivate
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    })()}

      {/* Create Branch Manager Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Appoint Branch Manager"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Bethlehem Tadesse"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. manager@restaurant.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+251 91 345 6789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Password *"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Select
            label="Assign to Branch Location *"
            value={assignedBranchId}
            onChange={(e) => setAssignedBranchId(e.target.value)}
            options={allowedBranches.map((b) => ({ value: b.id, label: b.name }))}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
            >
              Appoint Manager
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Branch Manager Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Branch Manager"
        maxWidth="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Assign to Branch Location *"
            value={assignedBranchId}
            onChange={(e) => setAssignedBranchId(e.target.value)}
            options={allowedBranches.map((b) => ({ value: b.id, label: b.name }))}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Deactivate Branch Manager"
        message={`Are you sure you want to deactivate ${selectedManager?.fullName}? They will lose access to branch operations.`}
        confirmText="Deactivate Manager"
        isLoading={isSubmitting}
      />
    </div>
  );
};
