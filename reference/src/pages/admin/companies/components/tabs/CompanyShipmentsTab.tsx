import type { Company } from '../../types';

interface Props {
  company: Company;
  orders: any[];
}

const CARRIERS = ['FedEx Freight', 'UPS Ground', 'XPO Logistics', 'Estes Express', 'Old Dominion'];

function getShipmentMock(order: any, idx: number) {
  const carriersArr = CARRIERS;
  const carrier = carriersArr[idx % carriersArr.length];
  const trackingNum = `1Z${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const isDelivered = (order.status ?? '').toLowerCase().includes('deliver');
  const isShipped = (order.status ?? '').toLowerCase().includes('ship') || isDelivered;

  const waypoints = [
    { event: 'Package Picked Up', location: 'Origin Facility', time: new Date(new Date(order.date).getTime() + 2 * 3600000).toISOString(), done: true },
    { event: 'Arrived at Sorting Hub', location: 'Regional Hub', time: new Date(new Date(order.date).getTime() + 18 * 3600000).toISOString(), done: isShipped },
    { event: 'Out for Delivery', location: 'Destination Facility', time: new Date(new Date(order.date).getTime() + 72 * 3600000).toISOString(), done: isDelivered },
    { event: 'Delivered', location: `${order.city ?? 'Destination'}`, time: new Date(new Date(order.date).getTime() + 96 * 3600000).toISOString(), done: isDelivered },
  ];

  const estDelivery = new Date(new Date(order.date).getTime() + 5 * 86400000);
  const progress = isDelivered ? 100 : isShipped ? 60 : 20;

  return { carrier, trackingNum, waypoints, estDelivery, progress, isDelivered, isShipped };
}

export default function CompanyShipmentsTab({ company, orders }: Props) {
  const shippedOrders = orders.filter((o) => {
    const s = (o.status ?? '').toLowerCase();
    return s.includes('ship') || s.includes('deliver') || s.includes('transit');
  });

  const allOrders = orders.filter((_, i) => i < 5);

  if (allOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="ri-truck-line text-slate-400 text-2xl"></i>
        </div>
        <p className="text-sm font-semibold text-slate-500">No shipments yet</p>
        <p className="text-xs text-slate-400 mt-1">Shipments will appear here once orders are placed</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: allOrders.length, icon: 'ri-truck-line', color: 'text-slate-600 bg-slate-100' },
          { label: 'In Transit', value: allOrders.filter((o) => (o.status ?? '').toLowerCase().includes('ship')).length, icon: 'ri-map-pin-time-line', color: 'text-teal-600 bg-teal-50' },
          { label: 'Delivered', value: allOrders.filter((o) => (o.status ?? '').toLowerCase().includes('deliver')).length, icon: 'ri-checkbox-circle-line', color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Pending Dispatch', value: allOrders.filter((o) => { const s = (o.status ?? '').toLowerCase(); return !s.includes('ship') && !s.includes('deliver'); }).length, icon: 'ri-time-line', color: 'text-amber-600 bg-amber-50' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${k.color}`}>
              <i className={`${k.icon} text-base`}></i>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipment cards */}
      <div className="space-y-4">
        {allOrders.map((order, idx) => {
          const ship = getShipmentMock(order, idx);
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-bold text-slate-900 font-mono">{order.id}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${ship.isDelivered ? 'bg-emerald-100 text-emerald-700' : ship.isShipped ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                      {ship.isDelivered ? 'Delivered' : ship.isShipped ? 'In Transit' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Carrier: <span className="font-semibold text-slate-700">{ship.carrier}</span> &bull; Tracking: <span className="font-mono text-slate-700">{ship.trackingNum}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Est. Delivery</p>
                  <p className="text-sm font-bold text-slate-900">{ship.estDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Origin</span>
                  <span className="font-semibold text-slate-700">{ship.progress}% complete</span>
                  <span>{company.city}, {company.state}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all ${ship.isDelivered ? 'bg-emerald-500' : 'bg-teal-400'}`} style={{ width: `${ship.progress}%` }}></div>
                </div>
              </div>

              {/* Waypoints */}
              <div className="relative">
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-slate-100"></div>
                <div className="space-y-3">
                  {ship.waypoints.map((wp, wi) => (
                    <div key={wi} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 ${wp.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                        {wp.done && <i className="ri-check-line text-white text-[10px]"></i>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${wp.done ? 'text-slate-900' : 'text-slate-400'}`}>{wp.event}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(wp.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400">{wp.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
