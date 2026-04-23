import type { Supplier } from '../types';
import EmailsTab from '../../shared/components/EmailsTab';

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

export default function SupplierEmailsModal({ supplier, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-hidden" onClick={onClose}>
      <div
        className="bg-slate-50 w-full h-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 shrink-0 px-8 py-4 flex items-center gap-5">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line text-lg"></i>
            Back to Suppliers
          </button>

          <div className="w-px h-8 bg-slate-100"></div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
              <i className="ri-truck-line text-orange-600 text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-bold text-slate-900">{supplier.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">Supplier</span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{supplier.id} · {supplier.primaryContact.email}</p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b border-slate-100 px-8">
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 border-slate-900 text-slate-900">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-mail-line text-sm"></i>
              </div>
              Emails
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <EmailsTab
              entityType="supplier"
              entityId={supplier.id}
              entityName={supplier.primaryContact.name}
              entityEmail={supplier.primaryContact.email}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
