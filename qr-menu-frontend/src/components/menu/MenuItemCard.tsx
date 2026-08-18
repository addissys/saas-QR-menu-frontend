import React from 'react';
import { MenuItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Clock, Star, Edit3, Trash2, Eye } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string, isAvailable: boolean) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onClickDetail?: (item: MenuItem) => void;
  canManage?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  onClickDetail,
  canManage = false,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Image container */}
      <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onClickDetail?.(item)}>
        <img
          src={
            item.imageUrl ||
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shadow-md">
              <Star className="h-3 w-3 fill-white" /> Chef's Special
            </span>
          )}
          {!item.isAvailable && (
            <span className="inline-flex items-center px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider shadow-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Price Pill */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md text-white font-black text-sm px-3 py-1.5 rounded-2xl shadow-lg border border-white/20">
          ${item.price.toFixed(2)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {item.categoryName && (
            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest block">
              {item.categoryName}
            </span>
          )}
          <h3
            className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors cursor-pointer"
            onClick={() => onClickDetail?.(item)}
          >
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="h-3.5 w-3.5" />
            {item.preparationTimeMinutes || 15} mins prep
          </span>

          <div className="flex items-center gap-1">
            {onToggleAvailability && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAvailability(item.id, item.isAvailable);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                  item.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                {item.isAvailable ? 'In Stock' : 'Sold Out'}
              </button>
            )}

            {canManage && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  title="Edit Dish"
                >
                  <Edit3 className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(item.id);
                  }}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                  title="Delete Dish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
