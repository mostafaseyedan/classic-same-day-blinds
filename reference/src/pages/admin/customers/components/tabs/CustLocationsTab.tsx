import type { Customer } from '../CustomerFormModal';

interface Props {
  customer: Customer;
  orders: any[];
}

interface DeliveryLocation {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ordersCount: number;
  lastDelivery: string;
  isPrimary: boolean;
  type: 'Billing' | 'Shipping' | 'Warehouse' | 'Job Site';
}

function buildLocations(customer: Customer, orders: any[]): DeliveryLocation[] {
  const locs: DeliveryLocation[] = [];

  if (customer.street || customer.city) {
    locs.push({
      id: 'loc-1',
      label: 'Primary Address',
      address: customer.street || '—',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      ordersCount: Math.min(orders.length, orders.length > 0 ? Math.ceil(orders.length * 0.6) : 0),
      lastDelivery: orders.length > 0 ? new Date(orders[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      isPrimary: true,
      type: 'Billing',
    });
  }

  if (customer.type === 'Business' || customer.type === 'Contractor' || customer.type === 'Wholesale') {
    locs.push({
      id: 'loc-2',
      label: 'Warehouse / Job Site 1',
      address: '8200 Industrial Pkwy',
      city: customer.city || 'Los Angeles',
      state: customer.state || 'CA',
      zip: customer.zip || '90040',
      ordersCount: Math.floor(orders.length * 0.3),
      lastDelivery: orders.length > 1 ? new Date(orders[1]?.date ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      isPrimary: false,
      type: 'Warehouse',
    });
    locs.push({
      id: 'loc-3',
      label: 'Job Site 2',
      address: '450 Commerce Blvd',
      city: customer.city || 'Los Angeles',
      state: customer.state || 'CA',
      zip: '90023',
      ordersCount: Math.floor(orders.length * 0.1),
      lastDelivery: orders.length > 2 ? new Date(orders[2]?.date ?? Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
      isPrimary: false,
      type: 'Job Site',
    });
  }

  return locs;
}

function getTypeStyle(type: string) {
  switch (type) {
    case 'Billing': return 'bg-slate-100 text-slate-700';
    case 'Shipping': return 'bg-teal-100 text-teal-700';
    case 'Warehouse': return 'bg-amber-100 text-amber-700';
    case 'Job Site': return 'bg-orange-100 text-orange-700';
    default: return 'bg-slate-100 text-slate-600';
  }
}

export default function CustLocationsTab({ customer, orders }: Props) {
  const locations = buildLocations(customer, orders);
  const mapQuery = encodeURIComponent([customer.street, customer.city, customer.state, customer.zip].filter(Boolean).join(', ') || 'Los Angeles, CA');

  return (
    <div className="space-y-6">
      {/* Map embed */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Location Map</p>
        </div>
        <div className="h-72 w-full">
          <iframe
            title="Customer Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          />
        </div>
      </div>

      {/* Location cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Locations ({locations.length})</p>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            <i className="ri-map-pin-add-line text-sm"></i> Add Location
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-400 text-sm">
            No delivery locations on file
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {locations.map((loc) => (
              <div key={loc.id} className="bg-white border border-slate-100 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <i className="ri-map-pin-2-line text-white text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-slate-900">{loc.label}</p>
                      {loc.isPrimary && (
                        <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-bold rounded-full">Primary</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getTypeStyle(loc.type)}`}>{loc.type}</span>
                    </div>
                    <p className="text-sm text-slate-600">{loc.address}</p>
                    <p className="text-sm text-slate-400">{[loc.city, loc.state, loc.zip].filter(Boolean).join(', ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Orders delivered</p>
                    <p className="text-xl font-bold text-slate-900">{loc.ordersCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Last: {loc.lastDelivery}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-3">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent([loc.address, loc.city, loc.state, loc.zip].filter(Boolean).join(', '))}`}
                    target="_blank"
                    rel="nofollow noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    <i className="ri-external-link-line text-xs"></i> View on Maps
                  </a>
                  <span className="text-slate-200">|</span>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
                    <i className="ri-edit-line text-xs"></i> Edit
                  </button>
                  {!loc.isPrimary && (
                    <>
                      <span className="text-slate-200">|</span>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer">
                        <i className="ri-delete-bin-line text-xs"></i> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order geography breakdown */}
      <div className="bg-white border border-slate-100 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Order Volume by Location</p>
        <div className="space-y-3">
          {locations.map((loc) => {
            const pct = locations.reduce((s, l) => s + l.ordersCount, 0) > 0 ? (loc.ordersCount / locations.reduce((s, l) => s + l.ordersCount, 0)) * 100 : 0;
            return (
              <div key={loc.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">{loc.label}</span>
                  <span className="text-slate-500">{loc.ordersCount} orders ({pct.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 bg-slate-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
