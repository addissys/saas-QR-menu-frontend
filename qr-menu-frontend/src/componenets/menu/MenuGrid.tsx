import React from 'react';
import { MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { EmptyState } from '../ui/EmptyState';
import { UtensilsCrossed } from 'lucide-react';

interface MenuGridProps {
  items: MenuItem[];
  isLoading?: boolean;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string, isAvailable: boolean) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onClickDetail?: (item: MenuItem) => void;
  canManage?: boolean;
  onAddNew?: () => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  items,
  isLoading = false,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  onClickDetail,
  canManage = false,
  onAddNew,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="h-80 bg-white rounded-3xl border border-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={UtensilsCrossed}
        title="No Menu Items Found"
        description="There are no dishes or drinks cataloged matching your current filter criteria."
        actionText={canManage ? 'Add New Menu Item' : undefined}
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
          onToggleFeatured={onToggleFeatured}
          onClickDetail={onClickDetail}
          canManage={canManage}
        />
      ))}
    </div>
  );
};
