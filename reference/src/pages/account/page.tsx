import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mockOrders } from '../../mocks/orders';
import { useAuth } from '../../contexts/AuthContext';
import AddressManager from './components/AddressManager';
import PaymentManager from './components/PaymentManager';
import OrderDetailModal from './components/OrderDetailModal';
import PurchaseByLocation from './components/PurchaseByLocation';
import FavoriteProducts from './components/FavoriteProducts';
import RestockRequestForm from './components/RestockRequestForm';
import EditProfileModal from './components/EditProfileModal';
import NotificationPreferences from './components/NotificationPreferences';
import LoyaltyRewards from './components/LoyaltyRewards';
import ReferralProgram from './components/ReferralProgram';

type Tab = 'orders' | 'locations' | 'request-restock' | 'restock' | 'by-location' | 'favorites' | 'notifications' | 'rewards' | 'referrals';

interface RestockRequest {
  id: string;
  addressId: string;
  productId: number;
  productName: string;
  quantity: number;
  note: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'completed';
}

interface Address {
  id: string;
  label: string;
  type: 'residential' | 'commercial';
  businessName?: string;
  city: string;
  state: string;
}

function loadRestockRequests(): RestockRequest[] {
  try {
    const stored = localStorage.getItem('user_restock_requests');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadAddresses(): Address[] {
  try {
    const stored = localStorage.getItem('user_addresses');
    if (!stored) return [];
    const fullAddresses = JSON.parse(stored);
    return fullAddresses.map((addr: any) => ({
      id: addr.id,
      label: addr.label,
      type: addr.type,
      businessName: addr.businessName,
      city: addr.city,
      state: addr.state,
    }));
  } catch {
    return [];
  }
}

export default function AccountPage() {
  const { currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [allOrders, setAllOrders] = useState<typeof mockOrders>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const loadAllOrders = () => {
    try {
      const stored: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
      // Apply any admin status overrides
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('order_status_overrides') ?? '{}'
      );
      const storedNormalized = stored.map((o) => ({
        id: o.id,
        date: o.date,
        deliveredDate: o.deliveredDate ?? o.date,
        status: overrides[o.id] ?? o.status ?? 'Processing',
        total: o.total,
        items: (o.items ?? []).map((item: any) => ({
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          size: item.size ?? (item.width && item.height ? `${item.width}" x ${item.height}"` : ''),
        })),
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        shippingAddress: o.shippingAddress,
        isReorder: o.isReorder,
        originalOrderId: o.originalOrderId,
      }));
      // Merge: stored orders first (newest), then mock orders (avoiding duplicates)
      const storedIds = new Set(storedNormalized.map((o) => o.id));
      const filteredMocks = mockOrders.filter((o) => !storedIds.has(o.id));
      setAllOrders([...storedNormalized, ...filteredMocks] as any);
    } catch {
      setAllOrders(mockOrders as any);
    }
  };

  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/auth?returnUrl=/account');
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    setRestockRequests(loadRestockRequests());
    setAddresses(loadAddresses());
    loadFavoriteCount();
    loadAllOrders();
  }, [activeTab]);

  const loadFavoriteCount = () => {
    try {
      const stored = localStorage.getItem('user_favorites');
      if (stored) {
        const favorites = JSON.parse(stored);
        setFavoriteCount(favorites.length);
      } else {
        setFavoriteCount(0);
      }
    } catch {
      setFavoriteCount(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-emerald-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      // Clear all user-related localStorage data
      localStorage.removeItem('orders');
      localStorage.removeItem('user_addresses');
      localStorage.removeItem('user_favorites');
      localStorage.removeItem('user_restock_requests');
      localStorage.removeItem('order_status_overrides');
      localStorage.removeItem('cart_items');
      logout();
      navigate('/');
    }, 1000);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  const handleReorder = (order: typeof mockOrders[0]) => {
    // Generate a new order ID
    const newOrderId = `ORD-${Date.now().toString().slice(-8)}`;
    const now = new Date().toISOString();

    // Build the confirmation data
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat((subtotal * 0.0825).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const confirmationData = {
      orderId: newOrderId,
      orderDate: now,
      deliveryMethod: 'delivery',
      customerEmail: currentUser?.email ?? 'customer@example.com',
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        category: 'Window Treatments',
        color: '',
        mount: '',
        width: item.size?.split('x')[0]?.trim().replace('"', '') ?? '',
        height: item.size?.split('x')[1]?.trim().replace('"', '') ?? '',
      })),
      subtotal,
      shipping: 0,
      tax,
      total,
      isReorder: true,
      originalOrderId: order.id,
    };

    // Save to localStorage orders
    const existingOrders: any[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
    existingOrders.unshift({
      id: newOrderId,
      date: now,
      deliveredDate: now,
      status: 'Processing',
      total,
      subtotal,
      shipping: 0,
      tax,
      isReorder: true,
      originalOrderId: order.id,
      customer: {
        fullName: currentUser?.name ?? 'Customer',
        email: currentUser?.email ?? '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      items: confirmationData.items,
    });
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Refresh the orders list
    loadAllOrders();

    // Navigate to confirmation/receipt page
    navigate('/order-confirmation', { state: confirmationData });
  };

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: 'orders', label: 'My Orders', icon: 'ri-shopping-bag-line' },
    { id: 'rewards', label: 'Rewards', icon: 'ri-vip-crown-line' },
    { id: 'referrals', label: 'Refer & Earn', icon: 'ri-user-add-line' },
    { id: 'favorites', label: 'Favorites', icon: 'ri-heart-line', badge: favoriteCount },
    { id: 'locations', label: 'Locations & Payments', icon: 'ri-map-pin-line' },
    { id: 'by-location', label: 'Purchase by Location', icon: 'ri-pie-chart-line' },
    { id: 'request-restock', label: 'Request Restock', icon: 'ri-add-circle-line' },
    { id: 'restock', label: 'Restock History', icon: 'ri-refresh-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
  ];

  const getAddressLabel = (addressId: string) => {
    const addr = addresses.find(a => a.id === addressId);
    return addr ? addr.label : 'Unknown Location';
  };

  const getStatusColor = (status: RestockRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: RestockRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'ri-time-line';
      case 'approved':
        return 'ri-check-line';
      case 'completed':
        return 'ri-checkbox-circle-fill';
      default:
        return 'ri-question-line';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors">
              <i className="ri-arrow-left-line text-xl"></i>
              <span className="font-semibold text-base">Back to Home</span>
            </Link>
            <Link to="/cart" className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition-colors whitespace-nowrap cursor-pointer">
              <i className="ri-shopping-cart-2-line text-xl"></i>
              <span className="font-semibold text-base">Back to Cart</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 mb-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center">
                <i className="ri-user-line text-4xl text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentUser!.name}</h1>
                <p className="text-base text-gray-600 mb-1">{currentUser!.email}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(currentUser!.signupDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium text-sm whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-settings-line text-lg"></i>
                Edit Profile
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm whitespace-nowrap cursor-pointer"
              >
                <i className="ri-delete-bin-6-line text-lg"></i>
                Delete Account
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-emerald-600 transition-colors font-medium text-sm whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line text-lg"></i>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-10 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <i className={tab.icon}></i>
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reorder success toast */}
        {reorderFeedback && (
          <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
            <div className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-full shrink-0">
              <i className="ri-check-line text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Items added to cart!</p>
              <p className="text-xs text-gray-400">Order {reorderFeedback} items are ready.</p>
            </div>
            <Link to="/cart" className="ml-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap cursor-pointer">
              View Cart →
            </Link>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {/* Purchase Summary Banner */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-shopping-bag-3-line text-2xl text-emerald-600"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{allOrders.length}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-box-3-line text-2xl text-teal-600"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Items Bought</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {allOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0)}
                  </p>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <i className="ri-money-dollar-circle-line text-2xl text-amber-600"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${allOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order History CTA */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-file-list-3-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">View Your Full Order History</h2>
                  <p className="text-emerald-100 text-sm mt-0.5">Track statuses, view shipment details, and review past purchases</p>
                </div>
              </div>
              <Link
                to="/orders"
                className="flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors whitespace-nowrap cursor-pointer flex-shrink-0"
              >
                <i className="ri-arrow-right-line"></i>
                Go to Order History
              </Link>
            </div>

            <div className="mb-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-circle-line text-xl"></i>
                Start New Order
              </Link>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>

            {allOrders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-shopping-bag-line text-5xl text-gray-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-base text-gray-500 mb-6">Start shopping to see your order history here</p>
                <Link to="/#products" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {allOrders.map((order) => {
                  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
                  const isReordering = reorderFeedback === order.id;
                  const isReorder = (order as any).isReorder === true;
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Order Header */}
                      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Order</p>
                              <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-gray-900">{order.id}</p>
                                {isReorder && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                    <i className="ri-refresh-line text-xs"></i>
                                    Reorder
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Ordered</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                                {(order as any).status === 'Processing' ? 'Status' : 'Delivered'}
                              </p>
                              {(order as any).status === 'Processing' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                                  <i className="ri-time-line text-xs"></i> Processing
                                </span>
                              ) : (
                                <p className="text-sm font-semibold text-emerald-700">
                                  {new Date((order as any).deliveredDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                            {isReorder && (order as any).originalOrderId && (
                              <>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div>
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">Based On</p>
                                  <p className="text-sm font-semibold text-emerald-700">{(order as any).originalOrderId}</p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-3">
                              <p className="text-xs text-gray-500 mb-0.5">Order Total</p>
                              <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                            </div>
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedOrder(order as any)}
                              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <i className="ri-file-text-line text-base"></i>
                              Details
                            </button>
                            {/* Reorder */}
                            <button
                              onClick={() => handleReorder(order as any)}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer ${
                                isReordering
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              <i className={isReordering ? 'ri-check-line' : 'ri-refresh-line'}></i>
                              {isReordering ? 'Added!' : 'Reorder'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="px-6 py-5">
                        <div className="space-y-4 mb-5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500">Size: {item.size}</p>
                              </div>
                              <div className="flex items-center gap-6 shrink-0">
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-0.5">Qty</p>
                                  <p className="text-sm font-bold text-gray-900">{item.quantity}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-400 mb-0.5">Unit Price</p>
                                  <p className="text-sm font-semibold text-gray-700">${item.price.toFixed(2)}</p>
                                </div>
                                <div className="text-center min-w-[72px]">
                                  <p className="text-xs text-gray-400 mb-0.5">Subtotal</p>
                                  <p className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-5 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <i className="ri-box-3-line text-gray-400"></i>
                              <strong className="text-gray-900">{totalQty}</strong> item{totalQty !== 1 ? 's' : ''}
                            </span>
                            {(order as any).status !== 'Processing' && (
                              <span className="flex items-center gap-1.5">
                                <i className="ri-truck-line text-emerald-500"></i>
                                Delivered in {Math.round((new Date((order as any).deliveredDate).getTime() - new Date(order.date).getTime()) / 86400000)} days
                              </span>
                            )}
                          </div>
                          <p className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && <FavoriteProducts />}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Rewards</h2>
              <p className="text-sm text-gray-500 mt-1">Earn points on every order and redeem them for discounts and perks</p>
            </div>
            <LoyaltyRewards />
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Refer &amp; Earn</h2>
              <p className="text-sm text-gray-500 mt-1">Share your unique link — earn 500 bonus points for every friend who orders</p>
            </div>
            <ReferralProgram />
          </div>
        )}

        {/* Locations & Payments Tab */}
        {activeTab === 'locations' && (
          <div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm mb-8">
              <AddressManager />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <PaymentManager />
            </div>
          </div>
        )}

        {/* Purchase by Location Tab */}
        {activeTab === 'by-location' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Purchase by Location</h2>
              <p className="text-sm text-gray-500 mt-1">See how much you've spent and what products were ordered at each address</p>
            </div>
            <PurchaseByLocation />
          </div>
        )}

        {/* Request Restock Tab */}
        {activeTab === 'request-restock' && (
          <RestockRequestForm />
        )}

        {/* Restock Requests Tab */}
        {activeTab === 'restock' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Restock History</h2>
                <p className="text-sm text-gray-500 mt-1">Track all your submitted restock requests</p>
              </div>
              <button
                onClick={() => setActiveTab('request-restock')}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line"></i>
                New Request
              </button>
            </div>

            {restockRequests.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-refresh-line text-4xl text-emerald-500"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No restock requests yet</h3>
                <p className="text-base text-gray-500 mb-6">Submit your first restock request and it will appear here</p>
                <button
                  onClick={() => setActiveTab('request-restock')}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-circle-line"></i>
                  Request a Restock
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {restockRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{request.productName}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                            <i className={getStatusIcon(request.status)}></i>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <i className="ri-map-pin-line text-emerald-600"></i>
                            <span>{getAddressLabel(request.addressId)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <i className="ri-calendar-line text-gray-400"></i>
                            <span>{new Date(request.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Quantity</p>
                        <p className="text-2xl font-bold text-gray-900">{request.quantity}</p>
                      </div>
                    </div>
                    {request.note && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Note:</p>
                        <p className="text-sm text-gray-700">{request.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationPreferences />
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder as any}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <i className="ri-alert-line text-2xl text-red-600"></i>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Delete Your Account</h2>
                <p className="text-sm text-red-600 font-medium">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Permanently deleting your account will remove <strong>all your data</strong>, including:
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  { icon: 'ri-shopping-bag-line', text: 'Order history & receipts' },
                  { icon: 'ri-map-pin-line', text: 'Saved addresses & locations' },
                  { icon: 'ri-heart-line', text: 'Favorite products' },
                  { icon: 'ri-refresh-line', text: 'Restock requests' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-7 h-7 flex items-center justify-center bg-red-50 rounded-lg shrink-0">
                      <i className={`${item.icon} text-red-500 text-sm`}></i>
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 bg-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                    deleteConfirmText === 'DELETE' && !isDeleting
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-100 text-red-300 cursor-not-allowed'
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="ri-delete-bin-6-line"></i>
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}