import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category.api';
import { Category } from '../../types';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Table, Column } from '../../components/ui/Table';
import { Plus, FolderTree, Edit3, Trash2 } from 'lucide-react';

export const CategoriesListPage: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = () => {
    setIsLoading(true);
    categoryApi
      .getAll()
      .then((res) => setCategories(res.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setDisplayOrder('0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setDisplayOrder(category.displayOrder?.toString() || '0');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, {
          name,
          displayOrder: parseInt(displayOrder) || 0,
        });
        showToast('Category updated successfully', 'success');
      } else {
        await categoryApi.create({
          name,
          displayOrder: parseInt(displayOrder) || 0,
        });
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast('Failed to save category', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await categoryApi.delete(deletingId);
      showToast('Category deleted', 'success');
      setDeletingId(null);
      fetchCategories();
    } catch (err) {
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
            <p className="text-[10px] text-slate-400">ID: {c.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Sort Priority',
      accessor: (c) => <span className="font-mono text-xs font-bold text-slate-700">{c.displayOrder || 0}</span>,
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
          <Input
            label="Category Name *"
            placeholder="e.g. Chef's Desserts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
