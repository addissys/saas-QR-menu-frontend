import React, { useEffect, useState } from 'react';
import { menuItemApi } from '../../api/menu-item.api';
import { categoryApi } from '../../api/category.api';
import { MenuItem, Category } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { CategoryTabs } from '../../components/menu/CategoryTabs';
import { MenuItemDetailsModal } from '../../components/menu/MenuItemDetailsModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Plus, Search, UtensilsCrossed, Star, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const MenuItemsListPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const isStaff = user?.role === 'STAFF';
  const canManage = !isStaff;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('12.99');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Detail Modal & Delete Modal
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchItemsAndCategories = () => {
    setIsLoading(true);
    Promise.all([menuItemApi.getAll(), categoryApi.getAll()])
      .then(([mRes, cRes]) => {
        setMenuItems(mRes.data);
        setCategories(cRes.data);
        if (cRes.data.length > 0 && !categoryId) {
          setCategoryId(cRes.data[0].id);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchItemsAndCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('12.99');
    setCategoryId(categories[0]?.id || '');
    setImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setPrepTime('15');
    setIsAvailable(true);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId);
    setImageUrl(item.imageUrl || '');
    setPrepTime(item.preparationTimeMinutes?.toString() || '15');
    setIsAvailable(item.isAvailable);
    setIsFeatured(item.isFeatured);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price) || 0,
        categoryId,
        imageUrl,
        preparationTimeMinutes: parseInt(prepTime) || 15,
        isAvailable,
        isFeatured,
      };

      if (editingItem) {
        await menuItemApi.update(editingItem.id, payload);
        showToast('Menu item updated', 'success');
      } else {
        await menuItemApi.create(payload);
        showToast('New menu dish cataloged', 'success');
      }
      setIsModalOpen(false);
      fetchItemsAndCategories();
    } catch (err) {
      showToast('Failed to save menu item', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await menuItemApi.delete(deletingId);
      showToast('Item deleted', 'success');
      setDeletingId(null);
      fetchItemsAndCategories();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleToggleAvailability = async (id: string, current: boolean) => {
    try {
      await menuItemApi.updateAvailability(id, !current);
      showToast(`Dish marked as ${!current ? 'In Stock' : 'Sold Out'}`, 'info');
      fetchItemsAndCategories();
    } catch (err) {
      showToast('Failed to toggle availability', 'error');
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      await menuItemApi.updateFeatured(id, !current);
      showToast(`Special status updated`, 'info');
      fetchItemsAndCategories();
    } catch (err) {
      showToast('Failed to toggle featured status', 'error');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategoryId ? item.categoryId === selectedCategoryId : true;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {isStaff && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-purple-900">
          <CheckCircle2 className="h-5 w-5 text-purple-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Staff Operational Mode</p>
            <p className="text-purple-700">
              You are signed in as Kitchen Staff. You can toggle dish stock availability (In Stock / Sold Out) in real time. Catalog editing is managed by Branch Managers and Owners.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dishes & Menu Catalog</h1>
          <p className="text-xs text-slate-500">
            {isStaff
              ? 'Real-time kitchen inventory & dish stock controls'
              : 'Manage all food dishes, prices, stock availability, and special highlights'}
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenCreate}>
            Add Menu Item
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Filter catalog by dish name or description..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <CategoryTabs
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      </div>

      <MenuGrid
        items={filteredItems}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(id) => setDeletingId(id)}
        onToggleAvailability={handleToggleAvailability}
        onToggleFeatured={handleToggleFeatured}
        onClickDetail={(item) => setDetailItem(item)}
        canManage={canManage}
        onAddNew={handleOpenCreate}
      />

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Menu Dish' : 'Catalog New Dish'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Dish Name *"
            placeholder="e.g. Truffle Mushroom Penne"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              required
            />
            <Input
              label="Price ($) *"
              type="number"
              step="0.01"
              placeholder="14.50"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <Input
            label="Preparation Time (Minutes)"
            type="number"
            placeholder="15"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Ingredients
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the flavor profile, key ingredients, and preparation method..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded-md text-purple-600 focus:ring-purple-500"
              />
              Available In Kitchen Stock
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded-md text-purple-600 focus:ring-purple-500"
              />
              Chef's Special Highlight
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingItem ? 'Save Changes' : 'Add Dish to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      <MenuItemDetailsModal
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Menu Dish"
        message="Are you sure you want to permanently delete this dish from your digital menu catalog?"
      />
    </div>
  );
};
