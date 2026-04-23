import type { Customer } from '../CustomerFormModal';

interface Props {
  customer: Customer;
  orders: any[];
}

interface PromoUsed {
  code: string;
  type: string;
  discount: string;
  savings: number;
  usedOn: string;
  orderId: string;
}

interface AvailablePromo {
  code: string;
  description: string;
  expires: string;
  type: 'percent' | 'flat' | 'free-ship';
  value: string;
}

function getPromoHistory(orders: any[], type: Customer['type']): PromoUsed[] {
  const promos: PromoUsed[] = [
    { code: 'WELCOME10', type: 'New Customer', discount: '10% off', savings: 45.99, usedOn: new Date(Date.now() - 365 * 86400000).toLocaleDateString(), orderId: orders[0]?.id ?? 'ORD-10001' },
    { code: 'BULK5PCT', type: 'Volume Discount', discount: '5% off orders $5K+', savings: 249.00, usedOn: new Date(Date.now() - 180 * 86400000).toLocaleDateString(), orderId: orders[1]?.id ?? 'ORD-10002' },
    { code: 'FREESHIP50', type: 'Free Shipping', discount: 'Free shipping', savings: 89.00, usedOn: new Date(Date.now() - 90 * 86400000).toLocaleDateString(), orderId: orders[0]?.id ?? 'ORD-10003' },
  ];
  if (type === 'Wholesale') promos.push({ code: 'WHOLESALE12', type: 'Wholesale', discount: '12% off all', savings: 1240.00, usedOn: new Date(Date.now() - 30 * 86400000).toLocaleDateString(), orderId: orders[0]?.id ?? 'ORD-10004' });
  if (type === 'Contractor') promos.push({ code: 'CONTRACTOR8', type: 'Trade', discount: '8% contractor', savings: 320.00, usedOn: new Date(Date.now() - 60 * 86400000).toLocaleDateString(), orderId: orders[0]?.id ?? 'ORD-10005' });
  return promos.slice(0, 4);
}

function getAvailablePromos(type: Customer['type'], status: Customer['status']): AvailablePromo[] {
  const base: AvailablePromo[] = [
    { code: 'REORDER15', description: 'Reorder discount — 15% off any repeat product', expires: 'Jun 30, 2026', type: 'percent', value: '15%' },
    { code: 'SPRINGSHIP', description: 'Free shipping on orders over $500 this season', expires: 'May 31, 2026', type: 'free-ship', value: 'Free Ship' },
  ];
  if (status === 'VIP') base.push({ code: 'VIP20', description: 'VIP exclusive: 20% off your next order', expires: 'Apr 30, 2026', type: 'percent', value: '20%' });
  if (type === 'Wholesale') base.push({ code: 'BULKQ2', description: 'Bulk Q2 — extra 5% off orders over 500 units', expires: 'Jun 30, 2026', type: 'percent', value: '+5%' });
  if (type === 'Contractor') base.push({ code: 'TRADE2026', description: 'Trade program pricing — 8% off all season', expires: 'Dec 31, 2026', type: 'percent', value: '8%' });
  return base;
}

function getLoyaltyPoints(orders: any[], status: Customer['status']): { points: number; tier: string; tierColor: string; nextTier: string; toNext: number } {
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0);
  const points = Math.floor(totalSpent / 10) + (status === 'VIP' ? 5000 : status === 'Active' ? 1000 : 200);
  let tier = 'Bronze'; let tierColor = 'text-amber-700 bg-amber-50'; let nextTier = 'Silver'; let toNext = Math.max(0, 5000 - points);
  if (points >= 25000) { tier = 'Diamond'; tierColor = 'text-sky-700 bg-sky-50'; nextTier = 'Max'; toNext = 0; }
  else if (points >= 10000) { tier = 'Gold'; tierColor = 'text-yellow-700 bg-yellow-50'; nextTier = 'Diamond'; toNext = 25000 - points; }
  else if (points >= 5000) { tier = 'Silver'; tierColor = 'text-slate-600 bg-slate-100'; nextTier = 'Gold'; toNext = 10000 - points; }
  return { points, tier, tierColor, nextTier, toNext };
}

export default function CustPromotionsTab({ customer, orders }: Props) {
  const promoHistory = getPromoHistory(orders, customer.type);
  const available = getAvailablePromos(customer.type, customer.status);
  const loyalty = getLoyaltyPoints(orders, customer.status);
  const totalSavings = promoHistory.reduce((s, p) => s + p.savings, 0);

  return (
    <div className="space-y-6">
      {/* Loyalty Points */}
      <div className="bg-white border border-slate-100 rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Loyalty Program</p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-slate-900">{loyalty.points.toLocaleString()}</span>
              <span className="text-base text-slate-400 font-medium mt-1">pts</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${loyalty.tierColor}`}>
            <i className="ri-vip-crown-line mr-1.5"></i>{loyalty.tier}
          </span>
        </div>
        {loyalty.toNext > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>{loyalty.tier}</span>
              <span>{loyalty.nextTier} in {loyalty.toNext.toLocaleString()} pts</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="h-2 bg-slate-900 rounded-full"
                style={{ width: `${Math.min(100, ((loyalty.points % (loyalty.toNext + loyalty.points)) / (loyalty.toNext + loyalty.points)) * 100)}%` }}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Points Earned', val: loyalty.points.toLocaleString(), icon: 'ri-coin-line', color: 'text-amber-600' },
            { label: 'Total Savings', val: `$${totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: 'ri-discount-percent-line', color: 'text-emerald-600' },
            { label: 'Promos Used', val: promoHistory.length.toString(), icon: 'ri-coupon-3-line', color: 'text-violet-600' },
          ].map((s) => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className={`w-7 h-7 mx-auto mb-1 flex items-center justify-center ${s.color}`}>
                <i className={`${s.icon} text-base`}></i>
              </div>
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Promo History */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Promotions Used</p>
          {promoHistory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No promotions used yet</p>
          ) : (
            <div className="space-y-3">
              {promoHistory.map((p) => (
                <div key={p.code} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <i className="ri-coupon-3-line text-emerald-700 text-base"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-slate-900">{p.code}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full font-semibold">{p.type}</span>
                    </div>
                    <p className="text-xs text-slate-400">{p.discount} &bull; Used {p.usedOn} &bull; {p.orderId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-700">-${p.savings.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Promos */}
        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Available Promotions</p>
          <div className="space-y-3">
            {available.map((p) => (
              <div key={p.code} className="border border-dashed border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className="text-sm font-mono font-bold text-slate-900">{p.code}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${p.type === 'percent' ? 'bg-emerald-100 text-emerald-700' : p.type === 'free-ship' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>{p.value}</span>
                </div>
                <p className="text-xs text-slate-500">{p.description}</p>
                <p className="text-xs text-slate-400 mt-1"><i className="ri-time-line mr-1"></i>Expires {p.expires}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
