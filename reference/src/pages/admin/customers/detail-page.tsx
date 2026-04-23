import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerFullView from './components/CustomerFullView';

function loadCustomers(): any[] {
  try {
    const stored = localStorage.getItem('admin_customers');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const customers = loadCustomers();
    const found = customers.find((c: any) => String(c.id) === String(id));
    if (found) {
      setCustomer(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleEdit = (updated: any) => {
    const customers = loadCustomers();
    const updatedList = customers.map((c: any) => String(c.id) === String(id) ? { ...c, ...updated } : c);
    localStorage.setItem('admin_customers', JSON.stringify(updatedList));
    setCustomer((prev: any) => ({ ...prev, ...updated }));
  };

  const handleDelete = () => {
    const customers = loadCustomers();
    const updated = customers.filter((c: any) => String(c.id) !== String(id));
    localStorage.setItem('admin_customers', JSON.stringify(updated));
    navigate('/admin/customers');
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <i className="ri-user-unfollow-line text-slate-400 text-3xl"></i>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Customer Not Found</p>
          <p className="text-sm text-slate-500 mt-1">Customer #{id} does not exist.</p>
        </div>
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i> Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          <span>All Customers</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-slate-900">
          {customer.firstName} {customer.lastName}
        </span>
      </div>

      <div className="p-6">
        <CustomerFullView
          customer={customer}
          onClose={() => navigate('/admin/customers')}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
