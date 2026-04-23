import { useState } from 'react';
import { products as productCatalog } from '../../../mocks/products';
import { mockAddresses } from '../../../mocks/accountData';

interface Address {
  id: string;
  label: string;
  type: 'residential' | 'commercial';
  businessName?: string;
  fullName: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
  assignedProducts: AssignedProduct[];
}

interface AssignedProduct {
  productId: number;
  productName: string;
  productImage: string;
  addedAt: number;
}

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

const emptyAddress: Omit<Address, 'id' | 'isDefault' | 'assignedProducts'> = {
  label: '',
  type: 'residential',
  businessName: '',
  fullName: '',
  street: '',
  apt: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
  phone: '',
};

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming'
];

function loadAddresses(): Address[] {
  try {
    const stored = localStorage.getItem('user_addresses');
    if (stored) return JSON.parse(stored);
    // Seed with demo data on first load
    const demo = mockAddresses as Address[];
    localStorage.setItem('user_addresses', JSON.stringify(demo));
    return demo;
  } catch {
    return mockAddresses as Address[];
  }
}

function saveAddresses(addresses: Address[]) {
  localStorage.setItem('user_addresses', JSON.stringify(addresses));
}

function loadRestockRequests(): RestockRequest[] {
  try {
    const stored = localStorage.getItem('user_restock_requests');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRestockRequests(requests: RestockRequest[]) {
  localStorage.setItem('user_restock_requests', JSON.stringify(requests));
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>(loadRestockRequests);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyAddress>>({});
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [restockPopup, setRestockPopup] = useState<{ addressId: string; productId: number } | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockNote, setRestockNote] = useState('');

  const validate = () => {
    const newErrors: Partial<typeof emptyAddress> = {};
    if (!form.label.trim()) newErrors.label = 'Label is required';
    if (form.type === 'commercial' && !form.businessName?.trim()) newErrors.businessName = 'Business name is required';
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.street.trim()) newErrors.street = 'Street address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openAdd = () => {
    setForm(emptyAddress);
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      type: addr.type,
      businessName: addr.businessName || '',
      fullName: addr.fullName,
      street: addr.street,
      apt: addr.apt || '',
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      phone: addr.phone,
    });
    setEditingId(addr.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    let updated: Address[];
    if (editingId) {
      updated = addresses.map(a =>
        a.id === editingId ? { ...a, ...form } : a
      );
    } else {
      const newAddr: Address = {
        id: `addr_${Date.now()}`,
        ...form,
        isDefault: addresses.length === 0,
        assignedProducts: [],
      };
      updated = [...addresses, newAddr];
    }
    saveAddresses(updated);
    setAddresses(updated);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
    setAddresses(updated);
    setDeleteConfirm(null);
  };

  const setDefault = (id: string) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
    setAddresses(updated);
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const addProductToAddress = (addressId: string, productId: number) => {
    const product = productCatalog.find(p => p.id === productId);
    if (!product) return;

    const updated = addresses.map(addr => {
      if (addr.id === addressId) {
        const alreadyAssigned = addr.assignedProducts.some(ap => ap.productId === productId);
        if (alreadyAssigned) return addr;
        return {
          ...addr,
          assignedProducts: [
            ...addr.assignedProducts,
            {
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              addedAt: Date.now(),
            }
          ]
        };
      }
      return addr;
    });
    setAddresses(updated);
    saveAddresses(updated);
    setProductSearch('');
  };

  const removeProductFromAddress = (addressId: string, productId: number) => {
    const updated = addresses.map(addr => {
      if (addr.id === addressId) {
        return {
          ...addr,
          assignedProducts: addr.assignedProducts.filter(ap => ap.productId !== productId)
        };
      }
      return addr;
    });
    setAddresses(updated);
    saveAddresses(updated);
  };

  const submitRestockRequest = () => {
    if (!restockPopup) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const address = addresses.find(a => a.id === restockPopup.addressId);
    const product = address?.assignedProducts.find(ap => ap.productId === restockPopup.productId);
    if (!address || !product) return;

    const request: RestockRequest = {
      id: `restock_${Date.now()}`,
      addressId: restockPopup.addressId,
      productId: restockPopup.productId,
      productName: product.productName,
      quantity: qty,
      note: restockNote.trim(),
      timestamp: Date.now(),
      status: 'pending',
    };

    const updated = [request, ...restockRequests];
    setRestockRequests(updated);
    saveRestockRequests(updated);

    setRestockPopup(null);
    setRestockQty('');
    setRestockNote('');
  };

  const filteredProducts = productCatalog.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const inputClass = (field: keyof typeof emptyAddress) =>
    `w-full border ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Locations & Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage delivery addresses and commercial locations with assigned products</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line"></i>
          Add Location
        </button>
      </div>

      {/* Address Cards */}
      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-map-pin-line text-2xl text-emerald-500"></i>
          </div>
          <p className="text-gray-600 font-medium mb-1">No locations saved yet</p>
          <p className="text-sm text-gray-400">Add a location to manage products and deliveries</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-6">
        {addresses.map(addr => {
          const isExpanded = expandedCards.has(addr.id);
          const showPicker = showProductPicker === addr.id;
          const assignedIds = new Set(addr.assignedProducts.map(ap => ap.productId));

          return (
            <div
              key={addr.id}
              className={`relative border rounded-xl transition-all ${addr.isDefault ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}
            >
              {/* Header */}
              <div className="p-5">
                {addr.isDefault && (
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full ${addr.type === 'commercial' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                      <i className={`${addr.type === 'commercial' ? 'ri-building-line text-blue-600' : 'ri-home-line text-emerald-600'} text-sm`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{addr.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${addr.type === 'commercial' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {addr.type === 'commercial' ? 'Commercial' : 'Residential'}
                        </span>
                      </div>
                      {addr.type === 'commercial' && addr.businessName && (
                        <p className="text-xs text-gray-500 mt-0.5">{addr.businessName}</p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 font-medium">{addr.fullName}</p>
                <p className="text-sm text-gray-500">{addr.street}{addr.apt ? `, ${addr.apt}` : ''}</p>
                <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-sm text-gray-500">{addr.country}</p>
                <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>

                {/* Assigned Products Summary */}
                {addr.assignedProducts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <i className="ri-box-3-line"></i>
                      <span className="font-medium">{addr.assignedProducts.length} product{addr.assignedProducts.length !== 1 ? 's' : ''} assigned</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toggleExpand(addr.id)}
                    className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`}></i>
                    {isExpanded ? 'Hide' : 'Show'} Products
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <i className="ri-edit-line"></i> Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(addr.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer whitespace-nowrap flex items-center gap-1 ml-auto"
                  >
                    <i className="ri-delete-bin-line"></i> Remove
                  </button>
                </div>
              </div>

              {/* Expanded: Assigned Products */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">Assigned Products</h4>
                      <button
                        onClick={() => setShowProductPicker(showPicker ? null : addr.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-add-circle-line"></i>
                        {showPicker ? 'Close' : 'Add Product'}
                      </button>
                    </div>

                    {/* Product Picker */}
                    {showPicker && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white mb-2"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredProducts.map(product => {
                            const isAssigned = assignedIds.has(product.id);
                            return (
                              <button
                                key={product.id}
                                onClick={() => !isAssigned && addProductToAddress(addr.id, product.id)}
                                disabled={isAssigned}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                                  isAssigned
                                    ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                                    : 'hover:bg-white border border-transparent hover:border-emerald-200'
                                }`}
                              >
                                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-gray-100">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                  <p className="text-xs text-gray-500">${product.price.toFixed(2)}</p>
                                </div>
                                {isAssigned && (
                                  <i className="ri-check-line text-emerald-600"></i>
                                )}
                              </button>
                            );
                          })}
                          {filteredProducts.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No products found</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assigned Product List */}
                    {addr.assignedProducts.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <i className="ri-box-3-line text-2xl text-gray-300 mb-2"></i>
                        <p className="text-xs text-gray-400">No products assigned yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {addr.assignedProducts.map(ap => (
                          <div
                            key={ap.productId}
                            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-200 transition-colors"
                          >
                            <div className="w-12 h-12 rounded overflow-hidden shrink-0 bg-gray-100">
                              <img src={ap.productImage} alt={ap.productName} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{ap.productName}</p>
                              <p className="text-xs text-gray-400">Added {new Date(ap.addedAt).toLocaleDateString()}</p>
                            </div>
                            <button
                              onClick={() => setRestockPopup({ addressId: addr.id, productId: ap.productId })}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <i className="ri-refresh-line"></i>
                              Restock
                            </button>
                            <button
                              onClick={() => removeProductFromAddress(addr.id, ap.productId)}
                              className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-5">
            {editingId ? 'Edit Location' : 'New Location'}
          </h3>

          {/* Type Toggle */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Location Type <span className="text-red-400">*</span></label>
            <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => setForm(f => ({ ...f, type: 'residential' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  form.type === 'residential'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <i className="ri-home-line"></i>
                Residential
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, type: 'commercial' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  form.type === 'commercial'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <i className="ri-building-line"></i>
                Commercial Location
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Location Label <span className="text-red-400">*</span></label>
              <input
                className={inputClass('label')}
                placeholder="e.g. Home, Office, Warehouse A"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              />
              {errors.label && <p className="text-xs text-red-400 mt-1">{errors.label}</p>}
            </div>

            {form.type === 'commercial' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name <span className="text-red-400">*</span></label>
                <input
                  className={inputClass('businessName')}
                  placeholder="ABC Company Inc."
                  value={form.businessName}
                  onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                />
                {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Name <span className="text-red-400">*</span></label>
              <input
                className={inputClass('fullName')}
                placeholder="John Doe"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              />
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Street Address <span className="text-red-400">*</span></label>
              <input
                className={inputClass('street')}
                placeholder="123 Main St"
                value={form.street}
                onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
              />
              {errors.street && <p className="text-xs text-red-400 mt-1">{errors.street}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Apt / Suite / Unit</label>
              <input
                className={inputClass('apt')}
                placeholder="Apt 4B (optional)"
                value={form.apt}
                onChange={e => setForm(f => ({ ...f, apt: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City <span className="text-red-400">*</span></label>
              <input
                className={inputClass('city')}
                placeholder="Los Angeles"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
              {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">State <span className="text-red-400">*</span></label>
              <select
                className={inputClass('state')}
                value={form.state}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              >
                <option value="">Select state...</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ZIP Code <span className="text-red-400">*</span></label>
              <input
                className={inputClass('zip')}
                placeholder="90001"
                value={form.zip}
                onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
              />
              {errors.zip && <p className="text-xs text-red-400 mt-1">{errors.zip}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country</label>
              <select
                className={inputClass('country')}
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              >
                <option>United States</option>
                <option>Mexico</option>
                <option>Canada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number <span className="text-red-400">*</span></label>
              <input
                className={inputClass('phone')}
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Add Location'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-2xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Location?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This location and all assigned products will be removed from your account.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Request Popup */}
      {restockPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-refresh-line text-2xl text-emerald-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Request Restock</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {addresses.find(a => a.id === restockPopup.addressId)?.assignedProducts.find(ap => ap.productId === restockPopup.productId)?.productName}
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="Enter quantity"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Note <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="Add any additional details..."
                  rows={3}
                  maxLength={200}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRestockPopup(null); setRestockQty(''); setRestockNote(''); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={submitRestockRequest}
                disabled={!restockQty || parseInt(restockQty, 10) <= 0}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}