import React from 'react';
import { QrCode, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md shadow-amber-500/20">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base">QR DineMenu SaaS</span>
            <p className="text-xs text-slate-500">Multi-branch digital menu platform for restaurants & cafes</p>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          <span>for modern restaurant owners</span>
        </div>
      </div>
    </footer>
  );
};
