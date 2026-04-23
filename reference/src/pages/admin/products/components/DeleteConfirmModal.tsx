import type { Product } from '../page';

interface Props {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ product, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-7">
          <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mb-4">
            <i className="ri-delete-bin-line text-red-600 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Product</h3>
          <p className="text-sm text-slate-500 mb-2">
            Are you sure you want to delete <span className="font-semibold text-slate-800">{product.name}</span>?
          </p>
          <p className="text-xs text-red-500">This will remove it from the live site immediately.</p>
        </div>
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
