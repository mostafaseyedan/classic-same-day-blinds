import type { Customer } from '../CustomerFormModal';

interface Props {
  customer: Customer;
  orders: any[];
}

interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  service: string;
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Delayed' | 'Exception';
  origin: string;
  destination: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: string;
  dimensions: string;
  waypoints: { timestamp: string; location: string; event: string; done: boolean }[];
}

function buildShipments(orders: any[], customer: Customer): Shipment[] {
  const carriers = [
    { name: 'FedEx Ground', service: 'Ground Economy' },
    { name: 'UPS', service: 'UPS Ground' },
    { name: 'XPO Logistics', service: 'LTL Freight' },
    { name: 'USPS', service: 'Priority Mail' },
    { name: 'Estes Express', service: 'Standard Freight' },
  ];
  const trackingBases = ['7489234', '1Z999AA', '9400111', '3009480', '0719890'];
  const origin = 'Fort Worth, TX';
  const dest = [customer.city, customer.state].filter(Boolean).join(', ') || 'Los Angeles, CA';

  return orders.slice(0, 6).map((o, i) => {
    const c = carriers[i % carriers.length];
    const delivered = o.status === 'Delivered';
    const inTransit = o.status?.includes('Shipped') || o.status?.includes('Fulfil');
    const shipDate = new Date(new Date(o.date).getTime() + 86400000);
    const estDate = new Date(shipDate.getTime() + (4 + i) * 86400000);

    const waypoints = [
      { timestamp: new Date(o.date).toLocaleString(), location: 'Fort Worth, TX', event: 'Order picked up at warehouse', done: true },
      { timestamp: new Date(shipDate).toLocaleString(), location: 'Dallas Distribution Center, TX', event: 'Departed shipping facility', done: true },
      { timestamp: new Date(shipDate.getTime() + 86400000).toLocaleString(), location: 'Phoenix, AZ', event: 'In transit — arrived at sorting hub', done: delivered || inTransit },
      { timestamp: new Date(shipDate.getTime() + 2 * 86400000).toLocaleString(), location: 'Los Angeles Hub, CA', event: 'Package arrived at destination facility', done: delivered },
      { timestamp: new Date(estDate).toLocaleString(), location: dest, event: 'Delivered to recipient', done: delivered },
    ];

    return {
      id: `SHP-${30000 + i}`,
      orderId: o.id,
      carrier: c.name,
      trackingNumber: `${trackingBases[i % trackingBases.length]}${String(Date.now()).slice(-7)}`,
      service: c.service,
      status: delivered ? 'Delivered' : inTransit ? 'In Transit' : i % 7 === 0 ? 'Delayed' : 'In Transit',
      origin,
      destination: dest,
      estimatedDelivery: estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      actualDelivery: delivered ? estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
      weight: `${(20 + i * 7).toFixed(1)} lbs`,
      dimensions: `${24 + i * 2}" × ${12}\" × ${8}"`,
      waypoints,
    };
  });
}

function getStatusStyle(s: string) {
  switch (s) {
    case 'Delivered': return 'bg-emerald-100 text-emerald-700';
    case 'In Transit': return 'bg-teal-100 text-teal-700';
    case 'Out for Delivery': return 'bg-sky-100 text-sky-700';
    case 'Delayed': return 'bg-amber-100 text-amber-700';
    case 'Exception': return 'bg-red-100 text-red-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

function getCarrierIcon(carrier: string) {
  if (carrier.includes('FedEx')) return 'ri-flight-takeoff-line';
  if (carrier.includes('UPS')) return 'ri-truck-line';
  if (carrier.includes('USPS')) return 'ri-mail-send-line';
  return 'ri-truck-fill';
}

export default function CustShipmentsTab({ customer, orders }: Props) {
  const shipments = buildShipments(orders, customer);

  if (shipments.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-xl text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="ri-truck-line text-2xl text-slate-400"></i>
        </div>
        <p className="text-sm font-semibold text-slate-500">No shipments yet</p>
      </div>
    );
  }

  const inTransit = shipments.filter((s) => s.status === 'In Transit' || s.status === 'Out for Delivery').length;
  const delivered = shipments.filter((s) => s.status === 'Delivered').length;
  const delayed = shipments.filter((s) => s.status === 'Delayed').length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Shipments', value: shipments.length, icon: 'ri-box-3-line', color: 'text-slate-700', bg: 'bg-slate-50' },
          { label: 'In Transit', value: inTransit, icon: 'ri-truck-line', color: 'text-teal-700', bg: 'bg-teal-50' },
          { label: 'Delivered', value: delivered, icon: 'ri-checkbox-circle-line', color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Delayed', value: delayed, icon: 'ri-error-warning-line', color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`w-9 h-9 bg-white rounded-xl flex items-center justify-center ${s.color}`}>
              <i className={`${s.icon} text-lg`}></i>
            </div>
            <div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shipment cards */}
      <div className="space-y-4">
        {shipments.map((shp) => (
          <div key={shp.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 flex items-start gap-4 border-b border-slate-50">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                <i className={`${getCarrierIcon(shp.carrier)} text-white text-base`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{shp.carrier}</span>
                  <span className="text-xs text-slate-400">{shp.service}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusStyle(shp.status)}`}>{shp.status}</span>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {shp.trackingNumber} &bull; {shp.id} &bull; Order: {shp.orderId}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-500">Est. Delivery</p>
                <p className="text-sm font-bold text-slate-900">{shp.actualDelivery ?? shp.estimatedDelivery}</p>
              </div>
            </div>

            {/* Route + Details */}
            <div className="px-5 py-4 grid grid-cols-3 gap-4">
              {/* Route */}
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tracking Waypoints</p>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-slate-100"></div>
                  <div className="space-y-3">
                    {shp.waypoints.map((wp, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${wp.done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-200'}`}>
                          <i className={`${wp.done ? 'ri-check-line text-white' : 'ri-circle-line text-slate-300'} text-xs`}></i>
                        </div>
                        <div className="flex-1 min-w-0 pb-1">
                          <p className={`text-xs font-semibold ${wp.done ? 'text-slate-800' : 'text-slate-400'}`}>{wp.event}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            <i className="ri-map-pin-line text-xs mr-1"></i>{wp.location}
                            <span className="ml-3 text-slate-300">{wp.timestamp}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Package details */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Package Info</p>
                <div className="space-y-2">
                  {[
                    { label: 'Origin', val: shp.origin },
                    { label: 'Destination', val: shp.destination },
                    { label: 'Weight', val: shp.weight },
                    { label: 'Dimensions', val: shp.dimensions },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-slate-400 shrink-0">{r.label}</span>
                      <span className="text-xs font-semibold text-slate-700 text-right">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
