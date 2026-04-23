import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import jsPDF from 'jspdf';
import { CartItem, CheckoutForm, PickupForm, QuoteForm } from './cartTypes';
import {
  MXN_RATE, TAX_RATE, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY, ADMIN_EMAIL, US_STATES, buildOrderConfirmationEmail, QUOTE_RECIPIENTS,
} from './cartConstants';
import CheckoutView from './components/CheckoutView';
import CartAffirmCalculator from './components/CartAffirmCalculator';
import { products as productCatalog } from '../../mocks/products';
import CartRecommendations from './components/CartRecommendations';
import RecentlyViewedInCart from './components/RecentlyViewedInCart';
import SavedForLater from './components/SavedForLater';
import BulkDiscountBanner, { getBulkDiscount } from './components/BulkDiscountBanner';
import { POINTS_PER_DOLLAR, pointsToDiscount, recordCheckoutRedemption } from '../../utils/loyaltyPoints';

function formatPrice(usd: number, language: string) {
  if (language === 'es') {
    const mxn = (usd * MXN_RATE).toFixed(2);
    return (
      <span className="flex flex-col items-end leading-tight">
        <span>${usd.toFixed(2)} <span className="text-xs font-normal text-gray-400">USD</span></span>
        <span className="text-xs text-green-700 font-semibold">${Number(mxn).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
      </span>
    );
  }
  return <span>${usd.toFixed(2)}</span>;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [lastViewedProduct, setLastViewedProduct] = useState<string>('/');

  const [pickupDetails, setPickupDetails] = useState<PickupForm>({ pickupName: '', pickupPhone: '', pickupDate: '', pickupTime: '' });
  const [pickupErrors, setPickupErrors] = useState<Partial<PickupForm>>({});

  const [form, setForm] = useState<CheckoutForm>({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', notes: '', salesRep: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<CheckoutForm>>({});

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState('');

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    firstName: '', lastName: '', companyName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', notes: '',
  });
  const [quoteErrors, setQuoteErrors] = useState<Partial<QuoteForm>>({});
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(['main', 'sales']);

  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [appliedPoints, setAppliedPoints] = useState(0);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart') ?? '[]');
    setCart(stored);
    const storedSaved = JSON.parse(localStorage.getItem('saved_for_later') ?? '[]');
    setSavedItems(storedSaved);
    const lp = localStorage.getItem('last_viewed_product');
    if (lp) setLastViewedProduct(lp);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (cart.length > 0) {
      localStorage.setItem('cart_updated_at', Date.now().toString());
    }
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('saved_for_later', JSON.stringify(savedItems));
  }, [savedItems]);

  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeItem = (id: number) => setCart(cart.filter(item => item.id !== id));

  const handleSaveForLater = (id: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    setSavedItems((prev) => {
      const exists = prev.find((i) => i.id === id);
      if (exists) return prev;
      return [...prev, item];
    });
    setCart(cart.filter((i) => i.id !== id));
  };

  const handleMoveToCart = (item: CartItem) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveSaved = (id: number) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddRecommendedToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutForm> = {};
    if (!form.firstName.trim()) errors.firstName = 'Required';
    if (!form.lastName.trim()) errors.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Valid email required';
    if (!form.phone.trim()) errors.phone = 'Required';
    if (deliveryMethod === 'delivery') {
      if (!form.address.trim()) errors.address = 'Required';
      if (!form.city.trim()) errors.city = 'Required';
      if (!form.state.trim()) errors.state = 'Required';
      if (!form.zip.trim()) errors.zip = 'Required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePickupForm = (): boolean => {
    const errors: Partial<PickupForm> = {};
    if (!pickupDetails.pickupName.trim()) errors.pickupName = 'Required';
    if (!pickupDetails.pickupPhone.trim()) errors.pickupPhone = 'Required';
    if (!pickupDetails.pickupDate.trim()) errors.pickupDate = 'Required';
    if (!pickupDetails.pickupTime.trim()) errors.pickupTime = 'Required';
    setPickupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const bulkDiscountRate = getBulkDiscount(totalItems);
  const bulkDiscountAmount = subtotal * bulkDiscountRate;
  const promoDiscount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const pointsDiscount = pointsToDiscount(appliedPoints);
  const subtotalAfterPromo = subtotal - promoDiscount - bulkDiscountAmount - pointsDiscount;
  const shipping = 0;
  const tax = subtotalAfterPromo * TAX_RATE;
  const total = Math.max(0, subtotalAfterPromo + shipping + tax);
  const pendingPoints = Math.floor(subtotalAfterPromo * POINTS_PER_DOLLAR);

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoLoading(true);
    const validCodes: Record<string, number> = { 'SAVE10': 0.10, 'BLINDS15': 0.15, 'WELCOME20': 0.20 };
    setTimeout(() => {
      const code = promoCode.trim().toUpperCase();
      if (validCodes[code]) {
        setAppliedPromo({ code, discount: validCodes[code] });
        setPromoCode('');
      } else {
        setPromoError('Invalid or expired promo code');
        setAppliedPromo(null);
      }
      setPromoLoading(false);
    }, 800);
  };

  const handleRemovePromo = () => { setAppliedPromo(null); setPromoCode(''); setPromoError(''); };

  const handleApplyPoints = (points: number) => {
    setAppliedPoints(points);
  };

  const handleRemovePoints = () => {
    setAppliedPoints(0);
  };

  const handlePlaceOrder = async () => {
    const contactValid = validateForm();
    const pickupValid = deliveryMethod === 'pickup' ? validatePickupForm() : true;
    if (!contactValid || !pickupValid) return;

    setIsProcessing(true);
    setProcessingError('');

    const newOrderId = `ORD-${Date.now()}`;
    const newOrder = {
      id: newOrderId, date: new Date().toISOString(), status: 'Working on Order' as const,
      items: cart, subtotal, promoDiscount: appliedPromo ? promoDiscount : 0,
      promoCode: appliedPromo?.code || null, shipping, tax, total, deliveryMethod,
      pointsRedeemed: appliedPoints,
      pointsDiscount,
      pickupDetails: deliveryMethod === 'pickup' ? pickupDetails : null,
      customer: { firstName: form.firstName, lastName: form.lastName, companyName: form.companyName, email: form.email, phone: form.phone, address: form.address, city: form.city, state: form.state, zip: form.zip, notes: form.notes, salesRep: form.salesRep },
    };

    // Save pending order — will be confirmed after Stripe success
    localStorage.setItem(`pending_order_${newOrderId}`, JSON.stringify(newOrder));

    try {
      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const totalPromoDiscount = (appliedPromo ? promoDiscount : 0) + pointsDiscount + bulkDiscountAmount;
      const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          tax,
          promoDiscount: totalPromoDiscount,
          customer: { firstName: form.firstName, lastName: form.lastName, email: form.email },
          orderId: newOrderId,
          successUrl: `${window.location.origin}/order-confirmation`,
          cancelUrl: `${window.location.origin}/cart`,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Could not create checkout session');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment setup failed. Please try again.';
      setProcessingError(message);
      setIsProcessing(false);
      // Clean up pending order on error
      localStorage.removeItem(`pending_order_${newOrderId}`);
    }
  };

  const validateQuoteForm = (): boolean => {
    const errors: Partial<QuoteForm> = {};
    if (!quoteForm.firstName.trim()) errors.firstName = 'Required';
    if (!quoteForm.lastName.trim()) errors.lastName = 'Required';
    if (!quoteForm.email.trim() || !/\S+@\S+\.\S+/.test(quoteForm.email)) errors.email = 'Valid email required';
    if (!quoteForm.phone.trim()) errors.phone = 'Required';
    setQuoteErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendQuote = async () => {
    if (!validateQuoteForm()) return;
    if (selectedRecipients.length === 0) return;
    setQuoteSubmitting(true);
    const itemsList = cart.map(i => `${i.name} | Qty: ${i.quantity} | $${(i.price * i.quantity).toFixed(2)}${i.width && i.height ? ` | ${i.width}" W x ${i.height}" H` : ''}${i.color ? ` | ${i.color}` : ''}`).join('\n');
    const recipientLabels = QUOTE_RECIPIENTS.filter(r => selectedRecipients.includes(r.id)).map(r => `${r.label} <${r.email}>`).join('; ');
    const params = new URLSearchParams({
      name: `${quoteForm.firstName} ${quoteForm.lastName}`, email: quoteForm.email,
      company: quoteForm.companyName || '\u2014', phone: quoteForm.phone,
      address: quoteForm.address ? `${quoteForm.address}, ${quoteForm.city}, ${quoteForm.state} ${quoteForm.zip}`.trim() : '\u2014',
      items: itemsList, subtotal: `$${subtotal.toFixed(2)}`, estimated_total: `$${total.toFixed(2)}`,
      notes: quoteForm.notes || '\u2014',
      send_to: recipientLabels,
    });
    try {
      const submissions = selectedRecipients.map(() =>
        fetch('https://readdy.ai/api/form/d6sq1aih642up23iq1s0', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString(),
        })
      );
      await Promise.all(submissions);
      setQuoteSubmitted(true);
    } catch { /* silent */ } finally {
      setQuoteSubmitting(false);
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const generateQuotePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 15;

    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Classic Same Day Blinds', margin, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(167, 243, 208);
    doc.text('Quote / Wish List', margin, 29);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(dateStr, pageWidth - margin, 20, { align: 'right' });
    doc.text(`Ref: Q-${Date.now().toString().slice(-8)}`, pageWidth - margin, 29, { align: 'right' });
    y = 52;

    const hasCustomer = !!(quoteForm.firstName || quoteForm.email);
    const hasAddress = !!(quoteForm.address?.trim());
    const blockH = hasAddress ? 52 : 38;
    doc.setFillColor(240, 253, 244);
    doc.rect(margin, y, pageWidth - margin * 2, blockH, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.4);
    doc.rect(margin, y, pageWidth - margin * 2, blockH, 'S');

    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52);
    doc.text('PREPARED FOR', margin + 4, y + 7);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(hasCustomer ? `${quoteForm.firstName} ${quoteForm.lastName}`.trim() : '\u2014', margin + 4, y + 15);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(51, 65, 85);
    doc.text(quoteForm.email || '\u2014', margin + 4, y + 22);
    doc.text(quoteForm.phone || '\u2014', margin + 4, y + 29);

    const midX = pageWidth / 2 + 5;
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52);
    doc.text('COMPANY', midX, y + 7);
    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(15, 23, 42);
    doc.text(quoteForm.companyName || '\u2014', midX, y + 15);
    doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52);
    doc.text('DATE OF QUOTE', midX, y + 24);
    doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
    doc.text(`${dateStr}  ${timeStr}`, midX, y + 31);

    if (hasAddress) {
      const addressStr = [quoteForm.address, quoteForm.city, [quoteForm.state, quoteForm.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
      doc.setDrawColor(187, 247, 208); doc.setLineWidth(0.3);
      doc.line(margin + 4, y + 38, pageWidth - margin - 4, y + 38);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52);
      doc.text('DELIVERY ADDRESS', margin + 4, y + 44);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
      doc.text(addressStr, margin + 4, y + 50);
    }
    y += blockH + 9;

    doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(71, 85, 105);
    doc.text('ITEMS', margin, y);
    y += 5;
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    doc.setFontSize(8); doc.setTextColor(100, 116, 139); doc.setFont('helvetica', 'bold');
    const col = { name: margin + 2, size: margin + 72, color: margin + 110, qty: margin + 140, price: pageWidth - margin - 2 };
    doc.text('PRODUCT', col.name, y + 5);
    doc.text('SIZE', col.size, y + 5);
    doc.text('COLOR', col.color, y + 5);
    doc.text('QTY', col.qty, y + 5);
    doc.text('TOTAL', col.price, y + 5, { align: 'right' });
    y += 10;

    cart.forEach((item, i) => {
      if (i % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(margin, y - 1, pageWidth - margin * 2, item.mount ? 18 : 13, 'F'); }
      const name = item.name.length > 33 ? `${item.name.substring(0, 30)}...` : item.name;
      const sizeStr = item.width && item.height ? `${item.width}" \u00d7 ${item.height}"` : 'Not specified';
      const colorStr = item.color ? (item.color.length > 14 ? `${item.color.substring(0, 12)}\u2026` : item.color) : '\u2014';
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(30, 41, 59);
      doc.text(name, col.name, y + 5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(71, 85, 105);
      doc.text(sizeStr, col.size, y + 5);
      doc.text(colorStr, col.color, y + 5);
      doc.text(String(item.quantity), col.qty, y + 5);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
      doc.text(`$${(item.price * item.quantity).toFixed(2)}`, col.price, y + 5, { align: 'right' });
      if (item.mount) { doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(148, 163, 184); doc.text(`Mount: ${item.mount}`, col.name, y + 12); y += 18; }
      else { y += 14; }
    });

    y += 4;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;
    const tLabelX = pageWidth - 75; const tValX = pageWidth - margin - 2;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', tLabelX, y); doc.text(`$${subtotal.toFixed(2)}`, tValX, y, { align: 'right' }); y += 7;
    doc.text('Shipping:', tLabelX, y); doc.setTextColor(22, 163, 74); doc.text('FREE', tValX, y, { align: 'right' }); y += 7;
    doc.setTextColor(71, 85, 105); doc.text('Tax (8.25%):', tLabelX, y); doc.text(`$${tax.toFixed(2)}`, tValX, y, { align: 'right' }); y += 6;
    doc.setDrawColor(187, 247, 208); doc.setLineWidth(0.4); doc.line(tLabelX - 5, y, pageWidth - margin, y); y += 6;
    doc.setFillColor(240, 253, 244); doc.rect(tLabelX - 5, y - 3, pageWidth - margin - tLabelX + 5, 12, 'F');
    doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor(6, 78, 59);
    doc.text('Est. Total:', tLabelX, y + 5); doc.text(`$${total.toFixed(2)}`, tValX, y + 5, { align: 'right' });

    const footerY = doc.internal.pageSize.getHeight() - 22;
    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.2); doc.line(margin, footerY, pageWidth - margin, footerY);
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
    doc.text('Classic Same Day Blinds  \u00b7  lukethomas1721@gmail.com', margin, footerY + 7);
    doc.text('This is a quote / wish list \u2014 not a confirmed order.', pageWidth - margin, footerY + 7, { align: 'right' });
    doc.save('quote-classic-same-day-blinds.pdf');
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-checkbox-circle-fill text-green-600 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your order <span className="font-semibold text-gray-800">{orderId}</span> has been received. We\'ll send a confirmation to <strong>{form.email}</strong>.
          </p>
          <div className="flex flex-col gap-3">
            <Link to={`/track-order?id=${orderId}`}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-map-pin-line"></i> Track My Order
            </Link>
            <button onClick={generateQuotePDF}
              className="px-8 py-3 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2">
              <i className="ri-file-download-line"></i> Download Quote PDF
            </button>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line"></i>
                {language === 'es' ? 'Página Anterior' : 'Go Back'}
              </button>
              <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-store-2-line"></i>
                {language === 'es' ? 'Ver Productos' : 'Browse Products'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CHECKOUT SCREEN ───────────────────────────────────────────────────────
  if (showCheckout) {
    return (
      <CheckoutView
        cart={cart}
        form={form} setForm={setForm} formErrors={formErrors}
        deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
        pickupDetails={pickupDetails} setPickupDetails={setPickupDetails} pickupErrors={pickupErrors}
        showPromoInput={showPromoInput} setShowPromoInput={setShowPromoInput}
        promoCode={promoCode} setPromoCode={setPromoCode}
        promoLoading={promoLoading} promoError={promoError}
        appliedPromo={appliedPromo}
        subtotal={subtotal} promoDiscount={promoDiscount}
        pointsDiscount={pointsDiscount}
        appliedPoints={appliedPoints}
        onApplyPoints={handleApplyPoints}
        onRemovePoints={handleRemovePoints}
        tax={tax} total={total}
        isProcessing={isProcessing}
        processingError={processingError}
        handleApplyPromo={handleApplyPromo}
        handleRemovePromo={handleRemovePromo}
        handlePlaceOrder={handlePlaceOrder}
        onBackToCart={() => setShowCheckout(false)}
      />
    );
  }

  // ── CART SCREEN ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
              <div className="flex flex-col gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-0.5 rounded-full bg-green-700" style={{ width: `${14 - i * 2}px` }}></div>
                ))}
              </div>
              <span className="text-sm sm:text-xl font-bold text-gray-900 hidden sm:block">
                {language === 'es' ? 'Persianas Clásicas Mismo Día' : 'Classic Same Day Blinds'}
              </span>
            </Link>
            <h1 className="text-sm sm:text-base font-semibold text-gray-700 whitespace-nowrap">
              {language === 'es' ? 'Carrito' : 'Cart'}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {currentUser && (
                <Link to="/account" className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap border border-emerald-200">
                  <i className="ri-user-line"></i>
                  <span className="hidden sm:inline">{language === 'es' ? 'Mi Cuenta' : 'My Account'}</span>
                </Link>
              )}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="hidden sm:inline">{language === 'es' ? 'Volver' : 'Go Back'}</span>
              </button>
              <Link
                to="/products"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-store-2-line"></i>
                <span className="hidden sm:inline">{language === 'es' ? 'Ver Productos' : 'Products'}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 flex items-center justify-center bg-green-50 border-2 border-green-200 rounded-full mx-auto mb-6">
              <i className="ri-shopping-cart-line text-5xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {language === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              {language === 'es' ? 'Explora nuestra colección de persianas y cortinas personalizadas.' : 'Browse our collection of custom blinds and shades.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line"></i>
                {language === 'es' ? 'Página Anterior' : 'Go Back'}
              </button>
              <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-store-2-line"></i>
                {language === 'es' ? 'Ver Productos' : 'Browse Products'}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {cart.length} {language === 'es' ? `Art\u00edculo${cart.length !== 1 ? 's' : ''} en tu Carrito` : `Item${cart.length !== 1 ? 's' : ''} in Your Cart`}
                </h2>

                <BulkDiscountBanner totalItems={totalItems} bulkDiscount={bulkDiscountRate} language={language} />

                {/* Low stock banner */}
                {(() => {
                  const lowStockItems = cart.filter(item => {
                    const p = productCatalog.find(p => p.id === item.id);
                    return p && p.inventory !== undefined && p.inventory > 0 && p.inventory < 10;
                  });
                  if (lowStockItems.length === 0) return null;
                  return (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                      <div className="w-5 h-5 flex items-center justify-center mt-0.5 shrink-0">
                        <i className="ri-alarm-warning-fill text-amber-500 text-base"></i>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-amber-800">
                          {language === 'es' ? 'Artículos con existencia limitada en tu carrito' : 'Low-stock items in your cart'}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {language === 'es'
                            ? 'Estos artículos se están agotando. Finaliza tu pedido pronto para asegurarlos.'
                            : 'These items are almost gone. Complete your order soon to secure them.'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {cart.map((item) => {
                  const catalogProduct = productCatalog.find(p => p.id === item.id);
                  const isLowStock = catalogProduct && catalogProduct.inventory !== undefined && catalogProduct.inventory > 0 && catalogProduct.inventory < 10;
                  return (
                    <div key={item.id} className={`bg-white rounded-xl p-4 sm:p-5 border transition-colors ${isLowStock ? 'border-amber-200' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3 sm:gap-5">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-700 font-semibold uppercase mb-0.5">{item.category}</p>
                          <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                          {(item.color || item.mount) && (
                            <p className="text-xs text-gray-500 mb-1">
                              {item.color}{item.color && item.mount && ' · '}{item.mount}{item.width && item.height && ` · ${item.width}" × ${item.height}"`}
                            </p>
                          )}
                          {isLowStock && (
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                <i className="ri-alarm-warning-line text-amber-500 text-xs"></i>
                              </div>
                              <span className="text-xs font-semibold text-amber-600">
                                {language === 'es'
                                  ? `¡Solo quedan ${catalogProduct!.inventory}!`
                                  : `Only ${catalogProduct!.inventory} left!`}
                              </span>
                            </div>
                          )}
                          <div className="text-base sm:text-lg font-bold text-gray-900">{formatPrice(item.price, language)}</div>
                          <button
                            onClick={() => handleSaveForLater(item.id)}
                            className="mt-1 text-xs text-gray-400 hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <i className="ri-bookmark-line text-xs"></i>
                            {language === 'es' ? 'Guardar para después' : 'Save for later'}
                          </button>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg cursor-pointer">
                            <i className="ri-delete-bin-line text-base"></i>
                          </button>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                              <i className="ri-subtract-line text-gray-700 text-sm"></i>
                            </button>
                            <span className="text-sm font-bold text-gray-900 w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer">
                              <i className="ri-add-line text-gray-700 text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <SavedForLater
                  savedItems={savedItems}
                  language={language}
                  onMoveToCart={handleMoveToCart}
                  onRemove={handleRemoveSaved}
                />

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                  <i className="ri-truck-line text-lg"></i>
                  {language === 'es' ? '\u00a1Env\u00edo GRATIS en todos los pedidos!' : 'FREE shipping on every order!'}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 border border-gray-100 sticky top-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    {language === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
                  </h2>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <div className="font-semibold text-gray-900">{formatPrice(subtotal, language)}</div>
                    </div>
                    {bulkDiscountRate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700 flex items-center gap-1">
                          <i className="ri-stack-line text-xs"></i>
                          {language === 'es' ? `Desc. por cantidad (${(bulkDiscountRate * 100).toFixed(0)}%)` : `Bulk discount (${(bulkDiscountRate * 100).toFixed(0)}% off)`}
                        </span>
                        <span className="font-semibold text-green-700">-${bulkDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {appliedPromo && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Promo: {appliedPromo.code}</span>
                        <span className="font-semibold text-green-700">-${promoDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === 'es' ? 'Env\u00edo' : 'Shipping'}</span>
                      <span className="font-semibold text-emerald-600">{language === 'es' ? 'GRATIS' : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{language === 'es' ? 'Impuesto Estimado' : 'Estimated Tax'}</span>
                      <div className="font-semibold text-gray-900">{formatPrice(tax, language)}</div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">${total.toFixed(2)} <span className="text-sm font-normal text-gray-400">USD</span></div>
                        {language === 'es' && <div className="text-sm font-bold text-green-700">${(total * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</div>}
                      </div>
                    </div>
                    {pendingPoints > 0 && (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-1">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0">
                          <i className="ri-copper-coin-line text-emerald-600 text-sm"></i>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">
                          {language === 'es'
                            ? `Gana +${pendingPoints.toLocaleString()} pts con este pedido`
                            : `Earn +${pendingPoints.toLocaleString()} pts with this order`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Promo Code — always visible below order summary */}
                  <div className="border border-gray-100 rounded-xl p-4 mt-1">
                    <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                      <i className="ri-coupon-3-line text-green-700"></i>
                      {language === 'es' ? 'Código Promocional' : 'Promo Code'}
                    </p>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <i className="ri-check-circle-fill text-green-600 text-base"></i>
                          <div>
                            <span className="text-xs font-bold text-green-800">{appliedPromo.code}</span>
                            <span className="text-xs text-green-600 ml-1">— {Math.round(appliedPromo.discount * 100)}% off applied!</span>
                          </div>
                        </div>
                        <button onClick={handleRemovePromo} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer font-semibold">Remove</button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={e => setPromoCode(e.target.value.toUpperCase())}
                            onKeyDown={e => { if (e.key === 'Enter' && promoCode.trim()) handleApplyPromo(); }}
                            placeholder={language === 'es' ? 'Ej: SAVE10' : 'e.g. SAVE10'}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal"
                          />
                          <button
                            onClick={handleApplyPromo}
                            disabled={promoLoading || !promoCode.trim()}
                            className="px-4 py-2 bg-green-700 text-white text-sm font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {promoLoading ? <i className="ri-loader-4-line animate-spin"></i> : (language === 'es' ? 'Aplicar' : 'Apply')}
                          </button>
                        </div>
                        {promoError && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600">
                            <i className="ri-error-warning-line"></i>
                            {promoError}
                          </div>
                        )}
                        <p className="text-xs text-gray-400">Try: SAVE10, BLINDS15, WELCOME20</p>
                      </div>
                    )}
                  </div>

                  {/* Sales Rep Selector */}
                  <div className="border-2 border-green-100 rounded-xl p-4 mt-1 mb-3 bg-green-50/40">
                    <p className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                      <i className="ri-user-star-line text-green-700"></i>
                      Who helped you today?
                      <span className="font-normal text-gray-400">(optional)</span>
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {['Marisol', 'Kali', 'Holly', 'Charlotte', 'Eric'].map((name) => {
                        const selected = form.salesRep === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setForm({ ...form, salesRep: selected ? '' : name })}
                            className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all cursor-pointer ${
                              selected
                                ? 'border-green-600 bg-white'
                                : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50'
                            }`}
                          >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                              selected
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {selected ? <i className="ri-check-line text-xs"></i> : name.charAt(0)}
                            </div>
                            <span className={`text-xs font-semibold text-center leading-tight w-full truncate px-0.5 ${
                              selected
                                ? 'text-green-700'
                                : 'text-gray-500'
                            }`}>
                              {name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {form.salesRep && (
                      <p className="mt-2.5 text-xs text-green-700 font-semibold flex items-center gap-1.5">
                        <i className="ri-check-circle-fill text-sm"></i>
                        <span className="font-bold">{form.salesRep}</span> will be credited
                      </p>
                    )}
                  </div>

                  <button onClick={() => setShowCheckout(true)}
                    className="w-full py-4 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors mb-3 cursor-pointer whitespace-nowrap text-sm">
                    {language === 'es' ? 'Proceder al Pago' : 'Proceed to Checkout'}
                  </button>

                  {/* Affirm financing calculator */}
                  <CartAffirmCalculator total={total} language={language} />

                  {/* Payment trust badges */}
                  <div className="border border-gray-100 rounded-xl p-3 mb-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide text-center mb-2.5">
                      {language === 'es' ? 'Métodos de Pago Aceptados' : 'Accepted Payment Methods'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">VISA</span>
                      <span className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">MC</span>
                      <span className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">AMEX</span>
                      <span className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-600 tracking-wide whitespace-nowrap">DISCOVER</span>
                      <span className="px-2.5 py-1.5 bg-[#635bff] border border-[#635bff] rounded-md text-xs font-bold text-white tracking-wide whitespace-nowrap">stripe</span>
                      <span className="px-2.5 py-1.5 bg-[#0fa0ea] border border-[#0fa0ea] rounded-md text-xs font-black text-white tracking-tight whitespace-nowrap">affirm</span>
                    </div>
                  </div>

                  <button onClick={() => { setShowQuoteModal(true); setQuoteSubmitted(false); }}
                    className="w-full py-3 border-2 border-amber-400 text-amber-700 font-bold rounded-lg hover:bg-amber-50 transition-colors mb-3 cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2">
                    <i className="ri-mail-send-line text-base"></i>
                    Send as Quote / Wish List
                  </button>

                  <button onClick={() => { setShowQuoteModal(true); setQuoteSubmitted(false); }}
                    className="w-full py-3 border-2 border-emerald-300 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors mb-3 cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2">
                    <i className="ri-file-download-line text-base"></i>
                    Download Quote PDF
                  </button>

                  <Link to={lastViewedProduct} className="block text-center text-sm text-gray-500 hover:text-green-700 transition-colors cursor-pointer whitespace-nowrap">
                    {language === 'es' ? '\u2190 Seguir Comprando' : '\u2190 Continue Shopping'}
                  </Link>

                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    {[
                      { icon: 'ri-shield-check-line', en: '3-Year Warranty Included', es: 'Garant\u00eda de 3 A\u00f1os Incluida' },
                      { icon: 'ri-lock-line', en: 'Secure Checkout', es: 'Pago Seguro' },
                      { icon: 'ri-refresh-line', en: '30-Day Returns', es: 'Devoluciones en 30 D\u00edas' },
                    ].map((b) => (
                      <div key={b.en} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-4 h-4 flex items-center justify-center text-green-700 shrink-0"><i className={b.icon}></i></div>
                        {language === 'es' ? b.es : b.en}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <CartRecommendations cart={cart} language={language} onAddToCart={handleAddRecommendedToCart} />
            <RecentlyViewedInCart cart={cart} language={language} onAddToCart={handleAddRecommendedToCart} />
          </>
        )}

        {/* ── QUOTE MODAL ─────────────────────────────────────────────────── */}
        {showQuoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-xl shrink-0">
                    <i className="ri-mail-send-line text-amber-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Send Quote / Wish List</h3>
                    <p className="text-xs text-gray-500">We'll email you a full breakdown of your selections</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>

              {quoteSubmitted ? (
                /* Success state */
                <div className="px-6 py-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-checkbox-circle-fill text-green-600 text-3xl"></i>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Quote Sent!</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    We've received your quote request and will follow up at <strong>{quoteForm.email}</strong> shortly.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={generateQuotePDF}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-sm font-bold rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-file-download-line"></i> Download PDF
                    </button>
                    <button
                      onClick={() => setShowQuoteModal(false)}
                      className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Form */
                <div className="px-6 py-5 space-y-4">
                  {/* Cart summary */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items in this quote</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 truncate max-w-[70%]">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                          <span className="font-semibold text-gray-900 shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm font-bold text-gray-900">
                      <span>Estimated Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Recipient selector */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <i className="ri-send-plane-line text-amber-500"></i>
                      Send quote to
                    </p>
                    <div className="space-y-2">
                      {QUOTE_RECIPIENTS.map(recipient => {
                        const checked = selectedRecipients.includes(recipient.id);
                        return (
                          <button
                            key={recipient.id}
                            type="button"
                            onClick={() => toggleRecipient(recipient.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer text-left ${checked ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                          >
                            <div className={`w-5 h-5 flex items-center justify-center rounded border-2 shrink-0 transition-all ${checked ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                              {checked && <i className="ri-check-line text-white text-xs"></i>}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold ${checked ? 'text-amber-800' : 'text-gray-700'}`}>{recipient.label}</p>
                              <p className={`text-xs truncate ${checked ? 'text-amber-600' : 'text-gray-400'}`}>{recipient.email}</p>
                            </div>
                            {checked && (
                              <div className="ml-auto shrink-0">
                                <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">Selected</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selectedRecipients.length === 0 && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        Select at least one recipient
                      </p>
                    )}
                  </div>

                  {/* Contact fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">First Name *</label>
                      <input
                        type="text"
                        value={quoteForm.firstName}
                        onChange={e => setQuoteForm({ ...quoteForm, firstName: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${quoteErrors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="John"
                      />
                      {quoteErrors.firstName && <p className="text-xs text-red-500 mt-0.5">{quoteErrors.firstName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Last Name *</label>
                      <input
                        type="text"
                        value={quoteForm.lastName}
                        onChange={e => setQuoteForm({ ...quoteForm, lastName: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${quoteErrors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="Smith"
                      />
                      {quoteErrors.lastName && <p className="text-xs text-red-500 mt-0.5">{quoteErrors.lastName}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={quoteForm.email}
                        onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${quoteErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="john@example.com"
                      />
                      {quoteErrors.email && <p className="text-xs text-red-500 mt-0.5">{quoteErrors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone *</label>
                      <input
                        type="tel"
                        value={quoteForm.phone}
                        onChange={e => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${quoteErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="(555) 000-0000"
                      />
                      {quoteErrors.phone && <p className="text-xs text-red-500 mt-0.5">{quoteErrors.phone}</p>}
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Company <span className="font-normal text-gray-400">(optional)</span></label>
                      <input
                        type="text"
                        value={quoteForm.companyName}
                        onChange={e => setQuoteForm({ ...quoteForm, companyName: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Acme Property Management"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes <span className="font-normal text-gray-400">(optional)</span></label>
                      <textarea
                        value={quoteForm.notes}
                        onChange={e => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                        rows={2}
                        maxLength={500}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        placeholder="Any special requirements or questions..."
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleSendQuote}
                      disabled={quoteSubmitting || selectedRecipients.length === 0}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {quoteSubmitting ? (
                        <><i className="ri-loader-4-line animate-spin"></i> Sending...</>
                      ) : (
                        <><i className="ri-mail-send-line"></i> Send to {selectedRecipients.length === 2 ? 'Both' : selectedRecipients.length === 1 ? '1 Recipient' : '...'}</>
                      )}
                    </button>
                    <button
                      onClick={generateQuotePDF}
                      className="flex items-center gap-2 px-4 py-3 border-2 border-emerald-300 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer whitespace-nowrap text-sm"
                    >
                      <i className="ri-file-download-line"></i> PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
