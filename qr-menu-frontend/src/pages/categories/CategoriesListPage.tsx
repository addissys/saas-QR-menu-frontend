import React, { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { categoryApi } from '../../api/category.api';
import { branchApi } from '../../api/branch.api';
import { Category, Branch } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { normalizeRole } from '../../utils/roles';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table, Column } from '../../components/ui/Table';
import { Plus, FolderTree, Edit3, Trash2 } from 'lucide-react';

const CategoriesListPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  const normalizedRole = normalizeRole(user?.role);
  const isCafeOwner =
    normalizedRole === 'CAFE_OWNER' ||
    normalizedRole === 'OWNER' ||
    normalizedRole === 'RESTAURANT_OWNER' ||
    normalizedRole === 'SUPER_ADMIN';

  // For branch managers / staff, branchId is on the user object
  const userBranchId = user?.branch_id || user?.branchId || user?.assignedBranchIds?.[0];

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load branches (for Cafe Owners who manage multiple branches)
  useEffect(() => {
    if (isCafeOwner) {
      branchApi.getAll().then((res) => {
        setBranches(res.data);
        setSelectedBranchIds((current) => current.length > 0 || res.data.length === 0
          ? current
          : res.data.map((branch) => branch.id));
      }).catch(() => {});
    } else if (userBranchId) {
      setSelectedBranchIds([userBranchId]);
    }
  }, [isCafeOwner, userBranchId]);

  const activeBranchId = selectedBranchIds[0] || userBranchId || '';
  const visibleCategories = categories.filter((category, index, allCategories) => {
    const categoryName = category.name.trim().toLowerCase();
    return allCategories.findIndex(
      (candidate) => candidate.name.trim().toLowerCase() === categoryName
    ) === index;
  });

  const fetchCategories = useCallback(() => {
    if (selectedBranchIds.length === 0) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all(selectedBranchIds.map((branchId) => categoryApi.getAll(branchId)))
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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDisplayOrder(category.sort_order?.toString() || category.displayOrder?.toString() || '0');
    setDescription(category.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const branchIdsToUse = selectedBranchIds;

    if (!editingCategory && branchIdsToUse.length === 0) {
      showToast('Please select at least one branch to create this category in', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          sort_order: parseInt(displayOrder, 10) || 0,
        });
        showToast('Category updated successfully', 'success');
      } else {
        await Promise.all(branchIdsToUse.map((branchId) => categoryApi.create({
            branch_id: branchId,
            name: name.trim(),
            description: description.trim() || undefined,
            sort_order: parseInt(displayOrder, 10) || 0,
          })));
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      const message = error.response?.data?.message || 'Failed to save category';
      showToast(message, 'error');
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
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
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
    {
      header: 'Sort Priority',
      accessor: (c) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {c.sort_order ?? c.displayOrder ?? 0}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (c) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeletingId(c.id)}
            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Categories</h1>
          <p className="text-xs text-slate-500">Organize dishes into sections (e.g. Appetizers, Desserts, Cocktails)</p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
          Create Category
        </Button>
      </div>

      {/* Branch selector for Cafe Owners */}
      {isCafeOwner && branches.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">Viewing Branches:</span>
            <span className="text-[11px] text-slate-500">
              {selectedBranchIds.length} selected
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <label
                key={branch.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedBranchIds.includes(branch.id)}
                  onChange={(event) => {
                    setSelectedBranchIds((current) => event.target.checked
                      ? [...current, branch.id]
                      : current.filter((id) => id !== branch.id));
                  }}
                  className="h-4 w-4 accent-purple-600"
                />
                {branch.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {!activeBranchId && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
          {isCafeOwner
            ? 'No branches found. Please create a branch first before adding categories.'
            : 'No branch assigned to your account. Please contact your administrator.'}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading menu categories...</div>
        ) : (
          <Table columns={columns} data={visibleCategories} emptyMessage="No categories created" />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {!editingCategory && isCafeOwner && (
            <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-700">
              This category will be created for {selectedBranchIds.length} selected branch{selectedBranchIds.length === 1 ? '' : 'es'}.
            </p>
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
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
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