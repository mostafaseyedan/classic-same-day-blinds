import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../../../mocks/products';
import { mockOrders } from '../../../mocks/orders';
import { productReviews } from '../../../mocks/reviews';
import MonthlyRevenueChart from './components/MonthlyRevenueChart';
import RevenueByProductChart from './components/RevenueByProductChart';
import CustomerGeographyMap from './components/CustomerGeographyMap';
import BackupWidget from './components/BackupWidget';
import TeamRolesWidget from './components/TeamRolesWidget';
import MonthlyUnitsSoldChart from './components/MonthlyUnitsSoldChart';
import CategorySalesChart from './components/CategorySalesChart';

type DashTab = 'overview' | 'analytics' | 'operations';

const TABS: { id: DashTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'ri-layout-grid-line' },
  { id: 'analytics', label: 'Analytics', icon: 'ri-line-chart-line' },
  { id: 'operations', label: 'Operations', icon: 'ri-settings-3-line' },
];

const recentActivity = [
  { id: 1, type: 'order', message: 'New order #ORD-2024-089 placed by Marcus Webb', time: '2 min ago', icon: 'ri-shopping-bag-3-line', color: 'text-emerald-600 bg-emerald-50' },
  { id: 2, type: 'restock', message: 'Restock request for Blackout Roller Shades (×50)', time: '18 min ago', icon: 'ri-inbox-line', color: 'text-amber-600 bg-amber-50' },
  { id: 3, type: 'review', message: 'New 5-star review on Premium Cellular Shades', time: '45 min ago', icon: 'ri-star-line', color: 'text-yellow-600 bg-yellow-50' },
  { id: 4, type: 'order', message: 'Order #ORD-2024-088 shipped to Jennifer White', time: '1 hr ago', icon: 'ri-truck-line', color: 'text-teal-600 bg-teal-50' },
  { id: 5, type: 'user', message: 'New account registered: david.park@gmail.com', time: '2 hr ago', icon: 'ri-user-add-line', color: 'text-slate-600 bg-slate-100' },
  { id: 6, type: 'restock', message: 'Restock request for Motorized Smart Blinds (×20)', time: '3 hr ago', icon: 'ri-inbox-line', color: 'text-amber-600 bg-amber-50' },
  { id: 7, type: 'order', message: 'Reorder #ORD-2024-087 from Sunrise Properties LLC', time: '4 hr ago', icon: 'ri-refresh-line', color: 'text-emerald-600 bg-emerald-50' },
];

const topProducts = [
  { name: 'Premium Cellular Shades', sold: 3102, revenue: 37212, trend: '+12%' },
  { name: 'Blackout Roller Shades', sold: 2789, revenue: 20910, trend: '+8%' },
  { name: 'Cordless Faux Wood Blinds', sold: 2341, revenue: 21066, trend: '+5%' },
  { name: 'Motorized Smart Blinds', sold: 654, revenue: 16347, trend: '+22%' },
  { name: 'Bamboo Woven Wood Shades', sold: 1423, revenue: 14226, trend: '+3%' },
];

const weeklyRevenue = [
  { day: 'Mon', amount: 4200 },
  { day: 'Tue', amount: 6800 },
  { day: 'Wed', amount: 5100 },
  { day: 'Thu', amount: 7900 },
  { day: 'Fri', amount: 9200 },
  { day: 'Sat', amount: 6400 },
  { day: 'Sun', amount: 3800 },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const totalRevenue = mockOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = mockOrders.length + 85;
  const lowStockProducts = products.filter((p) => p.inventory > 0 && p.inventory <= 10).length;
  const outOfStockProducts = products.filter((p) => p.inventory === 0).length;
  const avgRating = (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1);
  const pendingRestocks = 7;
  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.amount));

  const topProductUnitsSold = topProducts.reduce((sum, p) => sum + p.sold, 0);
  const totalUnitsSold = topProductUnitsSold + 4318;
  const totalRevenueDisplay = totalRevenue + 48320;
  const avgRevenuePerUnit = totalRevenueDisplay / totalUnitsSold;

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${(totalRevenueDisplay).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${totalUnitsSold.toLocaleString()} units sold · +14.2% vs last month`,
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-emerald-50 text-emerald-600',
      trend: 'up',
    },
    {
      label: 'Units Sold',
      value: totalUnitsSold.toLocaleString(),
      sub: `$${avgRevenuePerUnit.toFixed(2)} avg. revenue / unit`,
      icon: 'ri-stack-line',
      color: 'bg-teal-50 text-teal-600',
      trend: 'up',
    },
    {
      label: 'Total Orders',
      value: totalOrders.toLocaleString(),
      sub: '+9 new today',
      icon: 'ri-shopping-bag-3-line',
      color: 'bg-slate-100 text-slate-600',
      trend: 'up',
    },
    {
      label: 'Avg. Rating',
      value: avgRating,
      sub: `${productReviews.length} total reviews`,
      icon: 'ri-star-line',
      color: 'bg-yellow-50 text-yellow-600',
      trend: 'up',
    },
    {
      label: 'Low / Out of Stock',
      value: `${lowStockProducts} / ${outOfStockProducts}`,
      sub: 'Products need attention',
      icon: 'ri-alert-line',
      color: 'bg-red-50 text-red-500',
      trend: 'warn',
    },
    {
      label: 'Pending Restocks',
      value: pendingRestocks,
      sub: 'Awaiting approval',
      icon: 'ri-inbox-line',
      color: 'bg-amber-50 text-amber-600',
      trend: 'warn',
    },
  ];

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const adminUser = (() => {
    try { return JSON.parse(localStorage.getItem('admin_user') ?? '{}'); } catch { return {}; }
  })();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {greeting()}, {adminUser?.name?.split(' ')[0] ?? 'Admin'} 👋
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp;Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-shopping-bag-3-line"></i> View Orders
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-store-2-line"></i> Products
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <i className={`${tab.icon} text-base`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <i className={`${card.icon} text-lg`}></i>
                  </div>
                  {card.trend === 'up' && (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <i className="ri-arrow-up-line text-xs"></i> Up
                    </span>
                  )}
                  {card.trend === 'warn' && (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <i className="ri-error-warning-line text-xs"></i>
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 leading-tight">{card.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                </div>
                <p className="text-xs text-slate-400">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Weekly Revenue + Recent Activity */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Weekly Revenue</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Last 7 days performance</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <i className="ri-arrow-up-line"></i> $43,400 this week
                </div>
              </div>
              <div className="flex items-end gap-3 h-40">
                {weeklyRevenue.map((d) => {
                  const pct = (d.amount / maxRevenue) * 100;
                  const isFri = d.day === 'Fri';
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">${(d.amount / 1000).toFixed(1)}k</span>
                      <div className="w-full relative flex items-end" style={{ height: '96px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all ${isFri ? 'bg-slate-900' : 'bg-slate-200 hover:bg-slate-300'}`}
                          style={{ height: `${pct}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${isFri ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                      <i className={`${item.icon} text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug">{item.message}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts + Quick Actions */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Alerts</h3>
              <div className="grid grid-cols-2 gap-3">
                {outOfStockProducts > 0 && (
                  <div
                    onClick={() => navigate('/admin/products?stock=out')}
                    className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl cursor-pointer hover:bg-red-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-error-warning-line text-red-500 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-red-700">{outOfStockProducts} Out of Stock</p>
                      <p className="text-[11px] text-red-400">Immediate restock needed</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-red-400 shrink-0"></i>
                  </div>
                )}
                {lowStockProducts > 0 && (
                  <div
                    onClick={() => navigate('/admin/products?stock=low')}
                    className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                      <i className="ri-alert-line text-amber-500 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-amber-700">{lowStockProducts} Low Stock</p>
                      <p className="text-[11px] text-amber-400">10 units or fewer</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-amber-400 shrink-0"></i>
                  </div>
                )}
                <div
                  onClick={() => navigate('/admin/restock-requests')}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-inbox-line text-slate-500 text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700">{pendingRestocks} Pending Restocks</p>
                    <p className="text-[11px] text-slate-400">Awaiting approval</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-slate-400 shrink-0"></i>
                </div>
                <div
                  onClick={() => navigate('/admin/reviews')}
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center shrink-0">
                    <i className="ri-star-line text-yellow-500 text-sm"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-yellow-700">3 Reviews to Moderate</p>
                    <p className="text-[11px] text-yellow-500">Awaiting approval</p>
                  </div>
                  <i className="ri-arrow-right-s-line text-yellow-400 shrink-0"></i>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-slate-900 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Quick Actions</h3>
                <p className="text-xs text-slate-400 mb-5">Jump to any section fast</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'New Order', icon: 'ri-add-circle-line', path: '/admin/orders' },
                    { label: 'Add Product', icon: 'ri-store-2-line', path: '/admin/products' },
                    { label: 'View Users', icon: 'ri-user-line', path: '/admin/users' },
                    { label: 'Analytics', icon: 'ri-line-chart-line', path: '/admin/visitors' },
                    { label: 'Customers', icon: 'ri-group-line', path: '/admin/customers' },
                    { label: 'Competitor Pricing', icon: 'ri-price-tag-3-line', path: '/admin/competitor-pricing' },
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => navigate(q.path)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                    >
                      <i className={`${q.icon} text-sm`}></i>
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Monthly Avg Revenue', value: `$${(totalRevenueDisplay / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: 'ri-money-dollar-circle-line', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'YTD Units Sold', value: totalUnitsSold.toLocaleString(), icon: 'ri-stack-line', color: 'text-teal-600 bg-teal-50' },
              { label: 'Avg. Order Value', value: `$${(totalRevenueDisplay / totalOrders).toFixed(2)}`, icon: 'ri-shopping-bag-3-line', color: 'text-slate-600 bg-slate-100' },
              { label: 'Revenue Growth', value: '+14.2%', icon: 'ri-arrow-up-circle-line', color: 'text-emerald-600 bg-emerald-50' },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                  <i className={`${c.icon} text-lg`}></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          <MonthlyRevenueChart />
          <MonthlyUnitsSoldChart />

          <div className="grid grid-cols-2 gap-6">
            <RevenueByProductChart />
            <CategorySalesChart />
          </div>

          <CustomerGeographyMap />
        </div>
      )}

      {/* ── OPERATIONS TAB ── */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          {/* Ops KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Active Products', value: products.filter(p => p.inventory > 0).length.toString(), icon: 'ri-store-2-line', color: 'text-teal-600 bg-teal-50' },
              { label: 'Out of Stock', value: outOfStockProducts.toString(), icon: 'ri-error-warning-line', color: 'text-red-500 bg-red-50' },
              { label: 'Low Stock Items', value: lowStockProducts.toString(), icon: 'ri-alert-line', color: 'text-amber-600 bg-amber-50' },
              { label: 'Pending Restocks', value: pendingRestocks.toString(), icon: 'ri-inbox-line', color: 'text-slate-600 bg-slate-100' },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
                  <i className={`${c.icon} text-lg`}></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{c.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Top Products Table */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
                <p className="text-xs text-slate-500 mt-0.5">Units sold &rarr; revenue contribution</p>
              </div>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer whitespace-nowrap transition-colors"
              >
                View all <i className="ri-arrow-right-line"></i>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-3 px-1">
              <span className="w-6 shrink-0"></span>
              <span className="flex-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Product</span>
              <span className="w-24 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-center shrink-0">Units Sold</span>
              <span className="w-20 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right shrink-0">Revenue</span>
              <span className="w-16 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right shrink-0">Per Unit</span>
            </div>

            <div className="space-y-2">
              {topProducts.map((p, i) => {
                const perUnit = (p.revenue / p.sold);
                const revenueShare = (p.revenue / topProducts.reduce((s, x) => s + x.revenue, 0)) * 100;
                return (
                  <div key={p.name} className="flex items-center gap-4 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className="w-6 text-xs font-bold text-slate-400 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 rounded-full bg-slate-100 flex-1 max-w-[120px]">
                          <div
                            className="h-1.5 rounded-full bg-emerald-400"
                            style={{ width: `${revenueShare}%` }}
                          ></div>
                        </div>
                        <span className="text-[11px] text-slate-400">{revenueShare.toFixed(0)}% of top revenue</span>
                      </div>
                    </div>
                    <div className="w-24 text-center shrink-0">
                      <p className="text-sm font-bold text-slate-700">{p.sold.toLocaleString()}</p>
                      <span className="text-[11px] font-semibold text-emerald-600">{p.trend}</span>
                    </div>
                    <div className="w-20 text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">${p.revenue.toLocaleString()}</p>
                    </div>
                    <div className="w-16 text-right shrink-0">
                      <p className="text-xs font-semibold text-slate-500">${perUnit.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <i className="ri-stack-line text-teal-500"></i>
                <span><strong className="text-slate-800">{topProducts.reduce((s, p) => s + p.sold, 0).toLocaleString()}</strong> units from top 5 products</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <i className="ri-money-dollar-circle-line text-emerald-500"></i>
                <span>Total: <strong className="text-slate-800">${topProducts.reduce((s, p) => s + p.revenue, 0).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Backup + Team Roles */}
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3">
              <BackupWidget />
            </div>
            <div className="col-span-2">
              <TeamRolesWidget />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
