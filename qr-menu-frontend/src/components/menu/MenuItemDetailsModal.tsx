import React from 'react';
import { MenuItem } from '../../types';
import { Modal } from '../ui/Modal';
import { Clock, Star, Flame, Utensils } from 'lucide-react';

interface MenuItemDetailsModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MenuItemDetailsModal: React.FC<MenuItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} maxWidth="md">
      <div className="space-y-5">
        <div className="relative h-60 rounded-2xl overflow-hidden bg-slate-100">
          <img
            src={
              item.imageUrl ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
            }
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white font-black text-lg px-4 py-1.5 rounded-2xl border border-white/20 shadow-lg">
            ${item.price.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
              {item.categoryName || 'General Category'}
            </span>
            {item.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-extrabold uppercase">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Chef's Special
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Clock className="h-5 w-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Prep Time</p>
              <p className="text-xs font-bold text-slate-900">
                {item.preparationTimeMinutes || 15} Minutes
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <Utensils className="h-5 w-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Availability</p>
              <p className="text-xs font-bold text-slate-900">
                {item.isAvailable ? 'In Stock / Ready' : 'Sold Out Today'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
