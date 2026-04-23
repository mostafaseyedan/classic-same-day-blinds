import { useState, useEffect } from 'react';
import { mockPayments } from '../../../mocks/accountData';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  label: string;
  cardholderName: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
  assignedAddresses: string[]; // Array of address IDs
  defaultForAddresses: string[]; // Array of address IDs where this is the default payment
}

interface Address {
  id: string;
  label: string;
  type: 'residential' | 'commercial';
  businessName?: string;
  city: string;
  state: string;
}

const emptyForm = {
  label: '',
  cardholderName: '',
  cardNumber: '',
  expMonth: '',
  expYear: '',
  cvv: '',
  assignedAddresses: [] as string[],
};

function detectCardType(num: string): PaymentMethod['type'] {
  if (num.startsWith('4')) return 'visa';
  if (num.startsWith('5')) return 'mastercard';
  if (num.startsWith('3')) return 'amex';
  return 'discover';
}

function cardIcon(type: PaymentMethod['type']) {
  const icons: Record<PaymentMethod['type'], { icon: string; color: string }> = {
    visa: { icon: 'ri-visa-line', color: 'text-blue-700' },
    mastercard: { icon: 'ri-mastercard-line', color: 'text-orange-500' },
    amex: { icon: 'ri-bank-card-line', color: 'text-emerald-600' },
    discover: { icon: 'ri-bank-card-2-line', color: 'text-amber-500' },
  };
  return icons[type];
}

function cardLabel(type: PaymentMethod['type']) {
  return { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover' }[type];
}

function loadPayments(): PaymentMethod[] {
  try {
    const stored = localStorage.getItem('user_payments');
    if (stored) return JSON.parse(stored);
    // Seed with demo data on first load
    const demo = mockPayments as PaymentMethod[];
    localStorage.setItem('user_payments', JSON.stringify(demo));
    return demo;
  } catch {
    return mockPayments as PaymentMethod[];
  }
}

function savePayments(payments: PaymentMethod[]) {
  localStorage.setItem('user_payments', JSON.stringify(payments));
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

const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(currentYear + i));

export default function PaymentManager() {
  const [payments, setPayments] = useState<PaymentMethod[]>(loadPayments);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [showCvv, setShowCvv] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState<string | null>(null);

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  const validate = () => {
    const newErrors: Partial<typeof emptyForm> = {};
    if (!form.label.trim()) newErrors.label = 'Label is required';
    if (!form.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required';
    if (!editingId) {
      const digits = form.cardNumber.replace(/\s/g, '');
      if (digits.length < 13 || digits.length > 19) newErrors.cardNumber = 'Enter a valid card number';
    }
    if (!form.expMonth) newErrors.expMonth = 'Required';
    if (!form.expYear) newErrors.expYear = 'Required';
    if (!editingId && (!form.cvv || form.cvv.length < 3)) newErrors.cvv = 'Enter valid CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const openAdd = () => {
    setForm({ ...emptyForm, assignedAddresses: [] });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (pm: PaymentMethod) => {
    setForm({
      label: pm.label,
      cardholderName: pm.cardholderName,
      cardNumber: '',
      expMonth: pm.expMonth,
      expYear: pm.expYear,
      cvv: '',
      assignedAddresses: pm.assignedAddresses || [],
    });
    setEditingId(pm.id);
    setErrors({});
    setShowForm(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    let updated: PaymentMethod[];
    if (editingId) {
      updated = payments.map(p =>
        p.id === editingId
          ? { 
              ...p, 
              label: form.label, 
              cardholderName: form.cardholderName, 
              expMonth: form.expMonth, 
              expYear: form.expYear,
              assignedAddresses: form.assignedAddresses,
            }
          : p
      );
    } else {
      const digits = form.cardNumber.replace(/\s/g, '');
      const newPm: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: detectCardType(digits),
        label: form.label,
        cardholderName: form.cardholderName,
        last4: digits.slice(-4),
        expMonth: form.expMonth,
        expYear: form.expYear,
        isDefault: payments.length === 0,
        assignedAddresses: form.assignedAddresses,
        defaultForAddresses: [],
      };
      updated = [...payments, newPm];
    }
    savePayments(updated);
    setPayments(updated);
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    if (updated.length > 0 && !updated.some(p => p.isDefault)) {
      updated[0].isDefault = true;
    }
    savePayments(updated);
    setPayments(updated);
    setDeleteConfirm(null);
  };

  const setDefault = (id: string) => {
    const updated = payments.map(p => ({ ...p, isDefault: p.id === id }));
    savePayments(updated);
    setPayments(updated);
  };

  const toggleAddressAssignment = (paymentId: string, addressId: string) => {
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        const assigned = p.assignedAddresses || [];
        const isAssigned = assigned.includes(addressId);
        const newAssigned = isAssigned
          ? assigned.filter(id => id !== addressId)
          : [...assigned, addressId];
        
        // Remove from defaultForAddresses if unassigning
        const newDefaults = isAssigned
          ? (p.defaultForAddresses || []).filter(id => id !== addressId)
          : p.defaultForAddresses || [];
        
        return { ...p, assignedAddresses: newAssigned, defaultForAddresses: newDefaults };
      }
      return p;
    });
    savePayments(updated);
    setPayments(updated);
  };

  const setDefaultForAddress = (paymentId: string, addressId: string) => {
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        const defaults = p.defaultForAddresses || [];
        const isDefault = defaults.includes(addressId);
        const newDefaults = isDefault
          ? defaults.filter(id => id !== addressId)
          : [...defaults, addressId];
        return { ...p, defaultForAddresses: newDefaults };
      } else {
        // Remove this address from other payment's defaults
        return {
          ...p,
          defaultForAddresses: (p.defaultForAddresses || []).filter(id => id !== addressId)
        };
      }
    });
    savePayments(updated);
    setPayments(updated);
  };

  const toggleFormAddress = (addressId: string) => {
    const isAssigned = form.assignedAddresses.includes(addressId);
    setForm(f => ({
      ...f,
      assignedAddresses: isAssigned
        ? f.assignedAddresses.filter(id => id !== addressId)
        : [...f.assignedAddresses, addressId]
    }));
  };

  const inputClass = (field: keyof typeof emptyForm) =>
    `w-full border ${errors[field] ? 'border-red-400' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
          <p className="text-sm text-gray-500 mt-1">Manage cards and assign them to specific locations</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line"></i>
          Add Card
        </button>
      </div>

      {payments.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-bank-card-line text-2xl text-emerald-500"></i>
          </div>
          <p className="text-gray-600 font-medium mb-1">No payment methods saved yet</p>
          <p className="text-sm text-gray-400">Add a card to speed up checkout</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {payments.map(pm => {
          const { icon, color } = cardIcon(pm.type);
          const assignedAddrs = addresses.filter(a => (pm.assignedAddresses || []).includes(a.id));
          const showPicker = showAddressPicker === pm.id;

          return (
            <div
              key={pm.id}
              className={`relative border rounded-xl p-5 transition-all ${pm.isDefault ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              {pm.isDefault && (
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg`}>
                  <i className={`${icon} text-2xl ${color}`}></i>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{pm.label}</p>
                  <p className="text-xs text-gray-500">{cardLabel(pm.type)} •••• {pm.last4}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{pm.cardholderName}</p>
              <p className="text-sm text-gray-400">Expires {pm.expMonth}/{pm.expYear}</p>

              {/* Assigned Addresses */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-600">Assigned Locations</p>
                  <button
                    onClick={() => setShowAddressPicker(showPicker ? null : pm.id)}
                    className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {showPicker ? 'Close' : 'Manage'}
                  </button>
                </div>

                {showPicker && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                    {addresses.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">No locations available</p>
                    ) : (
                      <div className="space-y-2">
                        {addresses.map(addr => {
                          const isAssigned = (pm.assignedAddresses || []).includes(addr.id);
                          const isDefault = (pm.defaultForAddresses || []).includes(addr.id);
                          return (
                            <div key={addr.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => toggleAddressAssignment(pm.id, addr.id)}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">{addr.label}</p>
                                  <p className="text-xs text-gray-500 truncate">{addr.city}, {addr.state}</p>
                                </div>
                              </div>
                              {isAssigned && (
                                <button
                                  onClick={() => setDefaultForAddress(pm.id, addr.id)}
                                  className={`ml-2 text-xs font-semibold px-2 py-1 rounded whitespace-nowrap cursor-pointer ${
                                    isDefault
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {isDefault ? 'Default' : 'Set Default'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {assignedAddrs.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Not assigned to any location</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {assignedAddrs.map(addr => {
                      const isDefault = (pm.defaultForAddresses || []).includes(addr.id);
                      return (
                        <span
                          key={addr.id}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            isDefault
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <i className={`${addr.type === 'commercial' ? 'ri-building-line' : 'ri-home-line'} text-xs`}></i>
                          {addr.label}
                          {isDefault && <i className="ri-star-fill text-xs"></i>}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                {!pm.isDefault && (
                  <button
                    onClick={() => setDefault(pm.id)}
                    className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => openEdit(pm)}
                  className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <i className="ri-edit-line"></i> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(pm.id)}
                  className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer whitespace-nowrap flex items-center gap-1 ml-auto"
                >
                  <i className="ri-delete-bin-line"></i> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-5">
            {editingId ? 'Edit Card' : 'Add New Card'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Card Label <span className="text-red-400">*</span></label>
              <input
                className={inputClass('label')}
                placeholder="e.g. Personal Visa, Business Card"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              />
              {errors.label && <p className="text-xs text-red-400 mt-1">{errors.label}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cardholder Name <span className="text-red-400">*</span></label>
              <input
                className={inputClass('cardholderName')}
                placeholder="John Doe"
                value={form.cardholderName}
                onChange={e => setForm(f => ({ ...f, cardholderName: e.target.value }))}
              />
              {errors.cardholderName && <p className="text-xs text-red-400 mt-1">{errors.cardholderName}</p>}
            </div>
            {!editingId && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Card Number <span className="text-red-400">*</span></label>
                <input
                  className={inputClass('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  value={form.cardNumber}
                  maxLength={19}
                  onChange={e => setForm(f => ({ ...f, cardNumber: formatCardNumber(e.target.value) }))}
                />
                {errors.cardNumber && <p className="text-xs text-red-400 mt-1">{errors.cardNumber}</p>}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Month <span className="text-red-400">*</span></label>
              <select
                className={inputClass('expMonth')}
                value={form.expMonth}
                onChange={e => setForm(f => ({ ...f, expMonth: e.target.value }))}
              >
                <option value="">MM</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.expMonth && <p className="text-xs text-red-400 mt-1">{errors.expMonth}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Expiry Year <span className="text-red-400">*</span></label>
              <select
                className={inputClass('expYear')}
                value={form.expYear}
                onChange={e => setForm(f => ({ ...f, expYear: e.target.value }))}
              >
                <option value="">YYYY</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.expYear && <p className="text-xs text-red-400 mt-1">{errors.expYear}</p>}
            </div>
            {!editingId && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">CVV <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    className={inputClass('cvv')}
                    placeholder="•••"
                    type={showCvv ? 'text' : 'password'}
                    maxLength={4}
                    value={form.cvv}
                    onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '') }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <i className={showCvv ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
                {errors.cvv && <p className="text-xs text-red-400 mt-1">{errors.cvv}</p>}
              </div>
            )}

            {/* Assign to Locations */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Assign to Locations</label>
              {addresses.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No locations available. Add a location first.</p>
              ) : (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {addresses.map(addr => {
                      const isAssigned = form.assignedAddresses.includes(addr.id);
                      return (
                        <label
                          key={addr.id}
                          className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleFormAddress(addr.id)}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                          />
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <i className={`${addr.type === 'commercial' ? 'ri-building-line text-blue-600' : 'ri-home-line text-emerald-600'} text-sm`}></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate">{addr.label}</p>
                              <p className="text-xs text-gray-500 truncate">{addr.city}, {addr.state}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg">
            <i className="ri-shield-check-line text-emerald-500 text-base"></i>
            <p className="text-xs text-gray-500">Your card details are stored securely on this device only.</p>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Add Card'}
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
              <i className="ri-bank-card-line text-2xl text-red-500"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove Card?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This card will be permanently removed from your account.</p>
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
    </div>
  );
}