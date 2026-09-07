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
import { Users, Plus, Edit2, Trash2, Mail, Phone, GitBranch, UtensilsCrossed, Store } from 'lucide-react';
import { normalizeRole } from '../../utils/roles';
import { getUserFormErrors, UserFormErrors } from '../../utils/formErrors';

export const StaffListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [staffList, setStaffList] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [assignedBranchId, setAssignedBranchId] = useState('');

  const normalizedRole = normalizeRole(user?.role);
  const isCafeOwner =
    normalizedRole === 'CAFE_OWNER' ||
    normalizedRole === 'OWNER' ||
    normalizedRole === 'RESTAURANT_OWNER' ||
    normalizedRole === 'SUPER_ADMIN';
  const isExecutive = normalizedRole === 'EXECUTIVE';
  const isBranchManager = normalizedRole === 'BRANCH_MANAGER';

  // Determine allowed branches for creating/assigning
  const allowedBranches = branches.filter((b) => {
    if (isCafeOwner) return true;
    if (isExecutive) return user?.assignedBranchIds?.includes(b.id);
    if (isBranchManager) return user?.assignedBranchIds?.includes(b.id);
    return false;
  });

  const canManageStaff = isCafeOwner || isExecutive || isBranchManager;

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [staffRes, branchRes] = await Promise.all([
        userApi.getStaff(branchFilter !== 'all' ? branchFilter : undefined),
        branchApi.getAll(),
      ]);
      setStaffList(staffRes.data);
      setBranches(branchRes.data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to load staff members';
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
    setConfirmPassword('');
    setFormErrors({});
    const initialBranchId =
      branchFilter !== 'all' && allowedBranches.some((b) => b.id === branchFilter)
        ? branchFilter
        : allowedBranches[0]?.id || '';
    setAssignedBranchId(initialBranchId);
    setIsCreateOpen(true);
  };

  const openEditModal = (staff: User) => {
    setSelectedStaff(staff);
    setFullName(staff.fullName);
    setEmail(staff.email);
    setPhone(staff.phone || '');
    setAssignedBranchId(staff.assignedBranchIds?.[0] || allowedBranches[0]?.id || '');
    setIsEditOpen(true);
  };

  const openDeleteModal = (staff: User) => {
    setSelectedStaff(staff);
    setIsDeleteOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !assignedBranchId) {
      setFormErrors({ form: 'Please fill all required fields and select a branch.' });
      return;
    }
    if (!password || password.length < 8) {
      setFormErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }
    if (!confirmPassword) {
      setFormErrors({ confirmPassword: 'Please confirm your password.' });
      return;
    }
    if (password !== confirmPassword) {
      setFormErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    try {
      await userApi.createStaff({
        fullName,
        email,
        phone,
        password,
        role: 'STAFF',
        assignedBranchIds: [assignedBranchId],
      });
      showToast(`Staff member ${fullName} registered successfully`, 'success');
      setIsCreateOpen(false);
      await loadData();
    } catch (err: any) {
      setFormErrors(getUserFormErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !assignedBranchId) return;

    setIsSubmitting(true);
    try {
      await userApi.updateStaff(selectedStaff.id, {
        fullName,
        email,
        phone,
        assignedBranchIds: [assignedBranchId],
      });
      showToast('Staff member updated successfully', 'success');
      setIsEditOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to update staff member';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await userApi.deleteStaff(selectedStaff.id);
      showToast(`Staff member ${selectedStaff.fullName} deactivated`, 'success');
      setIsDeleteOpen(false);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to deactivate staff member';
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
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Staff & Kitchen Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            {isBranchManager
              ? 'Manage kitchen chefs, floor captains, and service staff for your branch.'
              : isExecutive
              ? 'Oversee operations and kitchen team assignments across your authorized regional branches.'
              : 'Appoint and govern service personnel and kitchen leads across all restaurant branches.'}
          </p>
        </div>

        {canManageStaff && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openCreateModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20"
          >
            Add Staff Member
          </Button>
        )}
      </div>

      {/* Filter Toolbar (if user has multi-branch access) */}
      {!isBranchManager && allowedBranches.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Filter By Branch:</span>
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
      )}

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
        const filteredStaff = staffList.filter((staff) => {
          if (branchFilter === 'all') return true;
          return (
            staff.branchId === branchFilter ||
            staff.assignedBranchIds?.includes(branchFilter)
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

        if (filteredStaff.length === 0) {
          return (
            <EmptyState
              icon={Users}
              title={branchFilter !== 'all' ? 'No Staff Members Yet' : 'No Staff Members Found'}
              description={
                branchFilter !== 'all'
                  ? 'No staff members have been added to this branch location yet.'
                  : 'No staff members have been added to your authorized branches yet.'
              }
              actionText={canManageStaff ? '+ Add Staff Member' : undefined}
              onAction={openCreateModal}
            />
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((staff) => {
              const assignedBranch = branches.find(
                (b) => staff.assignedBranchIds?.includes(b.id) || b.id === staff.branchId
              );

            return (
              <motion.div
                key={staff.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-100">
                        {staff.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{staff.fullName}</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                          <UtensilsCrossed className="h-3 w-3" /> Kitchen / Service Staff
                        </span>
                      </div>
                    </div>

                    <Badge variant={staff.isActive !== false ? 'success' : 'neutral'} size="sm">
                      {staff.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    {staff.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{staff.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Branch Assignment */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
                      <GitBranch className="h-3.5 w-3.5 text-slate-400" />
                      <span>Assigned Location:</span>
                    </div>
                    {assignedBranch ? (
                      <div className="px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs font-semibold text-emerald-900">
                        {assignedBranch.name}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No branch assigned</span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {canManageStaff && (
                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit2}
                      onClick={() => openEditModal(staff)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => openDeleteModal(staff)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      Deactivate
                    </Button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      );
    })()}

      {/* Create Staff Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Staff Member"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formErrors.form && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700">{formErrors.form}</p>}
          <Input
            label="Full Name *"
            placeholder="e.g. Yohannes Bekele"
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setFormErrors((current) => ({ ...current, fullName: undefined, form: undefined })); }}
            error={formErrors.fullName}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. staff@restaurant.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFormErrors((current) => ({ ...current, email: undefined, form: undefined })); }}
            error={formErrors.email}
            required
          />

          <Input
            label="Phone Number"
            placeholder="+251 91 456 7890"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setFormErrors((current) => ({ ...current, phone: undefined, form: undefined })); }}
            error={formErrors.phone}
          />

          <Input
            label="Password *"
            type="password"
            showPasswordToggle
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFormErrors((current) => ({ ...current, password: undefined, form: undefined })); }}
            error={formErrors.password}
            required
          />

          <Input
            label="Confirm Password *"
            type="password"
            placeholder="Repeat password"
            showPasswordToggle
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setFormErrors((current) => ({ ...current, confirmPassword: undefined, form: undefined })); }}
            error={formErrors.confirmPassword}
            required
          />

          <Select
            label="Assign to Branch Location *"
            value={assignedBranchId}
            onChange={(e) => setAssignedBranchId(e.target.value)}
            options={allowedBranches.map((b) => ({ value: b.id, label: b.name }))}
            disabled={isBranchManager && allowedBranches.length === 1}
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
              Register Staff
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Staff Member"
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
            disabled={isBranchManager && allowedBranches.length === 1}
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
        title="Deactivate Staff Member"
        message={`Are you sure you want to deactivate ${selectedStaff?.fullName}? They will lose access to operational dish stock and notification updates.`}
        confirmText="Deactivate Staff"
        isLoading={isSubmitting}
      />
    </div>
  );
};
