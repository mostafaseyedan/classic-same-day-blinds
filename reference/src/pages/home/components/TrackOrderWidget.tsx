import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; step: number }> = {
  'Working on Order':   { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  icon: 'ri-tools-line',            step: 1 },
  'Order Shipped':      { color: 'text-sky-700',    bg: 'bg-sky-50 border-sky-200',      icon: 'ri-truck-line',            step: 2 },
  'Out for Delivery':   { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: 'ri-e-bike-2-line',        step: 3 },
  'Order Delivered':    { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: 'ri-checkbox-circle-line',  step: 4 },
  'Order Cancelled':    { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      icon: 'ri-close-circle-line',     step: 0 },
};

const STEPS = ['Working on Order', 'Order Shipped', 'Out for Delivery', 'Order Delivered'];

interface Order {
  id: string;
  date: string;
  status: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

export default function TrackOrderWidget() {
  const { language } = useLanguage();
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim().toUpperCase();
    if (!trimmed) return;

    setSearched(true);
    setNotFound(false);
    setResult(null);

    // Search all orders in localStorage
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith('order_') || k.startsWith('pending_order_')
    );

    // Also check confirmed orders array
    const allOrders: Order[] = JSON.parse(localStorage.getItem('orders') ?? '[]');

    // Search stored orders
    const found = allOrders.find(
      (o: Order) => o.id.toUpperCase() === trimmed
    );

    if (found) {
      setResult(found);
    } else {
      // Try pending orders
      const pendingKey = `pending_order_${trimmed}`;
      const pendingRaw = localStorage.getItem(pendingKey);
      if (pendingRaw) {
        setResult(JSON.parse(pendingRaw));
      } else {
        setNotFound(true);
      }
    }
  };

  const cfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG['Working on Order']) : null;
  const currentStep = cfg?.step ?? 0;

  return (
    <section className="py-16 bg-gray-50 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-green-700 text-white rounded-xl mx-auto mb-4">
            <i className="ri-map-pin-line text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {language === 'es' ? 'Rastrear mi Pedido' : 'Track My Order'}
          </h2>
          <p className="text-sm text-gray-500">
            {language === 'es'
              ? 'Ingresa tu número de pedido para ver el estado en tiempo real'
              : 'Enter your order number to see real-time status'}
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
              <i className="ri-search-line text-base"></i>
            </div>
            <input
              type="text"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setSearched(false); }}
              placeholder={language === 'es' ? 'ej. ORD-1712345678' : 'e.g. ORD-1712345678'}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-green-700 text-white font-bold text-sm rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
          >
            {language === 'es' ? 'Rastrear' : 'Track'}
          </button>
        </form>

        {/* Not found */}
        {searched && notFound && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-3">
              <i className="ri-file-unknow-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-sm font-bold text-gray-800 mb-1">
              {language === 'es' ? 'Pedido no encontrado' : 'Order not found'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {language === 'es'
                ? 'Verifica el número de pedido o contáctanos si necesitas ayuda.'
                : 'Double-check your order number or contact us if you need help.'}
            </p>
            <Link
              to="/track-order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-800 cursor-pointer"
            >
              <i className="ri-arrow-right-line"></i>
              {language === 'es' ? 'Ir a la página de rastreo' : 'Go to full tracking page'}
            </Link>
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Status header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${cfg.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 flex items-center justify-center rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.bg.replace('bg-', 'border-').replace('-50', '-300')}`}>
                  <i className={`${cfg.icon} text-lg`}></i>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {language === 'es' ? 'Estado del Pedido' : 'Order Status'}
                  </p>
                  <p className={`text-sm font-bold ${cfg.color}`}>{result.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{language === 'es' ? 'Pedido' : 'Order'}</p>
                <p className="text-sm font-bold text-gray-800">{result.id}</p>
              </div>
            </div>

            {/* Progress tracker */}
            {result.status !== 'Order Cancelled' && (
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-0">
                  {STEPS.map((step, idx) => {
                    const done = currentStep > idx + 1;
                    const active = currentStep === idx + 1;
                    const stepCfg = STATUS_CONFIG[step];
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all ${
                            done
                              ? 'bg-green-700 border-green-700 text-white'
                              : active
                              ? 'bg-green-50 border-green-600 text-green-700'
                              : 'bg-white border-gray-200 text-gray-300'
                          }`}>
                            {done
                              ? <i className="ri-check-line text-sm"></i>
                              : <i className={`${stepCfg?.icon} text-sm`}></i>
                            }
                          </div>
                          <p className={`text-[10px] font-semibold text-center leading-tight ${
                            done || active ? 'text-gray-700' : 'text-gray-300'
                          }`} style={{ maxWidth: '60px' }}>
                            {step.replace('Order ', '')}
                          </p>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 -mt-5 transition-all ${done ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {language === 'es' ? 'Artículos del Pedido' : 'Order Items'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(result.date).toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              <div className="space-y-1.5 mb-4">
                {result.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1 mr-2">
                      <span className="text-gray-400 mr-1">×{item.quantity}</span>{item.name}
                    </span>
                    <span className="font-semibold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                {result.items.length > 3 && (
                  <p className="text-xs text-gray-400">+{result.items.length - 3} {language === 'es' ? 'más artículos' : 'more items'}</p>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-900">Total</span>
                <span className="text-base font-bold text-green-700">${result.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="px-6 pb-5">
              <Link
                to={`/track-order?id=${result.id}`}
                className="block w-full text-center py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
              >
                {language === 'es' ? 'Ver detalles completos' : 'View full details'}
                <i className="ri-arrow-right-line ml-1.5"></i>
              </Link>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          {language === 'es'
            ? 'También puedes ver todos tus pedidos en '
            : 'You can also view all your orders at '}
          <Link to="/track-order" className="text-green-700 font-semibold hover:underline cursor-pointer">
            {language === 'es' ? 'la página de rastreo' : 'the tracking page'}
          </Link>
        </p>
      </div>
    </section>
  );
}
