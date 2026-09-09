import React, { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, ShieldCheck, Save, Loader2, CheckSquare, Square } from 'lucide-react';
import { accessApi, PermissionRecord, RoleRecord } from '../../api/access.api';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const AdminRolesPage: React.FC = () => {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleRecord | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  // Modal state for Create / Edit
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [modalPermissionIds, setModalPermissionIds] = useState<string[]>([]);
  const [isLoadingModalData, setIsLoadingModalData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoadingRoles(true);
    try {
      const [roleList, permList] = await Promise.all([
        accessApi.getRoles(),
        accessApi.getPermissions(),
      ]);
      setRoles(roleList);
      setPermissions(permList);

      const counts: Record<string, number> = {};
      await Promise.all(
        roleList.map(async (role) => {
          try {
            const rolePerms = await accessApi.getRolePermissions(role.id);
            counts[role.id] = rolePerms.length;
          } catch {
            counts[role.id] = 0;
          }
        })
      );
      setRoleCounts(counts);
    } catch {
      showToast('Failed to load roles and permissions', 'error');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectRole = async (role: RoleRecord) => {
    setSelectedRole(role);
    try {
      const assigned = await accessApi.getRolePermissions(role.id);
      const ids = assigned.map((p) => p.id);
      setRolePermissionIds(ids);
      setRoleCounts((prev) => ({ ...prev, [role.id]: ids.length }));
    } catch {
      showToast('Failed to load role permissions', 'error');
    }
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      const updated = await accessApi.assignRolePermissions(selectedRole.id, rolePermissionIds);
      const updatedIds = (updated || []).map((p: any) => p.id);
      setRolePermissionIds(updatedIds);
      setRoleCounts((prev) => ({ ...prev, [selectedRole.id]: updatedIds.length }));
      showToast('Role permissions saved successfully', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save role permissions', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setModalPermissionIds([]);
    setIsRoleModalOpen(true);
  };

  const openEditRole = async (role: RoleRecord) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description ?? '');
    setModalPermissionIds([]);
    setIsRoleModalOpen(true);
    setIsLoadingModalData(true);

    try {
      const assigned = await accessApi.getRolePermissions(role.id);
      setModalPermissionIds(assigned.map((p) => p.id));
    } catch {
      showToast('Failed to load permissions for editing', 'error');
    } finally {
      setIsLoadingModalData(false);
    }
  };

  const toggleModalPermission = (permId: string) => {
    setModalPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const selectAllPermissionsInModule = (perms: PermissionRecord[]) => {
    const ids = perms.map((p) => p.id);
    setModalPermissionIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const deselectAllPermissionsInModule = (perms: PermissionRecord[]) => {
    const ids = new Set(perms.map((p) => p.id));
    setModalPermissionIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const submitRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = roleName.trim();
    if (!trimmedName) {
      showToast('Role name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let savedRoleId: string;

      if (editingRole) {
        // Step 1: Update Role Details
        await accessApi.updateRole(editingRole.id, {
          name: trimmedName,
          description: roleDescription.trim() || undefined,
        });
        savedRoleId = editingRole.id;

        // Step 2: Sync Role Permissions
        await accessApi.assignRolePermissions(savedRoleId, modalPermissionIds);

        showToast('Role and permissions updated successfully', 'success');

        if (selectedRole?.id === savedRoleId) {
          setSelectedRole({
            ...selectedRole,
            name: trimmedName,
            description: roleDescription.trim() || undefined,
          });
          setRolePermissionIds(modalPermissionIds);
        }
      } else {
        // Step 1: Create Role
        const createdRole = await accessApi.createRole({
          name: trimmedName,
          description: roleDescription.trim() || undefined,
        });

        if (!createdRole?.id) {
          throw new Error('Failed to retrieve created role ID');
        }
        savedRoleId = createdRole.id;

        // Step 2: Assign Permissions
        if (modalPermissionIds.length > 0) {
          await accessApi.assignRolePermissions(savedRoleId, modalPermissionIds);
        }

        showToast('Role and permissions created successfully', 'success');
      }

      setIsRoleModalOpen(false);
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save role';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRole = async (role: RoleRecord) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await accessApi.deleteRole(role.id);
      showToast('Role deleted successfully', 'success');
      if (selectedRole?.id === role.id) {
        setSelectedRole(null);
        setRolePermissionIds([]);
      }
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete role', 'error');
    }
  };

  const togglePermission = (permId: string) => {
    setRolePermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const groupedPermissions = permissions.reduce<Record<string, PermissionRecord[]>>(
    (acc, perm) => {
      const mod = perm.module || 'other';
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(perm);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role &amp; Permission Management</h1>
          <p className="text-xs text-slate-500">
            Create roles, assign permissions. Users inherit these permissions through their assigned role.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={openCreateRole}>
          New Role
        </Button>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Roles List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Roles</h2>
            {isLoadingRoles && <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />}
          </div>

          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                  selectedRole?.id === role.id
                    ? 'border-purple-400 bg-purple-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
                onClick={() => void selectRole(role)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm truncate">{role.name}</p>
                      <Badge variant="purple" size="sm">
                        {roleCounts[role.id] ?? 0} perms
                      </Badge>
                    </div>
                    {role.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {role.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void openEditRole(role);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100/60 transition-colors"
                      title="Edit role"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteRole(role);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Role Permissions Detail View */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          {selectedRole ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    Permissions for <Badge variant="purple" size="sm">{selectedRole.name}</Badge>
                    <span className="text-xs font-normal text-slate-400">
                      ({rolePermissionIds.length} assigned)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Toggle permissions directly for this role.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit3}
                    onClick={() => void openEditRole(selectedRole)}
                  >
                    Edit Role
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    isLoading={isSubmitting}
                    onClick={() => void saveRolePermissions()}
                  >
                    Save Permissions
                  </Button>
                </div>
              </div>

              <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
                {Object.entries(groupedPermissions).map(([mod, perms]) => (
                  <div key={mod} className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {mod.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {perms.filter((p) => rolePermissionIds.includes(p.id)).length} of {perms.length} selected
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition-colors ${
                            rolePermissionIds.includes(perm.id)
                              ? 'border-purple-300 bg-purple-50/40'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={rolePermissionIds.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="accent-purple-600 mt-0.5"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">{perm.permission}</p>
                            {perm.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">Select a role to manage permissions</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Click a role on the left to view and toggle its permissions, or click &quot;New Role&quot; above to create a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Unified Create / Edit Role Modal with Permissions */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Role'}
        maxWidth="2xl"
      >
        <form onSubmit={submitRole} className="space-y-5">
          {isLoadingModalData ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
              <p className="text-xs text-slate-500">Loading role details &amp; permissions...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Role Name *"
                  placeholder="e.g. Kitchen Manager"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                />
                <Input
                  label="Description"
                  placeholder="e.g. Manages kitchen operations"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                />
              </div>

              {/* Permissions Section inside Modal */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Permissions
                      <span className="ml-2 text-xs font-semibold text-purple-600">
                        ({modalPermissionIds.length} selected)
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Select the permissions assigned to this role.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalPermissionIds(permissions.map((p) => p.id))}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setModalPermissionIds([])}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {Object.entries(groupedPermissions).map(([mod, perms]) => {
                    const allInModSelected = perms.every((p) => modalPermissionIds.includes(p.id));

                    return (
                      <div key={mod} className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            {mod.replace(/_/g, ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              allInModSelected
                                ? deselectAllPermissionsInModule(perms)
                                : selectAllPermissionsInModule(perms)
                            }
                            className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
                          >
                            {allInModSelected ? (
                              <>
                                <CheckSquare className="h-3.5 w-3.5" /> Deselect Module
                              </>
                            ) : (
                              <>
                                <Square className="h-3.5 w-3.5" /> Select Module
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {perms.map((perm) => {
                            const isChecked = modalPermissionIds.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'border-purple-300 bg-purple-50/50'
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleModalPermission(perm.id)}
                                  className="accent-purple-600 mt-0.5"
                                />
                                <div>
                                  <p className="font-semibold text-slate-800">{perm.permission}</p>
                                  {perm.description && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRoleModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                >
                  {editingRole
                    ? isSubmitting
                      ? 'Saving...'
                      : 'Save Changes'
                    : isSubmitting
                    ? 'Creating...'
                    : 'Create Role'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};
