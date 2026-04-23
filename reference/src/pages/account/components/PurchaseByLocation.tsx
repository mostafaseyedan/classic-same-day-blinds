import { useState } from 'react';
import { mockOrders } from '../../../mocks/orders';

interface Address {
  id: string;
  label: string;
  type: 'residential' | 'commercial';
  businessName?: string;
  city: string;
  state: string;
  assignedProducts: { productId: number; productName: string; productImage: string }[];
}

interface LocationStat {
  address: Address;
  totalSpent: number;
  totalOrders: number;
  totalItems: number;
  products: {
    id: number;
    name: string;
    image: string;
    quantity: number;
    totalSpent: number;
  }[];
}

function loadAddresses(): Address[] {
  try {
    const stored = localStorage.getItem('user_addresses');
    if (stored) return JSON.parse(stored);
    return [];
  } catch {
    return [];
  }
}

// Distribute orders across locations for demo purposes
function buildLocationStats(addresses: Address[]): LocationStat[] {
  if (addresses.length === 0) return [];

  // Map orders to addresses by cycling through them
  const orderGroups: { [addrId: string]: typeof mockOrders } = {};
  addresses.forEach(a => { orderGroups[a.id] = []; });

  mockOrders.forEach((order, idx) => {
    const addr = addresses[idx % addresses.length];
    orderGroups[addr.id].push(order);
  });

  return addresses.map(addr => {
    const orders = orderGroups[addr.id] ?? [];
    const productMap: { [id: number]: { id: number; name: string; image: string; quantity: number; totalSpent: number } } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productMap[item.id]) {
          productMap[item.id] = { id: item.id, name: item.name, image: item.image, quantity: 0, totalSpent: 0 };
        }
        productMap[item.id].quantity += item.quantity;
        productMap[item.id].totalSpent += item.price * item.quantity;
      });
    });

    const totalSpent = orders.reduce((s, o) => s + o.total, 0);
    const totalItems = orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

    return {
      address: addr,
      totalSpent,
      totalOrders: orders.length,
      totalItems,
      products: Object.values(productMap).sort((a, b) => b.totalSpent - a.totalSpent),
    };
  });
}

export default function PurchaseByLocation() {
  const addresses = loadAddresses();
  const stats = buildLocationStats(addresses);
  const [expandedId, setExpandedId] = useState<string | null>(stats[0]?.address.id ?? null);

  const grandTotal = stats.reduce((s, loc) => s + loc.totalSpent, 0);
  const grandOrders = stats.reduce((s, loc) => s + loc.totalOrders, 0);
  const grandItems = stats.reduce((s, loc) => s + loc.totalItems, 0);

  if (addresses.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <i className="ri-map-pin-line text-4xl text-emerald-500"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No locations yet</h3>
        <p className="text-sm text-gray-500">Add locations in the Locations &amp; Payments tab to see your purchase breakdown.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Grand Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-map-pin-2-line text-xl text-emerald-600"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Locations</p>
            <p className="text-2xl font-bold text-gray-900">{addresses.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-shopping-bag-3-line text-xl text-teal-600"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{grandOrders}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <i className="ri-money-dollar-circle-line text-xl text-amber-600"></i>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">${grandTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Location Cards */}
      <div className="space-y-4">
        {stats.map(loc => {
          const isExpanded = expandedId === loc.address.id;
          const pct = grandTotal > 0 ? (loc.totalSpent / grandTotal) * 100 : 0;

          return (
            <div
              key={loc.address.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Location Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : loc.address.id)}
                className="w-full text-left px-6 py-5 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 flex items-center justify-center rounded-xl ${loc.address.type === 'commercial' ? 'bg-teal-100' : 'bg-emerald-100'}`}>
                      <i className={`${loc.address.type === 'commercial' ? 'ri-building-line text-teal-600' : 'ri-home-line text-emerald-600'} text-base`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{loc.address.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loc.address.type === 'commercial' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'}`}>
                          {loc.address.type === 'commercial' ? 'Commercial' : 'Residential'}
                        </span>
                      </div>
                      {loc.address.businessName && (
                        <p className="text-xs text-gray-500 mt-0.5">{loc.address.businessName}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">{loc.address.city}, {loc.address.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Orders</p>
                      <p className="text-base font-bold text-gray-900">{loc.totalOrders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-0.5">Items</p>
                      <p className="text-base font-bold text-gray-900">{loc.totalItems}</p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-gray-400 mb-0.5">Total Spent</p>
                      <p className="text-lg font-bold text-gray-900">${loc.totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                      <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-lg`}></i>
                    </div>
                  </div>
                </div>

                {/* Spend Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 shrink-0">{pct.toFixed(0)}% of total</span>
                </div>
              </button>

              {/* Expanded: Product Breakdown */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-5 mb-3">Products Ordered at This Location</p>

                  {loc.products.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <i className="ri-box-3-line text-2xl text-gray-300 mb-2"></i>
                      <p className="text-xs text-gray-400">No orders linked to this location yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {loc.products.map(product => {
                        const productPct = loc.totalSpent > 0 ? (product.totalSpent / loc.totalSpent) * 100 : 0;
                        return (
                          <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate mb-1">{product.name}</p>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${productPct}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{productPct.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-5 shrink-0">
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-0.5">Units</p>
                                <p className="text-sm font-bold text-gray-900">{product.quantity}</p>
                              </div>
                              <div className="text-center min-w-[72px]">
                                <p className="text-xs text-gray-400 mb-0.5">Spent</p>
                                <p className="text-sm font-bold text-emerald-700">${product.totalSpent.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Location Total Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 px-1">
                        <span className="text-sm font-bold text-gray-700">Location Total</span>
                        <div className="flex items-center gap-5">
                          <div className="text-center">
                            <p className="text-xs text-gray-400 mb-0.5">Items</p>
                            <p className="text-sm font-bold text-gray-900">{grandItems > 0 ? loc.totalItems : '—'}</p>
                          </div>
                          <div className="text-center min-w-[72px]">
                            <p className="text-xs text-gray-400 mb-0.5">Total</p>
                            <p className="text-sm font-bold text-gray-900">${loc.totalSpent.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
