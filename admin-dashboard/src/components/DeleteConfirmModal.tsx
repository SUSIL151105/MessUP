import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType: 'student' | 'food incharge' | 'mess' | 'hostel' | 'institution' | 'announcement' | 'complaint' | 'item' | 'rating' | 'menu';
  warningText?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  itemType,
  warningText,
  isDeleting = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with warning badge */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600 flex-shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm permanent removal of this {itemType}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="px-6 py-2 space-y-3">
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Target Item</span>
            <p className="font-bold text-slate-900 text-sm truncate font-mono">
              {itemName}
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {warningText || `Are you sure you want to permanently delete this ${itemType}? This action cannot be undone and will synchronize across all Android applications and the administrative cloud database.`}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
