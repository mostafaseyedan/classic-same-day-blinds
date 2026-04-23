import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderFullView from './components/OrderFullView';
import type { Order } from './types';

function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem('orders');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveOrder(updated: Order) {
  try {
    const orders = loadOrders();
    const next = orders.map((o: any) => String(o.id) === String(updated.id) ? { ...o, ...updated } : o);
    // If not found, append
    if (!orders.find((o: any) => String(o.id) === String(updated.id))) next.push(updated);
    localStorage.setItem('orders', JSON.stringify(next));
  } catch { /* ignore */ }
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const orders = loadOrders();
    const found = orders.find((o: any) => String(o.id) === String(id));
    if (found) {
      setOrder(found);
    } else {
      setNotFound(true);
    }
  }, [id]);

  const handleStatusChange = (orderId: string, status: string) => {
    setOrder((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, status: status as any };
      saveOrder(updated);
      return updated;
    });
  };

  const handleSaveTracking = (orderId: string, tracking: string, carrier?: string) => {
    setOrder((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, trackingNumber: tracking, ...(carrier ? { carrier } : {}) };
      saveOrder(updated);
      return updated;
    });
  };

  const handlePrintInvoice = () => window.print();

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <i className="ri-file-damage-line text-slate-400 text-3xl"></i>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Order Not Found</p>
          <p className="text-sm text-slate-500 mt-1">Order #{id} does not exist or was removed.</p>
        </div>
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <OrderFullView
      order={order}
      onClose={() => navigate('/admin/orders')}
      onStatusChange={handleStatusChange}
      onSaveTracking={handleSaveTracking}
      onPrintInvoice={handlePrintInvoice}
      onCreateLabel={() => navigate('/admin/orders')}
    />
  );
}
