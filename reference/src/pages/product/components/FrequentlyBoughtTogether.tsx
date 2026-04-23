import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products as productCatalog } from '../../../mocks/products';

interface Product {
  id: number;
  name: string;
  nameEs?: string;
  price: number;
  originalPrice: number;
  rating: number;
  category: string;
  badge?: string;
  inventory?: number;
  image: string;
}

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  language: string;
}

const complementaryMap: Record<string, string[]> = {
  'mini-blinds': ['aluminum-blinds', 'roller-shades'],
  'aluminum-blinds': ['mini-blinds', 'vertical-blinds'],
  'roller-shades': ['cellular-shades', 'roman-shades'],
  'vertical-blinds': ['roller-shades', 'aluminum-blinds'],
  'cellular-shades': ['roller-shades', 'roman-shades'],
  'roman-shades': ['cellular-shades', 'roller-shades'],
  'motorized': ['roller-shades', 'cellular-shades'],
  'wood-blinds': ['roller-shades', 'roman-shades'],
};

const TAX_RATE = 0.0825;
const MXN_RATE = 17.5;

export default function FrequentlyBoughtTogether({ currentProduct, language }: FrequentlyBoughtTogetherProps) {
  const targetCategories = complementaryMap[currentProduct.category] ?? [];

  const complementary = targetCategories
    .map((cat) => productCatalog.find((p) => p.category === cat && p.id !== currentProduct.id))
    .filter((p): p is typeof productCatalog[0] => p !== undefined)
    .slice(0, 2);

  const [checked, setChecked] = useState<Set<number>>(
    new Set([currentProduct.id, ...complementary.map((p) => p.id)])
  );
  const [addedToCart, setAddedToCart] = useState(false);

  if (complementary.length === 0) return null;

  const allProducts: Product[] = [currentProduct, ...complementary];
  const selectedProducts = allProducts.filter((p) => checked.has(p.id));
  const bundleTotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleTax = bundleTotal * TAX_RATE;

  const toggleProduct = (id: number) => {
    if (id === currentProduct.id) return; // current product always included
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddBundle = () => {
    const existing = JSON.parse(localStorage.getItem('cart') ?? '[]');
    selectedProducts.forEach((product) => {
      const idx = existing.findIndex((item: { id: number }) => item.id === product.id);
      if (idx >= 0) {
        existing[idx].quantity += 1;
      } else {
        existing.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          color: 'White',
          mount: 'Inside Mount',
          width: '24"',
          height: '36"',
          quantity: 1,
        });
      }
    });
    localStorage.setItem('cart', JSON.stringify(existing));
    localStorage.setItem('cart_updated_at', Date.now().toString());
    window.dispatchEvent(new CustomEvent('cart-updated'));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        {language === 'es' ? 'Frecuentemente Comprados Juntos' : 'Frequently Bought Together'}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {language === 'es'
          ? 'Los clientes que vieron este producto también compraron'
          : 'Customers who viewed this item also purchased'}
      </p>

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
        {/* Products row */}
        <div className="flex items-start gap-3 flex-wrap mb-6">
          {allProducts.map((product, index) => {
            const isSelected = checked.has(product.id);
            const isCurrent = product.id === currentProduct.id;
            const displayName = language === 'es' ? ((product as any).nameEs ?? product.name) : product.name;

            return (
              <div key={product.id} className="flex items-center gap-3">
                {/* Product card */}
                <div
                  className={`relative bg-white rounded-xl border-2 transition-all ${
                    isSelected ? 'border-green-500' : 'border-gray-200 opacity-50'
                  } overflow-hidden cursor-pointer`}
                  style={{ width: '140px' }}
                  onClick={() => toggleProduct(product.id)}
                >
                  {/* Checkbox */}
                  <div className={`absolute top-2 left-2 z-10 w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all ${
                    isSelected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                  </div>
                  {isCurrent && (
                    <div className="absolute top-2 right-2 z-10 bg-green-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {language === 'es' ? 'Este' : 'This'}
                    </div>
                  )}
                  <div className="w-full h-28 overflow-hidden bg-gray-50">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{displayName}</p>
                    <p className="text-sm font-bold text-green-700">${product.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Plus sign between products */}
                {index < allProducts.length - 1 && (
                  <div className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shrink-0 text-gray-400 font-bold text-lg">
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bundle summary + CTA */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-gray-200">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-500">
                {language === 'es' ? 'Total del paquete' : 'Bundle total'}:
              </span>
              <span className="text-2xl font-bold text-gray-900">${bundleTotal.toFixed(2)}</span>
              <span className="text-xs text-gray-400">
                +${bundleTax.toFixed(2)} {language === 'es' ? 'imp.' : 'tax'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {checked.size} {language === 'es' ? 'artículo(s) seleccionado(s)' : 'item(s) selected'} ·{' '}
              {language === 'es' ? 'Ajusta la selección arriba' : 'Adjust selection above'}
            </p>
            {language === 'es' && (
              <p className="text-xs font-semibold text-green-700 mt-0.5">
                ${(bundleTotal * MXN_RATE).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={handleAddBundle}
              disabled={checked.size === 0 || addedToCart}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
                addedToCart
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-green-700 text-white hover:bg-green-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedToCart ? (
                <><i className="ri-check-double-line text-base"></i> {language === 'es' ? '¡Paquete agregado!' : 'Bundle added!'}</>
              ) : (
                <><i className="ri-shopping-cart-line text-base"></i> {language === 'es' ? `Agregar ${checked.size} al carrito` : `Add ${checked.size} to cart`}</>
              )}
            </button>
            <Link
              to="/cart"
              className="text-xs text-green-700 hover:text-green-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <i className="ri-shopping-cart-2-line"></i>
              {language === 'es' ? 'Ver carrito' : 'View cart'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
