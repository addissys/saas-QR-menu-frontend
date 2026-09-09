import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { categoryApi } from '../../api/category.api';
import { branchApi } from '../../api/branch.api';
import { Category, Branch } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { normalizeRole } from '../../utils/roles';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table, Column } from '../../components/ui/Table';
import { Plus, FolderTree, Edit3, Trash2, GitBranch, MapPin } from 'lucide-react';
import { usePermission } from '../../hooks/usePermission';

const CategoriesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canCreate = hasPermission('categories.create');
  const canUpdate = hasPermission('categories.update');
  const canDelete = hasPermission('categories.delete');

  const normalizedRole = normalizeRole(user?.role);
  const isCafeOwner =
    normalizedRole === 'CAFE_OWNER' ||
    normalizedRole === 'OWNER' ||
    normalizedRole === 'RESTAURANT_OWNER' ||
    normalizedRole === 'SUPER_ADMIN';

  // For branch managers / staff, branchId is on the user object
  const userBranchId = user?.branch_id || user?.branchId || user?.assignedBranchIds?.[0];

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [targetBranchIds, setTargetBranchIds] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load branches
  useEffect(() => {
    if (isCafeOwner) {
      setIsLoadingBranches(true);
      branchApi
        .getAll()
        .then((res) => {
          setBranches(res.data);
          // Default to all branches checked
          setSelectedBranchIds((current) => {
            if (current.length > 0) {
              const valid = current.filter((id) => res.data.some((b) => b.id === id));
              return valid.length > 0 ? valid : res.data.map((b) => b.id);
            }
            return res.data.map((b) => b.id);
          });
        })
        .catch(() => {
          showToast('Failed to load branches', 'error');
        })
        .finally(() => {
          setIsLoadingBranches(false);
        });
    } else if (userBranchId) {
      setSelectedBranchIds([userBranchId]);
      setIsLoadingBranches(false);
    } else {
      setIsLoadingBranches(false);
    }
  }, [isCafeOwner, userBranchId, showToast]);

  const fetchCategories = useCallback(() => {
    if (selectedBranchIds.length === 0) {
      setCategories([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all(
      selectedBranchIds.map((branchId) =>
        categoryApi.getAll(branchId).then((cats) =>
          cats.map((c) => ({
            ...c,
            branchId: c.branchId || branchId,
          }))
        )
      )
    )
      .then((branchCategories) => setCategories(branchCategories.flat()))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setIsLoading(false));
  }, [selectedBranchIds, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDisplayOrder('0');
    setDescription('');
    // Default target branches in modal to the currently checked branches on the page (or all branches)
    setTargetBranchIds(
      selectedBranchIds.length > 0
        ? [...selectedBranchIds]
        : branches.map((b) => b.id)
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDisplayOrder(category.sort_order?.toString() || category.displayOrder?.toString() || '0');
    setDescription(category.description || '');
    setTargetBranchIds(category.branchId ? [category.branchId] : []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (!editingCategory && isCafeOwner && targetBranchIds.length === 0) {
      showToast('Please select at least one branch to create this category in', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          sort_order: parseInt(displayOrder, 10) || 0,
        });
        showToast('Category updated successfully', 'success');
      } else {
        const branchesToCreate = isCafeOwner
          ? targetBranchIds
          : userBranchId
          ? [userBranchId]
          : [];

        if (branchesToCreate.length === 0) {
          showToast('No target branch available for category creation', 'error');
          setIsSubmitting(false);
          return;
        }

        await Promise.all(
          branchesToCreate.map((branchId) =>
            categoryApi.create({
              branch_id: branchId,
              name: name.trim(),
              description: description.trim() || undefined,
              sort_order: parseInt(displayOrder, 10) || 0,
            })
          )
        );

        showToast(
          `Category created successfully for ${branchesToCreate.length} branch${
            branchesToCreate.length === 1 ? '' : 'es'
          }`,
          'success'
        );
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || 'Failed to save category';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await categoryApi.delete(deletingId);
      showToast('Category deleted', 'success');
      setDeletingId(null);
      fetchCategories();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Category Name',
      accessor: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
            <FolderTree className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{c.name}</p>
            {c.description && (
              <p className="text-[10px] text-slate-400 truncate max-w-xs">{c.description}</p>
            )}
          </div>
        </div>
      ),
    },
    ...(isCafeOwner && branches.length > 0
      ? [
          {
            header: 'Branch',
            accessor: (c: Category) => {
              const branch = branches.find((b) => b.id === c.branchId);
              return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                  <GitBranch className="h-3 w-3 text-purple-500 shrink-0" />
                  {branch?.name || (c.branchId ? 'Assigned Branch' : 'All Branches')}
                </span>
              );
            },
          },
        ]
      : []),
    {
      header: 'Sort Priority',
      accessor: (c) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {c.sort_order ?? c.displayOrder ?? 0}
        </span>
      ),
    },
    ...(canUpdate || canDelete
      ? [
          {
            header: 'Actions',
            accessor: (c: Category) => (
              <div className="flex items-center gap-1">
                {canUpdate && (
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeletingId(c.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Categories</h1>
          <p className="text-xs text-slate-500">
            Organize dishes into sections (e.g. Appetizers, Desserts, Beverages) and assign them to branches
          </p>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenCreate}
            disabled={isCafeOwner && !isLoadingBranches && branches.length === 0}
            title={
              isCafeOwner && !isLoadingBranches && branches.length === 0
                ? 'Create a branch first before adding categories'
                : undefined
            }
          >
            Create Category
          </Button>
        )}
      </div>

      {/* Branch selector checkboxes for Cafe Owners */}
      {isCafeOwner && branches.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Select Branches to View & Add:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700">
                {selectedBranchIds.length} of {branches.length} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedBranchIds(branches.map((b) => b.id))}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedBranchIds([])}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {branches.map((branch) => {
              const isChecked = selectedBranchIds.includes(branch.id);
              return (
                <label
                  key={branch.id}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all ${
                    isChecked
                      ? 'border-purple-300 bg-purple-50/50 text-purple-900 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => {
                      setSelectedBranchIds((current) =>
                        event.target.checked
                          ? [...current, branch.id]
                          : current.filter((id) => id !== branch.id)
                      );
                    }}
                    className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                  />
                  <div className="flex flex-col truncate">
                    <span className="truncate">{branch.name}</span>
                    {branch.city && (
                      <span className="text-[10px] text-slate-400 font-normal truncate">
                        <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
                        {branch.city}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditional states for branches */}
      {isLoadingBranches ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading branch information...</div>
      ) : isCafeOwner && branches.length === 0 ? (
        /* Only display when there are TRULY NO BRANCHES created yet */
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold">No branches found</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Please create a branch first before adding menu categories.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/branches')}
          >
            Create Branch
          </Button>
        </div>
      ) : !isCafeOwner && !userBranchId ? (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          No branch assigned to your account. Please contact your administrator.
        </div>
      ) : isCafeOwner && selectedBranchIds.length === 0 ? (
        <div className="p-6 bg-purple-50 border border-purple-200 rounded-2xl text-sm text-purple-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-bold">No branches selected</p>
            <p className="text-xs text-purple-700 mt-0.5">
              Please check at least one branch checkbox above to view and add menu categories.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBranchIds(branches.map((b) => b.id))}
          >
            Select All Branches
          </Button>
        </div>
      ) : (
        /* Table of categories with universal pagination */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading menu categories...</div>
          ) : (
            <Table
              columns={columns}
              data={categories}
              emptyMessage={
                selectedBranchIds.length > 0
                  ? "No categories found for the selected branch(es). Click 'Create Category' to add one."
                  : 'No categories created'
              }
            />
          )}
        </div>
      )}

      {/* Modal for Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Target branch selection checkboxes when creating for Cafe Owner */}
          {!editingCategory && isCafeOwner && branches.length > 0 && (
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Add to Branch(es) *
                </label>
                <div className="flex gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTargetBranchIds(branches.map((b) => b.id))}
                    className="text-purple-600 hover:underline font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setTargetBranchIds([])}
                    className="text-slate-500 hover:underline font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {branches.map((branch) => {
                  const isChecked = targetBranchIds.includes(branch.id);
                  return (
                    <label
                      key={branch.id}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                        isChecked
                          ? 'bg-white border-purple-300 text-purple-900 font-bold shadow-xs'
                          : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetBranchIds((prev) => [...prev, branch.id]);
                          } else {
                            setTargetBranchIds((prev) => prev.filter((id) => id !== branch.id));
                          }
                        }}
                        className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600 cursor-pointer"
                      />
                      <span className="truncate">{branch.name}</span>
                      {branch.city && (
                        <span className="text-[10px] text-slate-400 font-normal ml-auto">
                          {branch.city}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-500">
                Category will be created in{' '}
                <span className="font-bold text-purple-700">
                  {targetBranchIds.length} branch{targetBranchIds.length === 1 ? '' : 'es'}
                </span>
                .
              </p>
            </div>
          )}

          {editingCategory && (
            <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3 text-xs text-purple-800">
              <span className="font-semibold">Branch: </span>
              {branches.find((b) => b.id === editingCategory.branchId)?.name || 'Current Assigned Branch'}
            </div>
          )}

          <Input
            label="Category Name *"
            placeholder="e.g. Chef's Desserts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Description"
            placeholder="e.g. Fresh seasonal desserts"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Display Sort Priority"
            type="number"
            placeholder="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isSubmitting}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this menu category? Dishes in this category will be unassigned."
      />
    </div>
  );
};

export default CategoriesListPage;