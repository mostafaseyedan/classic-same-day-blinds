import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../../../mocks/products';
import { useLanguage } from '../../../contexts/LanguageContext';

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export default function SearchDropdown({ isOpen, onClose, searchQuery }: SearchDropdownProps) {
  const [filteredProducts, setFilteredProducts] = useState<typeof products>([]);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase();
      const results = products.filter((product) => {
        const name = language === 'es' ? product.nameEs : product.name;
        const description = language === 'es' ? product.descriptionEs : product.description;
        return (
          name.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      });
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { en: string; es: string }> = {
      'wood-blinds': { en: 'Wood Blinds', es: 'Persianas de Madera' },
      'roller-shades': { en: 'Roller Shades', es: 'Cortinas Roller' },
      'cellular-shades': { en: 'Cellular Shades', es: 'Cortinas Celulares' },
      'roman-shades': { en: 'Roman Shades', es: 'Cortinas Romanas' },
      'motorized': { en: 'Motorized', es: 'Motorizadas' },
    };
    return language === 'es' ? categoryMap[category]?.es || category : categoryMap[category]?.en || category;
  };

  if (!isOpen || searchQuery.length < 2) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50"
    >
      {filteredProducts.length > 0 ? (
        <div className="py-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <img
                src={product.image}
                alt={language === 'es' ? product.nameEs : product.name}
                className="w-16 h-16 object-cover rounded-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {language === 'es' ? product.nameEs : product.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{getCategoryLabel(product.category)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-green-700">
                    {language === 'es' ? `$${product.price.toFixed(2)} MXN` : `$${product.price.toFixed(2)}`}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      {language === 'es' ? `$${product.originalPrice.toFixed(2)} MXN` : `$${product.originalPrice.toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>
              <i className="ri-arrow-right-line text-gray-400 text-lg shrink-0"></i>
            </button>
          ))}
        </div>
      ) : (
        <div className="py-8 px-4 text-center">
          <i className="ri-search-line text-4xl text-gray-300 mb-2"></i>
          <p className="text-sm text-gray-500">
            {language === 'es' ? 'No se encontraron resultados' : 'No results found'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'es' ? 'Intenta con otras palabras clave' : 'Try different keywords'}
          </p>
        </div>
      )}
    </div>
  );
}