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
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  // Branch for the create form (allows Cafe Owners to pick a branch)
  const [formBranchId, setFormBranchId] = useState<string>('');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load branches (for Cafe Owners who manage multiple branches)
  useEffect(() => {
    if (isCafeOwner) {
      branchApi.getAll().then((res) => {
        setBranches(res.data);
        if (res.data.length > 0 && !selectedBranchId) {
          setSelectedBranchId(res.data[0].id);
        }
      }).catch(() => {});
    } else if (userBranchId) {
      setSelectedBranchId(userBranchId);
    }
  }, [isCafeOwner, userBranchId]);

  const activeBranchId = isCafeOwner ? selectedBranchId : (userBranchId || selectedBranchId);

  const fetchCategories = useCallback(() => {
    if (!activeBranchId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    categoryApi
      .getAll(activeBranchId)
      .then((data) => setCategories(data))
      .catch(() => showToast('Failed to load categories', 'error'))
      .finally(() => setIsLoading(false));
  }, [activeBranchId, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDisplayOrder('0');
    setDescription('');
    setFormBranchId(activeBranchId || branches[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDisplayOrder(category.sort_order?.toString() || category.displayOrder?.toString() || '0');
    setDescription(category.description || '');
    setFormBranchId(activeBranchId || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const branchIdToUse = formBranchId || activeBranchId;

    if (!editingCategory && !branchIdToUse) {
      showToast('Please select a branch to create this category in', 'error');
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
        await categoryApi.create({
          branch_id: branchIdToUse!,
          name: name.trim(),
          description: description.trim() || undefined,
          sort_order: parseInt(displayOrder, 10) || 0,
        });
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
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 shrink-0">Viewing Branch:</span>
          <div className="w-64">
            <Select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
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
          <Table columns={columns} data={categories} emptyMessage="No categories created" />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Branch selector in form — only show for Cafe Owners on create */}
          {isCafeOwner && !editingCategory && branches.length > 1 && (
            <Select
              label="Branch *"
              value={formBranchId}
              onChange={(e) => setFormBranchId(e.target.value)}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              required
            />
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