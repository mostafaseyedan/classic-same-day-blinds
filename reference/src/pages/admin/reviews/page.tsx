import { useState, useEffect, useCallback } from 'react';

interface InternalReviewItem {
  productId: string;
  productName: string;
  rating: number;
  comment: string;
}

interface InternalReview {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: InternalReviewItem[];
  isRead?: boolean;
}

interface GoogleReview {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  time: number;
  relativeTime: string;
  authorUrl: string;
}

interface GooglePlaceData {
  businessName: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  reviews: GoogleReview[];
}

type ActiveTab = 'internal' | 'google';

const SUPABASE_FUNC_URL = 'https://xvxylzvkdljvgunvotqv.supabase.co/functions/v1/google-reviews';

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('internal');

  // Internal reviews state
  const [reviews, setReviews] = useState<InternalReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<InternalReview[]>([]);
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Google reviews state
  const [placeId, setPlaceId] = useState<string>('');
  const [placeIdInput, setPlaceIdInput] = useState<string>('');
  const [googleData, setGoogleData] = useState<GooglePlaceData | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string>('');
  const [showSetup, setShowSetup] = useState(false);
  const [googleRatingFilter, setGoogleRatingFilter] = useState<string>('all');
  const [googleSearch, setGoogleSearch] = useState('');
  const [showApiInstructions, setShowApiInstructions] = useState(false);

  useEffect(() => {
    loadInternalReviews();
    const saved = localStorage.getItem('googlePlaceId');
    if (saved) {
      setPlaceId(saved);
      setPlaceIdInput(saved);
    }
  }, []);

  useEffect(() => {
    if (placeId && activeTab === 'google') {
      fetchGoogleReviews(placeId);
    }
  }, [placeId, activeTab]);

  useEffect(() => {
    filterInternalReviews();
  }, [reviews, selectedRating, searchQuery]);

  const loadInternalReviews = () => {
    const stored = localStorage.getItem('productReviews');
    if (stored) {
      try { setReviews(JSON.parse(stored)); } catch { setReviews([]); }
    }
  };

  const filterInternalReviews = () => {
    let filtered = [...reviews];
    if (selectedRating !== 'all') {
      const t = parseInt(selectedRating);
      filtered = filtered.filter(r => r.items.some(i => i.rating === t));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.customerName.toLowerCase().includes(q) ||
        r.items.some(i => i.productName.toLowerCase().includes(q))
      );
    }
    setFilteredReviews(filtered);
  };

  const fetchGoogleReviews = useCallback(async (pid: string) => {
    setGoogleLoading(true);
    setGoogleError('');
    try {
      const res = await fetch(SUPABASE_FUNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: pid }),
      });
      const data = await res.json();
      if (data.error) {
        setGoogleError(data.error);
        setGoogleData(null);
      } else {
        setGoogleData(data);
      }
    } catch (err) {
      setGoogleError('Failed to connect to the Google Reviews service. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const handleSavePlaceId = () => {
    if (!placeIdInput.trim()) return;
    const pid = placeIdInput.trim();
    setPlaceId(pid);
    localStorage.setItem('googlePlaceId', pid);
    setShowSetup(false);
    fetchGoogleReviews(pid);
  };

  const handleDisconnect = () => {
    setPlaceId('');
    setPlaceIdInput('');
    setGoogleData(null);
    setGoogleError('');
    localStorage.removeItem('googlePlaceId');
  };

  const toggleReadStatus = (orderId: string) => {
    const updated = reviews.map(r => r.orderId === orderId ? { ...r, isRead: !r.isRead } : r);
    setReviews(updated);
    localStorage.setItem('productReviews', JSON.stringify(updated));
  };

  const deleteReview = (orderId: string) => {
    const updated = reviews.filter(r => r.orderId !== orderId);
    setReviews(updated);
    localStorage.setItem('productReviews', JSON.stringify(updated));
    setDeleteConfirm(null);
    setExpandedReview(null);
  };

  const calcStats = () => {
    let totalRating = 0, ratingCount = 0, fiveStarCount = 0;
    reviews.forEach(r => r.items.forEach(i => {
      totalRating += i.rating; ratingCount++;
      if (i.rating === 5) fiveStarCount++;
    }));
    return {
      totalReviews: reviews.length,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '0.0',
      unreadCount: reviews.filter(r => !r.isRead).length,
      fiveStarCount,
    };
  };

  const stats = calcStats();

  const renderStars = (rating: number, small = false) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <i key={s} className={`${s <= rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-slate-300'} ${small ? 'text-xs' : 'text-base'}`}></i>
      ))}
    </div>
  );

  const filteredGoogleReviews = (googleData?.reviews ?? []).filter(r => {
    const matchRating = googleRatingFilter === 'all' || r.rating === parseInt(googleRatingFilter);
    const matchSearch = !googleSearch.trim() || r.authorName.toLowerCase().includes(googleSearch.toLowerCase()) || r.text.toLowerCase().includes(googleSearch.toLowerCase());
    return matchRating && matchSearch;
  });

  return (
    <div className="p-8">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-8 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'internal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="ri-chat-3-line"></i>
          Internal Reviews
          {stats.unreadCount > 0 && (
            <span className="bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded-full">{stats.unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <i className="ri-google-line"></i>
          Google Reviews
          {placeId && googleData && (
            <span className="bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-full">{googleData.totalRatings}</span>
          )}
        </button>
      </div>

      {/* ========================= INTERNAL TAB ========================= */}
      {activeTab === 'internal' && (
        <>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Reviews', value: stats.totalReviews, icon: 'ri-chat-3-line', bg: 'bg-slate-100', color: 'text-slate-600' },
              { label: 'Average Rating', value: stats.averageRating, icon: 'ri-star-line', bg: 'bg-amber-100', color: 'text-amber-600', stars: true },
              { label: 'Unread', value: stats.unreadCount, icon: 'ri-mail-unread-line', bg: 'bg-sky-100', color: 'text-sky-600' },
              { label: '5-Star Reviews', value: stats.fiveStarCount, icon: 'ri-trophy-line', bg: 'bg-emerald-100', color: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{s.value}</p>
                    {s.stars && (
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <i key={star} className={`${star <= Math.round(parseFloat(stats.averageRating)) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-slate-300'} text-xs`}></i>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <i className={`${s.icon} ${s.color} text-2xl`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input
                  type="text"
                  placeholder="Search by customer name or product..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="flex items-center gap-2">
                {['all', '5', '4', '3', '2', '1'].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(r)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                      selectedRating === r
                        ? r === 'all' ? 'bg-slate-900 text-white' : 'bg-amber-400 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'all' ? 'All' : <>{r}<i className="ri-star-fill text-xs"></i></>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-slate-400 text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Reviews Yet</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm">
                {searchQuery || selectedRating !== 'all'
                  ? 'No reviews match your current filters.'
                  : 'Customer reviews will appear here once orders are delivered and reviewed.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Customer', 'Product', 'Rating', 'Comment', 'Order ID', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredReviews.map(review => (
                    <>
                      {review.items.map((item, idx) => (
                        <tr key={`${review.orderId}-${idx}`} className={`hover:bg-slate-50 transition-colors ${!review.isRead ? 'bg-sky-50/30' : ''}`}>
                          {idx === 0 && (
                            <td className="px-6 py-4 align-top" rowSpan={review.items.length}>
                              <div className="flex items-center gap-2">
                                {!review.isRead && <div className="w-2 h-2 bg-sky-500 rounded-full shrink-0"></div>}
                                <div>
                                  <p className="font-medium text-slate-900 text-sm">{review.customerName}</p>
                                  <p className="text-xs text-slate-500">{review.customerEmail}</p>
                                </div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4"><p className="text-sm font-medium text-slate-900">{item.productName}</p></td>
                          <td className="px-6 py-4">{renderStars(item.rating)}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">
                              {item.comment || <span className="text-slate-400 italic">No comment</span>}
                            </p>
                          </td>
                          {idx === 0 && (
                            <>
                              <td className="px-6 py-4 align-top" rowSpan={review.items.length}>
                                <span className="text-xs font-mono text-slate-500">#{review.orderId}</span>
                              </td>
                              <td className="px-6 py-4 align-top" rowSpan={review.items.length}>
                                <p className="text-sm text-slate-600">
                                  {new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </td>
                              <td className="px-6 py-4 align-top" rowSpan={review.items.length}>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setExpandedReview(expandedReview === review.orderId ? null : review.orderId)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap">
                                    <i className={`${expandedReview === review.orderId ? 'ri-eye-off-line' : 'ri-eye-line'} text-slate-600`}></i>
                                  </button>
                                  <button onClick={() => toggleReadStatus(review.orderId)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap">
                                    <i className={`${review.isRead ? 'ri-mail-open-line' : 'ri-mail-line'} text-slate-600`}></i>
                                  </button>
                                  <button onClick={() => setDeleteConfirm(review.orderId)} className="p-2 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap">
                                    <i className="ri-delete-bin-line text-red-500"></i>
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                      {expandedReview === review.orderId && (
                        <tr className="bg-slate-50">
                          <td colSpan={7} className="px-6 py-5">
                            <div className="bg-white rounded-lg p-5 border border-slate-200">
                              <h4 className="font-bold text-slate-900 mb-4 text-sm">Full Review Details</h4>
                              <div className="space-y-4">
                                {review.items.map((item, idx2) => (
                                  <div key={idx2} className="pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-1">
                                      <p className="font-medium text-slate-900 text-sm">{item.productName}</p>
                                    </div>
                                    {renderStars(item.rating)}
                                    {item.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.comment}</p>}
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                                <span><span className="font-medium">Order:</span> #{review.orderId}</span>
                                <span>{new Date(review.date).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ========================= GOOGLE TAB ========================= */}
      {activeTab === 'google' && (
        <>
          {/* Not connected */}
          {!placeId && !showSetup && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <i className="ri-google-line text-slate-500 text-4xl"></i>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Connect Google Reviews</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Pull your Google Business reviews directly into this dashboard. You'll need a Google Places API key and your business's Place ID to get started.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setShowSetup(true); setShowApiInstructions(false); }}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Get Started
                </button>
                <button
                  onClick={() => { setShowSetup(true); setShowApiInstructions(true); }}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  View Setup Guide
                </button>
              </div>
            </div>
          )}

          {/* Setup form */}
          {showSetup && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <i className="ri-settings-3-line text-slate-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Google Reviews Setup</h3>
                      <p className="text-xs text-slate-500">Connect your Google Business profile</p>
                    </div>
                  </div>
                  {placeId && (
                    <button onClick={() => setShowSetup(false)} className="text-slate-400 hover:text-slate-600 p-2 whitespace-nowrap">
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  )}
                </div>

                <div className="p-6 space-y-6">
                  {/* Step 1: API Key */}
                  <div>
                    <button
                      onClick={() => setShowApiInstructions(!showApiInstructions)}
                      className="w-full flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                        <div className="text-left">
                          <p className="font-semibold text-slate-900 text-sm">Add your Google Places API Key to Supabase</p>
                          <p className="text-xs text-slate-500">Required to authenticate with Google — click to expand instructions</p>
                        </div>
                      </div>
                      <i className={`ri-arrow-${showApiInstructions ? 'up' : 'down'}-s-line text-slate-500`}></i>
                    </button>

                    {showApiInstructions && (
                      <div className="mt-3 p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Get a Google Places API Key</p>
                              <p className="text-xs text-slate-500 mt-1">Go to <a href="https://console.cloud.google.com" target="_blank" rel="nofollow noreferrer" className="text-sky-600 underline">console.cloud.google.com</a> → APIs &amp; Services → Credentials → Create API Key. Then enable the <strong>Places API</strong> under "Enable APIs &amp; Services".</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Add the key to Supabase Secrets</p>
                              <p className="text-xs text-slate-500 mt-1">Go to your Supabase dashboard → Edge Functions → <strong>google-reviews</strong> → Secrets → Add secret named <code className="bg-slate-200 px-1 rounded">GOOGLE_PLACES_API_KEY</code> with your API key value.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Place ID */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Enter your Google Place ID</p>
                        <p className="text-xs text-slate-500">Find it at <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="nofollow noreferrer" className="text-sky-600 underline">Google's Place ID Finder</a></p>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
                      value={placeIdInput}
                      onChange={e => setPlaceIdInput(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                    />
                    <p className="text-xs text-slate-400 mt-2">Your Place ID is a unique identifier for your business on Google Maps. It starts with "ChIJ..."</p>
                  </div>

                  {googleError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <i className="ri-error-warning-line text-red-500 text-lg shrink-0 mt-0.5"></i>
                      <p className="text-sm text-red-700">{googleError}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSavePlaceId}
                      disabled={!placeIdInput.trim() || googleLoading}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      {googleLoading ? <><i className="ri-loader-4-line animate-spin"></i>Connecting...</> : <><i className="ri-google-line"></i>Connect Google Reviews</>}
                    </button>
                    {placeId && (
                      <button onClick={() => setShowSetup(false)} className="px-5 py-3 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 whitespace-nowrap">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Connected — show reviews */}
          {placeId && !showSetup && (
            <>
              {googleLoading && (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <i className="ri-loader-4-line text-slate-400 text-4xl animate-spin mb-3 block"></i>
                    <p className="text-slate-500 text-sm">Fetching reviews from Google...</p>
                  </div>
                </div>
              )}

              {googleError && !googleLoading && (
                <div className="bg-white rounded-2xl border border-red-200 p-10 text-center max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-error-warning-line text-red-500 text-2xl"></i>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Could Not Load Reviews</h3>
                  <p className="text-sm text-slate-500 mb-6">{googleError}</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => fetchGoogleReviews(placeId)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold whitespace-nowrap">
                      Retry
                    </button>
                    <button onClick={() => setShowSetup(true)} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold whitespace-nowrap">
                      Edit Settings
                    </button>
                  </div>
                </div>
              )}

              {googleData && !googleLoading && (
                <>
                  {/* Business header */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <i className="ri-map-pin-2-line text-slate-500 text-2xl"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{googleData.businessName}</h3>
                        <p className="text-sm text-slate-500">{googleData.address}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {renderStars(Math.round(googleData.overallRating), true)}
                          <span className="font-bold text-slate-900">{googleData.overallRating}</span>
                          <span className="text-slate-400 text-sm">· {googleData.totalRatings.toLocaleString()} total ratings</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => fetchGoogleReviews(placeId)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                        <i className="ri-refresh-line"></i>Refresh
                      </button>
                      <button onClick={() => setShowSetup(true)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                        <i className="ri-settings-3-line"></i>Settings
                      </button>
                      <button onClick={handleDisconnect} className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap">
                        Disconnect
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-5 mb-6">
                    {[
                      { label: 'Total Ratings', value: googleData.totalRatings.toLocaleString(), icon: 'ri-user-star-line', bg: 'bg-slate-100', color: 'text-slate-600' },
                      { label: 'Overall Rating', value: googleData.overallRating, icon: 'ri-star-line', bg: 'bg-amber-100', color: 'text-amber-600' },
                      { label: 'Reviews Shown', value: googleData.reviews.length, icon: 'ri-chat-quote-line', bg: 'bg-emerald-100', color: 'text-emerald-600' },
                      { label: '5-Star Count', value: googleData.reviews.filter(r => r.rating === 5).length, icon: 'ri-trophy-line', bg: 'bg-rose-100', color: 'text-rose-600' },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                          </div>
                          <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                            <i className={`${s.icon} ${s.color} text-xl`}></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Filter */}
                  <div className="bg-white rounded-xl p-5 border border-slate-200 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input
                          type="text"
                          placeholder="Search by author or review text..."
                          value={googleSearch}
                          onChange={e => setGoogleSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        {['all', '5', '4', '3', '2', '1'].map(r => (
                          <button
                            key={r}
                            onClick={() => setGoogleRatingFilter(r)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                              googleRatingFilter === r
                                ? r === 'all' ? 'bg-slate-900 text-white' : 'bg-amber-400 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {r === 'all' ? 'All' : <>{r}<i className="ri-star-fill text-xs"></i></>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Review cards */}
                  {filteredGoogleReviews.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                      <i className="ri-search-line text-slate-300 text-4xl mb-3 block"></i>
                      <p className="text-slate-500 text-sm">No reviews match your filters.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-5">
                      {filteredGoogleReviews.map((review, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {review.authorPhoto ? (
                                <img src={review.authorPhoto} alt={review.authorName} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                                  <i className="ri-user-line text-slate-400 text-lg"></i>
                                </div>
                              )}
                              <div>
                                <a href={review.authorUrl} target="_blank" rel="nofollow noreferrer" className="font-semibold text-slate-900 text-sm hover:underline">{review.authorName}</a>
                                <p className="text-xs text-slate-400">{review.relativeTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderStars(review.rating, true)}
                              <span className="text-xs font-bold text-slate-700">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {review.text || <span className="text-slate-400 italic">No written review.</span>}
                          </p>
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                            <i className="ri-google-line text-slate-300 text-sm"></i>
                            <span className="text-xs text-slate-400">Google Review · {new Date(review.time * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-red-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Review?</h3>
            <p className="text-slate-600 text-center mb-6 text-sm">This will permanently remove this review. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-3 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">Cancel</button>
              <button onClick={() => deleteReview(deleteConfirm)} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
