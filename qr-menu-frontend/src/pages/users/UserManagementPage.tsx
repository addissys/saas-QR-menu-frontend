import React, { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserRound, Search, MapPin } from 'lucide-react';
import { accessApi, PermissionRecord, RoleRecord } from '../../api/access.api';
import { branchApi } from '../../api/branch.api';
import { Branch, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { getUserFormErrors, UserFormErrors } from '../../utils/formErrors';
import { normalizeRole } from '../../utils/roles';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [grantablePermissions, setGrantablePermissions] = useState<PermissionRecord[]>([]);
  const [rolePermissions, setRolePermissions] = useState<PermissionRecord[]>([]);
  const [extraPermissions, setExtraPermissions] = useState<PermissionRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingPermissionUser, setEditingPermissionUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPermissionOpen, setIsPermissionOpen] = useState(false);
  const [isPermissionLoading, setIsPermissionLoading] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchIds, setBranchIds] = useState<string[]>([]);
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [managedRoleId, setManagedRoleId] = useState('');
  const [managedRolePermissionIds, setManagedRolePermissionIds] = useState<string[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const actorRole = normalizeRole(currentUser?.role);
  const isBranchManager = actorRole === 'BRANCH_MANAGER';
  const { hasPermission, hasAnyPermission } = usePermission();
  const refreshCurrentUser = useAuthStore((state) => state.refreshCurrentUser);

  const canManageUsers = hasAnyPermission('users.read', 'users.create', 'users.update', 'users.delete', 'users.manage_permissions');
  const canCreateUser = hasPermission('users.create') || ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(actorRole);
  const canUpdateUser = hasPermission('users.update') || ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(actorRole);
  const canManagePermissions = hasPermission('users.manage_permissions') || ['SUPER_ADMIN', 'CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(actorRole);

  const currentUserBranchIds = currentUser?.assignedBranchIds?.length
    ? currentUser.assignedBranchIds
    : currentUser?.branchId
      ? [currentUser.branchId]
      : [];
  const visibleBranches = isBranchManager
    ? branches.filter((branch) => currentUserBranchIds.includes(branch.id))
    : branches;
  const effectiveBranchFilter = isBranchManager && selectedBranchFilter === 'ALL'
    ? currentUserBranchIds[0] ?? 'ALL'
    : selectedBranchFilter;
  const availableRoles = roles.filter((role) => {
    const roleName = role.name.toUpperCase();
    if (actorRole === 'SUPER_ADMIN') return true;
    if (roleName === 'SUPER_ADMIN') return false;
    if (['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER'].includes(actorRole)) return true;
    if (actorRole === 'EXECUTIVE') {
      return !['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE'].includes(roleName);
    }
    if (actorRole === 'BRANCH_MANAGER') {
      return !['CAFE_OWNER', 'OWNER', 'RESTAURANT_OWNER', 'EXECUTIVE', 'BRANCH_MANAGER'].includes(roleName);
    }
    return false;
  });
  const manageableUsers = users.filter((entry) => {
    const role = entry.role?.toUpperCase();
    if (actorRole === 'SUPER_ADMIN' || actorRole === 'CAFE_OWNER' || actorRole === 'OWNER' || actorRole === 'RESTAURANT_OWNER') return true;
    if (['EXECUTIVE', 'BRANCH_MANAGER'].includes(actorRole)) {
      if (isBranchManager && role !== 'STAFF') return false;
      if (!isBranchManager && !['STAFF', 'BRANCH_MANAGER'].includes(role || '')) return false;
      if (actorRole === 'EXECUTIVE' && currentUser?.assignedBranchIds?.length) {
        return entry.assignedBranchIds?.some((branch) => currentUser.assignedBranchIds?.includes(branch)) ?? false;
      }
      if (isBranchManager) {
        return Boolean(
          currentUserBranchIds.some(
            (branchId) => entry.branchId === branchId || entry.assignedBranchIds?.includes(branchId)
          )
        );
      }
      return true;
    }
    if (canManageUsers) {
      if (currentUserBranchIds.length) {
        return Boolean(
          currentUserBranchIds.some(
            (branchId) => entry.branchId === branchId || entry.assignedBranchIds?.includes(branchId)
          )
        );
      }
      return true;
    }
    return false;
  });
  const visibleUsers = selectedRoleFilter === 'ALL'
    ? manageableUsers
    : manageableUsers.filter((entry) => normalizeRole(entry.role) === selectedRoleFilter);
  const branchFilteredUsers = effectiveBranchFilter === 'ALL'
    ? visibleUsers
    : visibleUsers.filter((entry) => entry.assignedBranchIds?.includes(effectiveBranchFilter) || entry.branchId === effectiveBranchFilter);
  const searchFilteredUsers = searchQuery
    ? branchFilteredUsers.filter((entry) => {
        const q = searchQuery.toLowerCase();
        const branchName = (entry.branchName || branches.find((b) => b.id === entry.branchId)?.name || '').toLowerCase();
        return (
          entry.fullName?.toLowerCase().includes(q) ||
          entry.email?.toLowerCase().includes(q) ||
          branchName.includes(q)
        );
      })
    : branchFilteredUsers;
  const roleSections = [
    { value: 'ALL', label: 'All Users' },
    ...availableRoles
      .map((role) => normalizeRole(role.name))
      .filter((role, index, list) => role !== 'UNKNOWN' && list.indexOf(role) === index)
      .map((role) => ({
        value: role,
        label: role === 'CAFE_OWNER' ? 'Owner' : role.replace(/_/g, ' '),
      })),
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoleFilter, effectiveBranchFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(searchFilteredUsers.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUsers = searchFilteredUsers.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const load = async () => {
    try {
      const [userList, roleList, branchList, permissionList, grantableList] = await Promise.all([
        accessApi.getUsers(), accessApi.getRoles(), branchApi.getAll(), accessApi.getPermissions(), accessApi.getGrantablePermissions(),
      ]);
      setUsers(userList); setRoles(roleList); setBranches(branchList.data); setPermissions(permissionList); setGrantablePermissions(grantableList);
    } catch (error) { showToast('Failed to load user management data', 'error'); }
  };
  useEffect(() => { void load(); }, []);

  const loadRolePermissions = async (roleId: string) => {
    setManagedRoleId(roleId);
    const assigned = await accessApi.getRolePermissions(roleId);
    setManagedRolePermissionIds(assigned.map((permission) => permission.id));
  };
  const saveRolePermissions = async () => {
    if (!managedRoleId) return;
    setIsSubmitting(true);
    try { await accessApi.assignRolePermissions(managedRoleId, managedRolePermissionIds); showToast('Role permissions saved', 'success'); }
    catch { showToast('Failed to save role permissions', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setSelectedUser(null); setFullName(''); setEmail(''); setPhone(''); setPassword(''); setConfirmPassword('');
    const defaultRole = selectedRoleFilter === 'ALL' ? 'STAFF' : selectedRoleFilter;
    const defaultRoleRecord = availableRoles.find((role) => normalizeRole(role.name) === defaultRole);
    setRoleId(defaultRoleRecord?.id ?? availableRoles[0]?.id ?? ''); setBranchId(''); setFormErrors({});
    setBranchIds([]);
  };
  const openCreate = () => { resetForm(); setIsOpen(true); };
  const openEdit = async (entry: User) => {
    const selectedRole = roles.find((role) => role.name.toUpperCase() === entry.role?.toUpperCase());
    setSelectedUser(entry); setFullName(entry.fullName); setEmail(entry.email); setPhone(entry.phone ?? '');
    setRoleId(selectedRole?.id ?? ''); setBranchId(entry.branchId ?? ''); setBranchIds(entry.assignedBranchIds ?? (entry.branchId ? [entry.branchId] : [])); setFormErrors({}); setIsOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser && (!password || password.length < 8)) return setFormErrors({ password: 'Password must be at least 8 characters.' });
    if (!selectedUser && password !== confirmPassword) return setFormErrors({ confirmPassword: 'Passwords do not match.' });
    if (!roleId) return setFormErrors({ form: 'Select a role.' });
    const managerBranchId = isBranchManager && !selectedUser ? effectiveBranchFilter : branchId;
    if (isBranchManager && !selectedUser && !currentUserBranchIds.includes(managerBranchId)) {
      return setFormErrors({ form: 'Select one of your assigned branches.' });
    }
    setIsSubmitting(true); setFormErrors({});
    try {
      const selectedRole = roles.find((role) => role.id === roleId)?.name.toUpperCase();
      const assignmentBranchId = isBranchManager && !selectedUser ? effectiveBranchFilter : branchId;
      const assignment = selectedRole === 'EXECUTIVE' ? { branch_ids: branchIds } : { branch_id: assignmentBranchId || undefined };
      if (selectedUser) await accessApi.updateUser(selectedUser.id, { full_name: fullName, email, phone, role_id: roleId, ...assignment });
      else await accessApi.createUser({ full_name: fullName, email, phone, password, role_id: roleId, ...assignment });
      setIsOpen(false); await load(); showToast(selectedUser ? 'User updated successfully' : 'User created successfully. A verification email was sent.', 'success');
    } catch (error) { setFormErrors(getUserFormErrors(error)); }
    finally { setIsSubmitting(false); }
  };
  const openPermissions = async (entry: User) => {
    const role = roles.find((item) => item.name.toUpperCase() === entry.role?.toUpperCase());
    if (!role) return;
    setIsPermissionLoading(true);
    setPermissionError('');
    try {
      const [inherited, additional, grantableList] = await Promise.all([
        accessApi.getRolePermissions(role.id),
        accessApi.getUserPermissions(entry.id),
        accessApi.getGrantablePermissions(),
      ]);
      setEditingPermissionUser(entry);
      setRolePermissions(inherited);
      setExtraPermissions(additional);
      setGrantablePermissions(grantableList);
      setPermissionIds(additional.map((item) => item.id));
      setIsPermissionOpen(true);
    } catch (error) {
      setPermissionError('Unable to load this user\'s permissions.');
      showToast('Unable to load user permissions', 'error');
    } finally {
      setIsPermissionLoading(false);
    }
  };
  const closePermissions = () => {
    setIsPermissionOpen(false);
    setEditingPermissionUser(null);
    setPermissionIds([]);
    setRolePermissions([]);
    setExtraPermissions([]);
    setPermissionError('');
  };
  const savePermissions = async () => {
    if (!editingPermissionUser) return;
    setIsSubmitting(true);
    try {
      await accessApi.setUserPermissions(editingPermissionUser.id, permissionIds);
      if (editingPermissionUser.id === currentUser?.id) {
        await refreshCurrentUser();
      }
      closePermissions();
      showToast('Additional permissions saved', 'success');
      // Reload to reflect updated effective permissions in the UI
      await load();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Failed to save permissions';
      showToast(msg, 'error');
    } finally { setIsSubmitting(false); }
  };
  const field = (label: string, value: string, setValue: (value: string) => void, type = 'text', error?: string, passwordToggle = false) => <Input label={label} value={value} type={type} onChange={(event) => setValue(event.target.value)} error={error} showPasswordToggle={passwordToggle} required />;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">User Management</h1><p className="text-xs text-slate-500">Create users once, then manage their role, branches, and additional permissions.</p></div>{canCreateUser && <Button variant="primary" size="md" icon={Plus} onClick={openCreate}>Add User</Button>}</div>
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs items-end">
      <Select
        label={isBranchManager ? 'Assigned Branch' : 'Branch'}
        value={effectiveBranchFilter}
        onChange={(event) => setSelectedBranchFilter(event.target.value)}
        options={isBranchManager
          ? visibleBranches.map((branch) => ({ value: branch.id, label: branch.name }))
          : [{ value: 'ALL', label: 'All Branches' }, ...visibleBranches.map((branch) => ({ value: branch.id, label: branch.name }))]}
      />
      <div className="flex-1 min-w-[180px]">
        <Input
          placeholder="Search by name, email, or branch..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {roleSections.map((section) => (
        <button
          key={section.value}
          type="button"
          onClick={() => setSelectedRoleFilter(section.value)}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${selectedRoleFilter === section.value ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {section.label}
        </button>
      ))}
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {paginatedUsers.map((entry) => {
        const branchName = entry.branchName || branches.find((b) => b.id === entry.branchId)?.name;
        const assignedCount = entry.assignedBranchIds?.length ?? 0;
        return (
          <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{entry.fullName}</p>
                  <p className="text-xs text-slate-500">{entry.email}</p>
                </div>
              </div>
              <Badge variant={entry.isActive ? 'success' : 'neutral'} size="sm">
                {entry.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {/* Branch assignment badge */}
            {(branchName || assignedCount > 1) && (
              <div className="mt-2">
                {assignedCount > 1 ? (
                  <Badge variant="amber" size="sm">
                    <MapPin className="h-3 w-3 mr-1 inline" />Multi-Branch ({assignedCount})
                  </Badge>
                ) : branchName ? (
                  <Badge variant="neutral" size="sm">
                    <MapPin className="h-3 w-3 mr-1 inline" />{branchName}
                  </Badge>
                ) : null}
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">{entry.role}</span>
              <div className="flex gap-2">
                {canManagePermissions && (
                  <Button variant="outline" size="sm" disabled={isPermissionLoading} onClick={() => void openPermissions(entry)}>
                    Permissions
                  </Button>
                )}
                {canUpdateUser && (
                  <Button variant="outline" size="sm" onClick={() => openEdit(entry)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {searchFilteredUsers.length > 0 && (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalRecords={searchFilteredUsers.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>
    )}
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={selectedUser ? 'Edit User' : 'Create New User'} maxWidth="md"><form onSubmit={submit} className="space-y-4">{formErrors.form && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{formErrors.form}</p>}{field('Full Name *', fullName, setFullName, 'text', formErrors.fullName)}{field('Email *', email, setEmail, 'email', formErrors.email)}{field('Phone', phone, setPhone, 'text', formErrors.phone)}{!selectedUser && <>{field('Password *', password, setPassword, 'password', formErrors.password, true)}{field('Confirm Password *', confirmPassword, setConfirmPassword, 'password', formErrors.confirmPassword, true)}</>}<Select label="Role *" value={roleId} onChange={(event) => { setRoleId(event.target.value); setBranchIds([]); }} options={availableRoles.map((role) => ({ value: role.id, label: role.name }))} required />{roles.find((role) => role.id === roleId)?.name.toUpperCase() === 'EXECUTIVE' ? <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Authorized Branches *</label><select multiple value={branchIds} onChange={(event) => setBranchIds(Array.from(event.target.selectedOptions, (option) => option.value))} className="mt-1 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{visibleBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div> : <Select label={isBranchManager ? 'Assigned Branch' : 'Branch'} value={branchId} onChange={(event) => setBranchId(event.target.value)} options={[{ value: '', label: 'No branch assignment' }, ...visibleBranches.map((branch) => ({ value: branch.id, label: branch.name }))]} />}<div className="flex justify-end gap-3 border-t border-slate-100 pt-3"><Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>{selectedUser ? 'Save Changes' : 'Create User'}</Button></div></form></Modal>
    <Modal isOpen={isPermissionOpen} onClose={closePermissions} title={`Permissions: ${editingPermissionUser?.fullName ?? ''}`} maxWidth="lg"><div className="space-y-5">{permissionError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{permissionError}</p>}<section><h3 className="mb-2 text-sm font-bold text-slate-900">Role Permissions (Inherited)</h3><p className="mb-2 text-xs text-slate-500">These permissions belong to the {editingPermissionUser?.role} role and apply automatically.</p><div className="space-y-2 rounded-xl bg-slate-50 p-3">{rolePermissions.length > 0 ? rolePermissions.map((permission) => <p key={permission.id} className="flex items-center gap-2 text-xs text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-600" />{permission.permission}</p>) : <p className="text-xs text-slate-400">No role permissions.</p>}</div></section><section><h3 className="mb-2 text-sm font-bold text-slate-900">Additional User Permissions</h3><p className="mb-2 text-xs text-slate-500">Assign user-specific permissions beyond their base role. You can only grant permissions within your own authority.</p><div className="grid gap-2 sm:grid-cols-2">{grantablePermissions.filter((p) => !rolePermissions.some((rp) => rp.id === p.id)).map((permission) => <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs"><input type="checkbox" checked={permissionIds.includes(permission.id)} onChange={() => setPermissionIds((current) => current.includes(permission.id) ? current.filter((id) => id !== permission.id) : [...current, permission.id])} />{permission.permission}</label>)}</div></section><div className="flex justify-end"><Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void savePermissions()}>Save Permissions</Button></div></div></Modal>
    {actorRole === 'SUPER_ADMIN' && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><h2 className="text-lg font-bold text-slate-900">Role Permission Management</h2><p className="mb-4 text-xs text-slate-500">Manage inherited permissions once per role. Individual user grants remain separate.</p><div className="grid gap-4 md:grid-cols-[220px_1fr]"> <Select label="Role" value={managedRoleId} onChange={(event) => void loadRolePermissions(event.target.value)} options={[{ value: '', label: 'Select role' }, ...roles.map((role) => ({ value: role.id, label: role.name }))]} /><div className="grid gap-2 sm:grid-cols-2">{managedRoleId && permissions.map((permission) => <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs"><input type="checkbox" checked={managedRolePermissionIds.includes(permission.id)} onChange={() => setManagedRolePermissionIds((current) => current.includes(permission.id) ? current.filter((id) => id !== permission.id) : [...current, permission.id])} />{permission.permission}</label>)}</div></div>{managedRoleId && <div className="mt-4 flex justify-end"><Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void saveRolePermissions()}>Save Role Permissions</Button></div>}</section>}
  </div>;
};
