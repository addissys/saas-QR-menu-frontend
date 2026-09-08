import React, { useEffect, useState } from 'react';
import { Plus, ShieldCheck, UserRound } from 'lucide-react';
import { accessApi, PermissionRecord, RoleRecord } from '../../api/access.api';
import { branchApi } from '../../api/branch.api';
import { Branch, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { getUserFormErrors, UserFormErrors } from '../../utils/formErrors';
import { normalizeRole } from '../../utils/roles';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [rolePermissions, setRolePermissions] = useState<PermissionRecord[]>([]);
  const [extraPermissions, setExtraPermissions] = useState<PermissionRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const actorRole = normalizeRole(currentUser?.role);
  const allowedRoleNames = actorRole === 'SUPER_ADMIN'
    ? undefined
    : actorRole === 'CAFE_OWNER' || actorRole === 'OWNER' || actorRole === 'RESTAURANT_OWNER'
      ? ['EXECUTIVE', 'BRANCH_MANAGER', 'STAFF']
      : actorRole === 'EXECUTIVE'
        ? ['BRANCH_MANAGER', 'STAFF']
        : ['STAFF'];
  const availableRoles = roles.filter((role) => !allowedRoleNames || allowedRoleNames.includes(role.name.toUpperCase()));
  const manageableUsers = users.filter((entry) => {
    const role = entry.role?.toUpperCase();
    if (actorRole === 'SUPER_ADMIN' || actorRole === 'CAFE_OWNER' || actorRole === 'OWNER' || actorRole === 'RESTAURANT_OWNER') return true;
    if (!['EXECUTIVE', 'BRANCH_MANAGER'].includes(actorRole)) return false;
    if (!['STAFF', 'BRANCH_MANAGER'].includes(role || '')) return false;
    if (actorRole === 'EXECUTIVE' && currentUser?.assignedBranchIds?.length) {
      return entry.assignedBranchIds?.some((branch) => currentUser.assignedBranchIds?.includes(branch)) ?? false;
    }
    if (actorRole === 'BRANCH_MANAGER' && currentUser?.branchId) return entry.branchId === currentUser.branchId;
    return true;
  });
  const visibleUsers = selectedRoleFilter === 'ALL'
    ? manageableUsers
    : manageableUsers.filter((entry) => normalizeRole(entry.role) === selectedRoleFilter);
  const branchFilteredUsers = selectedBranchFilter === 'ALL'
    ? visibleUsers
    : visibleUsers.filter((entry) => entry.assignedBranchIds?.includes(selectedBranchFilter) || entry.branchId === selectedBranchFilter);
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

  const load = async () => {
    try {
      const [userList, roleList, branchList, permissionList] = await Promise.all([
        accessApi.getUsers(), accessApi.getRoles(), branchApi.getAll(), accessApi.getPermissions(),
      ]);
      setUsers(userList); setRoles(roleList); setBranches(branchList.data); setPermissions(permissionList);
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
    const selectedRole = roles.find((role) => role.name.toUpperCase() === entry.role);
    setSelectedUser(entry); setFullName(entry.fullName); setEmail(entry.email); setPhone(entry.phone ?? '');
    setRoleId(selectedRole?.id ?? ''); setBranchId(entry.branchId ?? ''); setBranchIds(entry.assignedBranchIds ?? (entry.branchId ? [entry.branchId] : [])); setFormErrors({}); setIsOpen(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser && (!password || password.length < 8)) return setFormErrors({ password: 'Password must be at least 8 characters.' });
    if (!selectedUser && password !== confirmPassword) return setFormErrors({ confirmPassword: 'Passwords do not match.' });
    if (!roleId) return setFormErrors({ form: 'Select a role.' });
    setIsSubmitting(true); setFormErrors({});
    try {
      const selectedRole = roles.find((role) => role.id === roleId)?.name.toUpperCase();
      const assignment = selectedRole === 'EXECUTIVE' ? { branch_ids: branchIds } : { branch_id: branchId || undefined };
      if (selectedUser) await accessApi.updateUser(selectedUser.id, { full_name: fullName, email, phone, role_id: roleId, ...assignment });
      else await accessApi.createUser({ full_name: fullName, email, phone, password, role_id: roleId, ...assignment });
      setIsOpen(false); await load(); showToast(selectedUser ? 'User updated successfully' : 'User created successfully. A verification email was sent.', 'success');
    } catch (error) { setFormErrors(getUserFormErrors(error)); }
    finally { setIsSubmitting(false); }
  };
  const openPermissions = async (entry: User) => {
    const role = roles.find((item) => item.name.toUpperCase() === entry.role);
    if (!role) return;
    setIsPermissionLoading(true);
    setPermissionError('');
    try {
      const [inherited, additional] = await Promise.all([accessApi.getRolePermissions(role.id), accessApi.getUserPermissions(entry.id)]);
      setSelectedUser(entry); setRolePermissions(inherited); setExtraPermissions(additional); setPermissionIds(additional.map((item) => item.id)); setIsPermissionOpen(true);
    } catch (error) {
      setPermissionError('Unable to load this user\'s permissions.');
      showToast('Unable to load user permissions', 'error');
    } finally {
      setIsPermissionLoading(false);
    }
  };
  const savePermissions = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try { await accessApi.setUserPermissions(selectedUser.id, permissionIds); setIsPermissionOpen(false); showToast('Additional permissions saved', 'success'); }
    catch (error) { showToast('Failed to save permissions', 'error'); }
    finally { setIsSubmitting(false); }
  };
  const field = (label: string, value: string, setValue: (value: string) => void, type = 'text', error?: string, passwordToggle = false) => <Input label={label} value={value} type={type} onChange={(event) => setValue(event.target.value)} error={error} showPasswordToggle={passwordToggle} required />;

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">User Management</h1><p className="text-xs text-slate-500">Create users once, then manage their role, branches, and additional permissions.</p></div><Button variant="primary" size="md" icon={Plus} onClick={openCreate}>Add User</Button></div>
    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
      <Select
        label="Branch"
        value={selectedBranchFilter}
        onChange={(event) => setSelectedBranchFilter(event.target.value)}
        options={[{ value: 'ALL', label: 'All Branches' }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]}
      />
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{branchFilteredUsers.map((entry) => <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700"><UserRound className="h-5 w-5" /></div><div><p className="font-bold text-slate-900">{entry.fullName}</p><p className="text-xs text-slate-500">{entry.email}</p></div></div><Badge variant={entry.isActive ? 'success' : 'neutral'} size="sm">{entry.isActive ? 'Active' : 'Inactive'}</Badge></div><div className="mt-4 flex items-center justify-between"><span className="text-xs font-semibold text-slate-600">{entry.role}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={isPermissionLoading} onClick={() => void openPermissions(entry)}>Permissions</Button><Button variant="outline" size="sm" onClick={() => openEdit(entry)}>Edit</Button></div></div></div>)}</div>
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={selectedUser ? 'Edit User' : 'Create New User'} maxWidth="md"><form onSubmit={submit} className="space-y-4">{formErrors.form && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{formErrors.form}</p>}{field('Full Name *', fullName, setFullName, 'text', formErrors.fullName)}{field('Email *', email, setEmail, 'email', formErrors.email)}{field('Phone', phone, setPhone, 'text', formErrors.phone)}{!selectedUser && <>{field('Password *', password, setPassword, 'password', formErrors.password, true)}{field('Confirm Password *', confirmPassword, setConfirmPassword, 'password', formErrors.confirmPassword, true)}</>}<Select label="Role *" value={roleId} onChange={(event) => { setRoleId(event.target.value); setBranchIds([]); }} options={availableRoles.map((role) => ({ value: role.id, label: role.name }))} required />{roles.find((role) => role.id === roleId)?.name.toUpperCase() === 'EXECUTIVE' ? <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Authorized Branches *</label><select multiple value={branchIds} onChange={(event) => setBranchIds(Array.from(event.target.selectedOptions, (option) => option.value))} className="mt-1 min-h-32 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div> : <Select label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)} options={[{ value: '', label: 'No branch assignment' }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]} />}<div className="flex justify-end gap-3 border-t border-slate-100 pt-3"><Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button><Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>{selectedUser ? 'Save Changes' : 'Create User'}</Button></div></form></Modal>
    <Modal isOpen={isPermissionOpen} onClose={() => setIsPermissionOpen(false)} title={`Permissions: ${selectedUser?.fullName ?? ''}`} maxWidth="lg"><div className="space-y-5">{permissionError && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{permissionError}</p>}<section><h3 className="mb-2 text-sm font-bold text-slate-900">Role Permissions</h3><div className="space-y-2 rounded-xl bg-slate-50 p-3">{rolePermissions.map((permission) => <p key={permission.id} className="flex items-center gap-2 text-xs text-slate-700"><ShieldCheck className="h-4 w-4 text-emerald-600" />{permission.permission}</p>)}</div></section><section><h3 className="mb-2 text-sm font-bold text-slate-900">Additional User Permissions</h3><div className="grid gap-2 sm:grid-cols-2">{permissions.map((permission) => <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs"><input type="checkbox" checked={permissionIds.includes(permission.id)} onChange={() => setPermissionIds((current) => current.includes(permission.id) ? current.filter((id) => id !== permission.id) : [...current, permission.id])} />{permission.permission}</label>)}</div></section><div className="flex justify-end"><Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void savePermissions()}>Save Permissions</Button></div></div></Modal>
    {actorRole === 'SUPER_ADMIN' && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><h2 className="text-lg font-bold text-slate-900">Role Permission Management</h2><p className="mb-4 text-xs text-slate-500">Manage inherited permissions once per role. Individual user grants remain separate.</p><div className="grid gap-4 md:grid-cols-[220px_1fr]"> <Select label="Role" value={managedRoleId} onChange={(event) => void loadRolePermissions(event.target.value)} options={[{ value: '', label: 'Select role' }, ...roles.map((role) => ({ value: role.id, label: role.name }))]} /><div className="grid gap-2 sm:grid-cols-2">{managedRoleId && permissions.map((permission) => <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs"><input type="checkbox" checked={managedRolePermissionIds.includes(permission.id)} onChange={() => setManagedRolePermissionIds((current) => current.includes(permission.id) ? current.filter((id) => id !== permission.id) : [...current, permission.id])} />{permission.permission}</label>)}</div></div>{managedRoleId && <div className="mt-4 flex justify-end"><Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void saveRolePermissions()}>Save Role Permissions</Button></div>}</section>}
  </div>;
};
