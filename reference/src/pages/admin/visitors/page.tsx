import { useEffect, useState } from 'react';
import {
  getTotalPageViews,
  getMostVisitedPages,
  getVisitsByDay,
  getActiveSessionsCount,
} from '../../../utils/analytics';
import { products } from '../../../mocks/products';

interface PageView {
  path: string;
  timestamp: number;
  sessionId: string;
}

export default function AdminVisitorsPage() {
  const [totalViews, setTotalViews] = useState(0);
  const [mostVisited, setMostVisited] = useState<{ path: string; count: number }[]>([]);
  const [mostVisitedProducts, setMostVisitedProducts] = useState<{ path: string; count: number }[]>([]);
  const [visitsByDay, setVisitsByDay] = useState<{ date: string; count: number }[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);

  const loadAnalytics = () => {
    setTotalViews(getTotalPageViews());
    const all = getMostVisitedPages();
    setMostVisited(all.slice(0, 10));
    setMostVisitedProducts(all.filter(p => p.path.startsWith('/product/')).slice(0, 10));
    setVisitsByDay(getVisitsByDay());
    setActiveSessions(getActiveSessionsCount());
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const getProductFromPath = (path: string) => {
    const idStr = path.replace('/product/', '');
    const id = parseInt(idStr, 10);
    return products.find(p => p.id === id) || null;
  };

  const maxDayCount = Math.max(...visitsByDay.map(d => d.count), 1);
  const maxProductCount = Math.max(...mostVisitedProducts.map(p => p.count), 1);

  return (
    <div className="p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Page Views</p>
              <p className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-eye-line text-blue-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-900">{activeSessions}</p>
              <p className="text-xs text-slate-500 mt-1">Last 30 minutes</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-green-600 text-2xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Most Popular Page</p>
              <p className="text-lg font-bold text-slate-900">
                {mostVisited[0] ? (mostVisited[0].path.startsWith('/product/') ? (getProductFromPath(mostVisited[0].path)?.name || 'Product') : mostVisited[0].path) : 'N/A'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {mostVisited[0] ? `${mostVisited[0].count} views` : ''}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i className="ri-fire-line text-orange-500 text-2xl"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visits by Day Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Visits by Day</h3>
            <span className="text-xs text-slate-500">Last 7 days</span>
          </div>
          <div className="space-y-4">
            {visitsByDay.map((day) => (
              <div key={day.date}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{day.date}</span>
                  <span className="text-sm font-semibold text-slate-900">{day.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-slate-800 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(day.count / maxDayCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Visited Product Pages */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-lg font-bold text-slate-900">Most Visited Product Pages</h3>
            <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">Products only</span>
          </div>

          <div className="space-y-3">
            {mostVisitedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <i className="ri-store-2-line text-slate-400 text-2xl"></i>
                </div>
                <p className="text-sm font-medium text-slate-600">No product page views yet</p>
                <p className="text-xs text-slate-400 mt-1">Views will appear here once customers browse products</p>
              </div>
            ) : (
              mostVisitedProducts.map((page, index) => {
                const product = getProductFromPath(page.path);
                const barWidth = `${(page.count / maxProductCount) * 100}%`;
                return (
                  <div
                    key={page.path}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-7 h-7 flex-shrink-0 bg-slate-900 text-white rounded-md flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    {product?.image ? (
                      <div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-slate-200">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 bg-slate-200 rounded-md flex items-center justify-center">
                        <i className="ri-image-line text-slate-400 text-lg"></i>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {product?.name || page.path}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: barWidth }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{page.count} views</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}