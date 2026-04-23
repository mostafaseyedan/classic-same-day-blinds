import { useState } from 'react';
import type { Order } from '../../types';

interface Props {
  order: Order;
  onSaveTracking: (tracking: string) => void;
}

interface Waypoint {
  timestamp: string;
  location: string;
  event: string;
  detail: string;
  done: boolean;
  active: boolean;
}

interface ShipmentData {
  carrier: string;
  service: string;
  trackingNumber: string;
  status: string;
  statusColor: string;
  origin: string;
  destination: string;
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: string;
  dimensions: string;
  waypoints: Waypoint[];
}

const CARRIERS: Record<string, { icon: string; color: string }> = {
  'FedEx': { icon: 'ri-flight-takeoff-line', color: 'bg-orange-500' },
  'UPS': { icon: 'ri-truck-line', color: 'bg-amber-600' },
  'USPS': { icon: 'ri-mail-send-line', color: 'bg-slate-700' },
  'XPO': { icon: 'ri-truck-fill', color: 'bg-red-600' },
  'Estes': { icon: 'ri-truck-line', color: 'bg-sky-700' },
  'DHL': { icon: 'ri-flight-land-line', color: 'bg-yellow-500' },
};

function buildShipmentData(order: Order): ShipmentData | null {
  const hasTracking = order.status === 'Fulfilled & Shipped' || order.status === 'Delivered';
  if (!hasTracking && !order.trackingNumber) return null;

  const carriers = ['FedEx', 'UPS', 'USPS', 'XPO', 'Estes'];
  const services = ['Ground Economy', 'UPS Ground', 'Priority Mail', 'LTL Standard', 'Standard Freight'];
  const cIdx = (parseInt(order.id.replace(/\D/g, '')) % carriers.length);
  const carrier = carriers[cIdx];
  const service = services[cIdx];
  const trackingNumber = order.trackingNumber ?? `1Z999AA${order.id.replace(/\D/g, '').padEnd(10, '0')}`;

  const orderDate = new Date(order.date);
  const shipDate = new Date(orderDate.getTime() + 86400000);
  const estDate = new Date(shipDate.getTime() + 5 * 86400000);

  const isDelivered = order.status === 'Delivered';
  const isInTransit = order.status === 'Fulfilled & Shipped';

  const customerCity = 'Los Angeles, CA';

  const waypoints: Waypoint[] = [
    {
      timestamp: new Date(orderDate.getTime() + 2 * 3600000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: 'Fort Worth, TX — Warehouse',
      event: 'Order picked up from manufacturing facility',
      detail: 'Package scanned and manifested by carrier. Weight and dimensions verified.',
      done: true,
      active: false,
    },
    {
      timestamp: new Date(shipDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: 'Dallas, TX — Sorting Hub',
      event: 'Departed regional sort facility',
      detail: 'Package sorted and loaded onto long-haul transport. Next stop: Phoenix hub.',
      done: true,
      active: false,
    },
    {
      timestamp: new Date(shipDate.getTime() + 1.5 * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: 'Phoenix, AZ — Distribution Center',
      event: 'Arrived at intermediate distribution center',
      detail: 'Package in transit through Phoenix hub for re-sorting to final destination route.',
      done: isDelivered || isInTransit,
      active: isInTransit,
    },
    {
      timestamp: new Date(shipDate.getTime() + 3 * 86400000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: 'Los Angeles, CA — Delivery Facility',
      event: 'Arrived at destination delivery facility',
      detail: 'Package unloaded and sorted for final-mile delivery route assignment.',
      done: isDelivered,
      active: false,
    },
    {
      timestamp: new Date(estDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      location: customerCity + ' — Customer Address',
      event: isDelivered ? 'Delivered — Signature obtained' : 'Out for delivery',
      detail: isDelivered ? 'Package delivered successfully. Recipient signature obtained at front door.' : 'Package assigned to local delivery driver. Estimated delivery before 8:00 PM.',
      done: isDelivered,
      active: false,
    },
  ];

  const doneCount = waypoints.filter((w) => w.done).length;
  let statusLabel = 'Label Created';
  let statusColor = 'bg-slate-100 text-slate-600';
  if (isDelivered) { statusLabel = 'Delivered'; statusColor = 'bg-emerald-100 text-emerald-700'; }
  else if (doneCount >= 3) { statusLabel = 'In Transit — Approaching'; statusColor = 'bg-teal-100 text-teal-700'; }
  else if (doneCount >= 2) { statusLabel = 'In Transit'; statusColor = 'bg-teal-100 text-teal-700'; }
  else if (doneCount >= 1) { statusLabel = 'Picked Up'; statusColor = 'bg-sky-100 text-sky-700'; }

  return {
    carrier,
    service,
    trackingNumber,
    status: statusLabel,
    statusColor,
    origin: 'Fort Worth, TX',
    destination: customerCity,
    shipDate: shipDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    estimatedDelivery: estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    actualDelivery: isDelivered ? estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
    weight: `${(20 + parseInt(order.id.replace(/\D/g, '').slice(-2)) % 60).toFixed(1)} lbs`,
    dimensions: '72" × 12" × 8"',
    waypoints,
  };
}

export default function OrderShipmentTab({ order, onSaveTracking }: Props) {
  const [trackingDraft, setTrackingDraft] = useState(order.trackingNumber ?? '');
  const [saved, setSaved] = useState(false);
  const shipment = buildShipmentData(order);

  const carrierMeta = shipment ? (CARRIERS[shipment.carrier] ?? { icon: 'ri-truck-line', color: 'bg-slate-700' }) : null;
  const mapQuery = encodeURIComponent('Los Angeles, CA');

  const handleSave = () => {
    onSaveTracking(trackingDraft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!shipment) {
    return (
      <div className="space-y-5">
        {/* No tracking yet */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-truck-line text-amber-600 text-xl"></i>
          </div>
          <div>
            <p className="text-sm font-bold text-amber-800">No shipment tracked yet</p>
            <p className="text-sm text-amber-600 mt-1">Mark this order as "Fulfilled &amp; Shipped" and enter a tracking number to enable shipment tracking.</p>
          </div>
        </div>

        {/* Tracking input */}
        <div className="bg-white border border-slate-100 rounded-xl p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Add Tracking Number</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingDraft}
              onChange={(e) => setTrackingDraft(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784, 9400111899223397..."
              className="flex-1 text-sm font-mono border border-slate-200 focus:border-slate-400 rounded-xl px-4 py-3 outline-none text-slate-700 placeholder-slate-400"
            />
            <button
              onClick={handleSave}
              disabled={!trackingDraft.trim()}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl cursor-pointer whitespace-nowrap"
            >
              {saved ? <><i className="ri-check-line mr-1"></i>Saved!</> : 'Save Tracking'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeIdx = shipment.waypoints.findIndex((w) => w.active);
  const lastDoneIdx = shipment.waypoints.reduce((acc, w, i) => w.done ? i : acc, -1);
  const progressPct = ((lastDoneIdx + 1) / shipment.waypoints.length) * 100;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className={`flex items-center gap-4 px-6 py-5 rounded-xl ${shipment.status === 'Delivered' ? 'bg-emerald-50 border border-emerald-200' : 'bg-teal-50 border border-teal-200'}`}>
        <div className={`w-14 h-14 ${carrierMeta!.color} rounded-2xl flex items-center justify-center shrink-0`}>
          <i className={`${carrierMeta!.icon} text-white text-2xl`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="text-lg font-bold text-slate-900">{shipment.carrier} — {shipment.service}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${shipment.statusColor}`}>{shipment.status}</span>
          </div>
          <p className="text-sm font-mono text-slate-500">{shipment.trackingNumber}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">{shipment.actualDelivery ? 'Delivered' : 'Est. Delivery'}</p>
          <p className="text-lg font-bold text-slate-900">{shipment.actualDelivery ?? shipment.estimatedDelivery}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold">{shipment.origin}</span>
          <span className="font-semibold">{shipment.destination}</span>
        </div>
        <div className="relative w-full bg-slate-100 rounded-full h-3 mb-1">
          <div
            className={`h-3 rounded-full transition-all ${shipment.status === 'Delivered' ? 'bg-emerald-500' : 'bg-teal-500'}`}
            style={{ width: `${progressPct}%` }}
          />
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-white shadow-md transition-all ${shipment.status === 'Delivered' ? 'bg-emerald-500' : 'bg-teal-500'}`}
            style={{ left: `calc(${progressPct}% - 10px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Shipped {shipment.shipDate}</span>
          <span>{Math.round(progressPct)}% complete</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Waypoints */}
        <div className="col-span-2 bg-white border border-slate-100 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tracking Timeline</p>
          <div className="relative">
            <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-slate-100"></div>
            <div className="space-y-1">
              {shipment.waypoints.map((wp, i) => {
                const isActive = i === activeIdx || (!shipment.waypoints.some((w) => w.active) && i === lastDoneIdx && lastDoneIdx === shipment.waypoints.length - 1);
                return (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-3 transition-all ${
                      wp.done && i === lastDoneIdx && !isActive ? 'bg-emerald-500 border-emerald-500' :
                      wp.done ? 'bg-emerald-500 border-emerald-500' :
                      'bg-white border-slate-200'
                    }`}>
                      {wp.done ? (
                        <i className="ri-check-line text-white text-sm"></i>
                      ) : (
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                      )}
                    </div>
                    <div className={`flex-1 rounded-xl px-4 py-3 mb-2 border ${
                      isActive ? 'bg-teal-50 border-teal-200' : wp.done ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${wp.done ? 'text-slate-900' : 'text-slate-400'}`}>{wp.event}</p>
                          <p className={`text-xs mt-0.5 ${wp.done ? 'text-slate-500' : 'text-slate-300'}`}>
                            <i className="ri-map-pin-line mr-1"></i>{wp.location}
                          </p>
                          {wp.done && (
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{wp.detail}</p>
                          )}
                        </div>
                        <span className={`text-xs whitespace-nowrap shrink-0 font-medium ${wp.done ? 'text-slate-500' : 'text-slate-300'}`}>{wp.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="space-y-4">
          {/* Package Info */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Package Details</p>
            <div className="space-y-3">
              {[
                { label: 'Carrier', val: shipment.carrier },
                { label: 'Service', val: shipment.service },
                { label: 'Weight', val: shipment.weight },
                { label: 'Dimensions', val: shipment.dimensions },
                { label: 'Origin', val: shipment.origin },
                { label: 'Destination', val: shipment.destination },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-slate-400 shrink-0">{r.label}</span>
                  <span className="text-xs font-semibold text-slate-700 text-right">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking input */}
          <div className="bg-white border border-slate-100 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Tracking #</p>
            <input
              type="text"
              value={trackingDraft}
              onChange={(e) => setTrackingDraft(e.target.value)}
              placeholder="Enter new tracking number..."
              className="w-full text-xs font-mono border border-slate-200 focus:border-slate-400 rounded-lg px-3 py-2.5 outline-none text-slate-700 placeholder-slate-400 mb-2"
            />
            <button
              onClick={handleSave}
              disabled={!trackingDraft.trim()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap"
            >
              {saved ? <><i className="ri-check-line mr-1"></i>Saved!</> : 'Update Tracking'}
            </button>
          </div>

          {/* Map */}
          <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</p>
            </div>
            <div className="h-44">
              <iframe
                title="Shipment Destination"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
