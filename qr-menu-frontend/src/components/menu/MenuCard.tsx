import React from 'react';
import { MenuItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Clock, Star, Edit3, Trash2, Power, MapPin } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onEdit?: (item: MenuItem) => void;
  onDelete?: (id: string) => void;
  onToggleAvailability?: (id: string, isAvailable: boolean) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onClickDetail?: (item: MenuItem) => void;
  canManage?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  onClickDetail,
  canManage = true,
}) => {
  return (
    <div
      onClick={() => onClickDetail && onClickDetail(item)}
      className={`group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        !item.isAvailable ? 'opacity-75 bg-slate-50/60' : ''
      } ${onClickDetail ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Image Container */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img
            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
            }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {item.isFeatured && (
              <Badge variant="purple" size="sm">
                <Star className="h-3 w-3 mr-1 fill-purple-600 inline" />
                Featured
              </Badge>
            )}
            {!item.isAvailable && (
              <Badge variant="danger" size="sm">
                Sold Out
              </Badge>
            )}
          </div>

          {item.preparationTimeMinutes && (
            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 z-10 font-medium">
              <Clock className="h-3 w-3" />
              <span>{item.preparationTimeMinutes} min</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-2">
          <div className="flex items-center gap-2">
            {item.categoryName && (
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                {item.categoryName}
              </p>
            )}
            {item.branchName && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                <MapPin className="h-2.5 w-2.5" />
                {item.branchName}
              </span>
            )}
          </div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
            {item.name}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100/80">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Price</span>
          <span className="text-lg font-extrabold text-slate-900">
            ${item.price.toFixed(2)}
          </span>
        </div>

        {canManage && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onToggleAvailability && (
              <button
                title={item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                onClick={() => onToggleAvailability(item.id, !item.isAvailable)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  item.isAvailable
                    ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                <Power className="h-4 w-4" />
              </button>
            )}

            {onToggleFeatured && (
              <button
                title={item.isFeatured ? 'Remove Featured' : 'Mark Featured'}
                onClick={() => onToggleFeatured(item.id, !item.isFeatured)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  item.isFeatured
                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Star className="h-4 w-4" />
              </button>
            )}

            {onEdit && (
              <button
                title="Edit item"
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                title="Delete item"
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
