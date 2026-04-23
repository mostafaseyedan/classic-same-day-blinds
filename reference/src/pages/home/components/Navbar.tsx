import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import SearchDropdown from './SearchDropdown';
import { getWishlistIds, WISHLIST_EVENT } from '../../../utils/wishlist';

interface NavbarProps {
  scrolled: boolean;
}

const megaMenus: Record<string, { heading: string; items: string[] }[]> = {
  'All Products': [
    { heading: 'Blinds', items: ['Wood Blinds', 'Faux Wood Blinds', 'Aluminum Blinds', 'Vertical Blinds', 'Mini Blinds'] },
    { heading: 'Shades', items: ['Roller Shades', 'Cellular Shades', 'Roman Shades', 'Solar Shades', 'Woven Wood Shades', 'Sheer Shades'] },
    { heading: 'Shutters & Drapes', items: ['Plantation Shutters', 'Drapes & Curtains', 'Valances'] },
    { heading: 'Specialty', items: ['Motorized Blinds', 'Outdoor Shades', 'Skylight Shades', 'Arched Window Treatments'] },
  ],
  'Blinds': [
    { heading: 'Wood Blinds', items: ['Real Wood Blinds', 'Stained Wood Blinds', 'Painted Wood Blinds'] },
    { heading: 'Faux Wood', items: ['Faux Wood Blinds', 'Moisture-Resistant', 'Cordless Faux Wood'] },
    { heading: 'Other Blinds', items: ['Aluminum Blinds', 'Vertical Blinds', 'Mini Blinds', 'Panel Track Blinds'] },
    { heading: 'By Feature', items: ['Cordless Blinds', 'Motorized Blinds', 'Blackout Blinds', 'Light Filtering'] },
  ],
  'Shades': [
    { heading: 'Roller & Solar', items: ['Roller Shades', 'Solar Shades', 'Blackout Roller Shades'] },
    { heading: 'Cellular', items: ['Single Cell Shades', 'Double Cell Shades', 'Cordless Cellular'] },
    { heading: 'Roman & Woven', items: ['Roman Shades', 'Woven Wood Shades', 'Bamboo Shades'] },
    { heading: 'Sheer & Specialty', items: ['Sheer Shades', 'Transitional Shades', 'Skylight Shades'] },
  ],
  'Shutters': [
    { heading: 'Plantation Shutters', items: ['Wood Shutters', 'Composite Shutters', 'Vinyl Shutters'] },
    { heading: 'By Style', items: ['Full Height', 'Café Style', 'Tier on Tier', 'Shaped Shutters'] },
    { heading: 'By Room', items: ['Living Room', 'Bedroom', 'Bathroom', 'Kitchen'] },
    { heading: 'Features', items: ['Motorized Shutters', 'Custom Color', 'Hidden Tilt Rod'] },
  ],
  'Drapes': [
    { heading: 'Drapes & Curtains', items: ['Blackout Drapes', 'Sheer Curtains', 'Linen Drapes', 'Velvet Drapes'] },
    { heading: 'Hardware', items: ['Curtain Rods', 'Finials', 'Rings & Clips', 'Holdbacks'] },
    { heading: 'By Style', items: ['Grommet Top', 'Rod Pocket', 'Pinch Pleat', 'Tab Top'] },
    { heading: 'Valances', items: ['Box Pleat Valances', 'Rod Pocket Valances', 'Scalloped Valances'] },
  ],
  'Shop By': [
    { heading: 'By Room', items: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Home Office', 'Nursery'] },
    { heading: 'By Feature', items: ['Motorized', 'Cordless', 'Blackout', 'Light Filtering', 'Energy Efficient'] },
    { heading: 'By Style', items: ['Modern', 'Traditional', 'Farmhouse', 'Coastal', 'Minimalist'] },
    { heading: 'By Brand', items: ['Bali', 'Levolor', 'Veneta', 'SouthSeas', 'Coolaroo'] },
  ],
  'Motorized': [
    { heading: 'Motorized Blinds', items: ['Motorized Wood Blinds', 'Motorized Faux Wood', 'Motorized Aluminum'] },
    { heading: 'Motorized Shades', items: ['Motorized Roller Shades', 'Motorized Cellular', 'Motorized Roman'] },
    { heading: 'Smart Home', items: ['Alexa Compatible', 'Google Home', 'SmartThings', 'Z-Wave'] },
    { heading: 'Accessories', items: ['Remote Controls', 'Charging Cables', 'Hub & Bridge', 'Wall Switches'] },
  ],
  'Commercial': [
    { heading: 'Commercial Blinds', items: ['Office Blinds', 'Hotel Blinds', 'Healthcare', 'Education'] },
    { heading: 'Bulk Orders', items: ['Bulk Pricing', 'Property Managers', 'Contractors', 'Hospitality'] },
    { heading: 'Services', items: ['Commercial Design Help', 'Measurement Service', 'Installation', 'Account Manager'] },
    { heading: 'Resources', items: ['Commercial Catalog', 'Sample Program', 'Project Quotes', 'Contact Sales'] },
  ],
};

const megaMenusEs: Record<string, { heading: string; items: string[] }[]> = {
  'All Products': [
    { heading: 'Persianas', items: ['Persianas de Madera', 'Persianas de Madera Sintética', 'Persianas de Aluminio', 'Persianas Verticales', 'Mini Persianas'] },
    { heading: 'Cortinas', items: ['Cortinas Roller', 'Cortinas Celulares', 'Cortinas Romanas', 'Cortinas Solares', 'Cortinas de Madera Tejida', 'Cortinas Traslúcidas'] },
    { heading: 'Postigos y Cortinajes', items: ['Postigos de Plantación', 'Cortinajes y Cortinas', 'Cenefas'] },
    { heading: 'Especialidad', items: ['Persianas Motorizadas', 'Cortinas Exteriores', 'Cortinas para Tragaluces', 'Tratamientos para Ventanas en Arco'] },
  ],
  'Blinds': [
    { heading: 'Persianas de Madera', items: ['Persianas de Madera Real', 'Persianas de Madera Teñida', 'Persianas de Madera Pintada'] },
    { heading: 'Madera Sintética', items: ['Persianas de Madera Sintética', 'Resistente a la Humedad', 'Madera Sintética sin Cordón'] },
    { heading: 'Otras Persianas', items: ['Persianas de Aluminio', 'Persianas Verticales', 'Mini Persianas', 'Persianas de Panel Deslizante'] },
    { heading: 'Por Característica', items: ['Persianas sin Cordón', 'Persianas Motorizadas', 'Persianas Blackout', 'Filtrado de Luz'] },
  ],
  'Shades': [
    { heading: 'Roller y Solar', items: ['Cortinas Roller', 'Cortinas Solares', 'Cortinas Roller Blackout'] },
    { heading: 'Celulares', items: ['Cortinas de Celda Simple', 'Cortinas de Celda Doble', 'Celulares sin Cordón'] },
    { heading: 'Romanas y Tejidas', items: ['Cortinas Romanas', 'Cortinas de Madera Tejida', 'Cortinas de Bambú'] },
    { heading: 'Traslúcidas y Especiales', items: ['Cortinas Traslúcidas', 'Cortinas de Transición', 'Cortinas para Tragaluces'] },
  ],
  'Shutters': [
    { heading: 'Postigos de Plantación', items: ['Postigos de Madera', 'Postigos Compuestos', 'Postigos de Vinilo'] },
    { heading: 'Por Estilo', items: ['Altura Completa', 'Estilo Café', 'Nivel sobre Nivel', 'Postigos con Forma'] },
    { heading: 'Por Habitación', items: ['Sala de Estar', 'Dormitorio', 'Baño', 'Cocina'] },
    { heading: 'Características', items: ['Postigos Motorizados', 'Color Personalizado', 'Barra de Inclinación Oculta'] },
  ],
  'Drapes': [
    { heading: 'Cortinajes y Cortinas', items: ['Cortinajes Blackout', 'Cortinas Traslúcidas', 'Cortinajes de Lino', 'Cortinajes de Terciopelo'] },
    { heading: 'Herrajes', items: ['Barras para Cortinas', 'Remates', 'Anillas y Clips', 'Abrazaderas'] },
    { heading: 'Por Estilo', items: ['Ojal Superior', 'Bolsillo para Barra', 'Pliegue Pinzado', 'Trabilla Superior'] },
    { heading: 'Cenefas', items: ['Cenefas de Pliegue en Caja', 'Cenefas de Bolsillo para Barra', 'Cenefas con Festón'] },
  ],
  'Shop By': [
    { heading: 'Por Habitación', items: ['Sala de Estar', 'Dormitorio', 'Cocina', 'Baño', 'Oficina en Casa', 'Cuarto de Bebé'] },
    { heading: 'Por Característica', items: ['Motorizado', 'Sin Cordón', 'Blackout', 'Filtrado de Luz', 'Eficiencia Energética'] },
    { heading: 'Por Estilo', items: ['Moderno', 'Tradicional', 'Rústico', 'Costero', 'Minimalista'] },
    { heading: 'Por Marca', items: ['Bali', 'Levolor', 'Veneta', 'SouthSeas', 'Coolaroo'] },
  ],
  'Motorized': [
    { heading: 'Persianas Motorizadas', items: ['Persianas de Madera Motorizadas', 'Madera Sintética Motorizada', 'Aluminio Motorizado'] },
    { heading: 'Cortinas Motorizadas', items: ['Cortinas Roller Motorizadas', 'Celulares Motorizados', 'Romanas Motorizadas'] },
    { heading: 'Hogar Inteligente', items: ['Compatible con Alexa', 'Google Home', 'SmartThings', 'Z-Wave'] },
    { heading: 'Accesorios', items: ['Controles Remotos', 'Cables de Carga', 'Hub y Bridge', 'Interruptores de Pared'] },
  ],
  'Commercial': [
    { heading: 'Persianas Comerciales', items: ['Persianas para Oficina', 'Persianas para Hotel', 'Salud', 'Educación'] },
    { heading: 'Pedidos al Por Mayor', items: ['Precios al Por Mayor', 'Administradores de Propiedades', 'Contratistas', 'Hospitalidad'] },
    { heading: 'Servicios', items: ['Ayuda de Diseño Comercial', 'Servicio de Medición', 'Instalación', 'Gerente de Cuenta'] },
    { heading: 'Recursos', items: ['Catálogo Comercial', 'Programa de Muestras', 'Cotizaciones de Proyectos', 'Contactar Ventas'] },
  ],
};

const topNavItemsEs = [
  { label: 'Todos los Productos', id: 'products', menuKey: 'All Products' },
  { label: 'Persianas', id: 'products', menuKey: 'Blinds' },
  { label: 'Cortinas', id: 'products', menuKey: 'Shades' },
  { label: 'Postigos', id: 'products', menuKey: 'Shutters' },
  { label: 'Cortinajes', id: 'products', menuKey: 'Drapes' },
  { label: 'Comprar Por', id: 'categories', menuKey: 'Shop By' },
  { label: 'Motorizado', id: 'features', menuKey: 'Motorized' },
  { label: 'Comercial', id: 'about', menuKey: 'Commercial' },
  { label: 'Membresía', id: 'membership', href: '/membership', menuKey: 'Membership' },
  { label: 'Conferencias', id: 'conferences', href: '/conferences', menuKey: 'Conferences' },
];

export default function Navbar({ scrolled }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { currentUser, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
      setActiveMenu(null);
    }
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (megaMenus[label]) setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleSignOut = () => {
    logout();
    setAccountDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setSearchOpen(false);
      setMobileSearchOpen(false);
      // Keep search open to show results
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim().length >= 2) {
      setSearchOpen(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const readCartCount = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('cart') ?? '[]');
      const total = stored.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    const updateWishlist = () => setWishlistCount(getWishlistIds().length);
    updateWishlist();
    window.addEventListener(WISHLIST_EVENT, updateWishlist);

    readCartCount();
    window.addEventListener('cart-updated', readCartCount);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('cart-updated', readCartCount);
      window.removeEventListener(WISHLIST_EVENT, updateWishlist);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const topNavItems = [
    { label: 'All Products', id: 'products', menuKey: 'All Products' },
    { label: 'Blinds', id: 'products', menuKey: 'Blinds' },
    { label: 'Shades', id: 'products', menuKey: 'Shades' },
    { label: 'Shutters', id: 'products', menuKey: 'Shutters' },
    { label: 'Drapes', id: 'products', menuKey: 'Drapes' },
    { label: 'Shop By', id: 'categories', menuKey: 'Shop By' },
    { label: 'Motorized', id: 'features', menuKey: 'Motorized' },
    { label: 'Commercial', id: 'about', menuKey: 'Commercial' },
    { label: 'Membership', id: 'membership', href: '/membership', menuKey: 'Membership' },
    { label: 'Conferences', id: 'conferences', href: '/conferences', menuKey: 'Conferences' },
  ];

  const activeNavItems = language === 'es' ? topNavItemsEs : topNavItems;
  const activeMegaMenus = language === 'es' ? megaMenusEs : megaMenus;

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-700 text-white py-2 px-4">
        <div className="flex items-center justify-center overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-3 sm:gap-6 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <i className="ri-home-heart-line text-base sm:text-xl shrink-0"></i>
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                {language === 'en' ? 'Family Owned' : 'Negocio Familiar'}
              </span>
            </div>
            <span className="text-green-400 font-bold hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <i className="ri-truck-line text-base sm:text-xl shrink-0"></i>
              <span className="text-xs sm:text-sm font-black tracking-wide uppercase">
                {language === 'en' ? 'Free Shipping' : 'Envío Gratis'}
              </span>
            </div>
            <span className="text-green-400 font-bold hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <i className="ri-scissors-cut-line text-xl shrink-0"></i>
              <span className="text-sm font-black tracking-wide uppercase">
                {language === 'en' ? 'Custom Made to Order' : 'Hecho a Medida'}
              </span>
            </div>
            <span className="text-green-400 font-bold hidden lg:inline">|</span>
            <div className="hidden lg:flex items-center gap-1.5">
              <i className="ri-building-2-line text-xl shrink-0"></i>
              <span className="text-sm font-black tracking-wide uppercase">
                {language === 'en' ? 'Hospitality-Grade Quality' : 'Calidad Hotelera'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier 1: Utility bar ── */}
      <div className="fixed top-[2.25rem] sm:top-[2.75rem] left-0 right-0 z-50 bg-gray-900 text-white text-xs py-1.5 px-4 flex items-center justify-end">
        <div className="flex items-center gap-3 text-gray-300">
          <Link to="/track-order" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-map-pin-line mr-1"></i>
            {language === 'en' ? 'Track Order' : 'Rastrear Pedido'}
          </Link>
          <span className="text-gray-600">|</span>
          <Link to="/free-sample" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer">
            {language === 'es' ? 'Muestra Gratis' : 'Free Sample'}
          </Link>
          <span className="hidden md:inline text-gray-600">|</span>
          <Link to="/how-to-measure" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer hidden md:inline">
            {language === 'en' ? 'How to Measure' : 'Cómo Medir'}
          </Link>
          <span className="hidden md:inline text-gray-600">|</span>
          <Link to="/room-visualizer" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer hidden md:inline">
            {language === 'en' ? 'Room Visualizer' : 'Visualizador'}
          </Link>
          <span className="hidden md:inline text-gray-600">|</span>
          <a href="#" rel="nofollow" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer hidden md:inline">
            {language === 'en' ? 'Trade Program' : 'Programa Comercial'}
          </a>
          <span className="hidden md:inline text-gray-600">|</span>
          <a href="tel:18005051905" className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer font-medium">
            <i className="ri-phone-line mr-1"></i>1-800-505-1905
          </a>
          <span className="text-gray-600">|</span>
          <button onClick={() => scrollToSection('contact')} className="hover:text-green-400 transition-colors whitespace-nowrap cursor-pointer">
            {language === 'en' ? 'Live Chat' : 'Chat en Vivo'}
          </button>
        </div>
      </div>

      {/* ── Tier 2: Logo / Search / Actions ── */}
      <div className={`fixed top-[calc(2.25rem+1.75rem)] sm:top-[calc(2.75rem+1.75rem)] left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-white'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer shrink-0">
              <div className="flex flex-col gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-0.5 rounded-full bg-green-700" style={{ width: `${14 - i * 2}px` }}></div>
                ))}
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 leading-tight">
                {language === 'en' ? (
                  <>Classic Same Day<br /><span className="text-green-700">Blinds</span></>
                ) : (
                  <>Persianas Clásicas<br /><span className="text-green-700">Mismo Día</span></>
                )}
                <span className="block text-xs font-normal text-gray-500 tracking-wide">
                  {language === 'en' ? 'since 1994' : 'desde 1994'}
                </span>
              </span>
            </Link>

            {/* Search bar - Desktop */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={language === 'en' ? 'Search blinds, shades, shutters...' : 'Buscar persianas, cortinas, postigos...'}
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
                <button 
                  type="button"
                  onClick={handleSearchIconClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 cursor-pointer"
                >
                  <i className="ri-search-line text-base"></i>
                </button>
              </form>
              <SearchDropdown 
                isOpen={searchOpen} 
                onClose={handleSearchClose} 
                searchQuery={searchQuery} 
              />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden flex flex-col items-center text-gray-600 hover:text-green-700 transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-search-line text-lg"></i>
                </div>
                <span className="text-xs leading-none mt-0.5">
                  {language === 'en' ? 'Search' : 'Buscar'}
                </span>
              </button>
              
              <button
                onClick={() => scrollToSection('products')}
                className="hidden md:block px-3 py-1.5 bg-green-700 text-white text-xs font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                {language === 'en' ? 'Free Samples' : 'Muestras Gratis'}
              </button>
              {/* Account - Desktop */}
              <div ref={accountRef} className="hidden md:block relative">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                      className="flex flex-col items-center text-gray-600 hover:text-green-700 transition-colors cursor-pointer"
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className="ri-user-line text-lg"></i>
                      </div>
                      <span className="text-xs leading-none mt-0.5">Hi, {getFirstName(currentUser.name)}</span>
                    </button>
                    {accountDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link
                          to="/account"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors cursor-pointer"
                        >
                          <i className="ri-user-line mr-2"></i>
                          {language === 'en' ? 'My Account' : 'Mi Cuenta'}
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-colors cursor-pointer"
                        >
                          <i className="ri-logout-box-line mr-2"></i>
                          {language === 'en' ? 'Sign Out' : 'Cerrar Sesión'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link to="/auth" className="flex flex-col items-center text-gray-600 hover:text-green-700 transition-colors cursor-pointer">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-lg"></i>
                    </div>
                    <span className="text-xs leading-none mt-0.5">
                      {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                    </span>
                  </Link>
                )}
              </div>
              {/* Wishlist */}
              <Link to="/wishlist" className="flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors cursor-pointer relative">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <i className="ri-heart-line text-lg"></i>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-xs leading-none mt-0.5">
                  {language === 'es' ? 'Favoritos' : 'Wishlist'}
                </span>
              </Link>
              {/* Cart */}
              <Link to="/cart" className="flex flex-col items-center text-gray-600 hover:text-green-700 transition-colors cursor-pointer relative">
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <i className="ri-shopping-cart-line text-lg"></i>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-green-700 text-white text-[10px] font-bold rounded-full px-1 leading-none">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs leading-none mt-0.5">
                  {language === 'en' ? 'Cart' : 'Carrito'}
                </span>
              </Link>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center cursor-pointer text-gray-900"
              >
                <i className={`${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={language === 'en' ? 'Search blinds, shades, shutters...' : 'Buscar persianas, cortinas, postigos...'}
                  className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={handleSearchIconClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700 cursor-pointer"
                >
                  <i className="ri-search-line text-base"></i>
                </button>
              </form>
              <SearchDropdown 
                isOpen={searchOpen} 
                onClose={handleSearchClose} 
                searchQuery={searchQuery} 
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Tier 3: Category mega-nav ── */}
      <div
        ref={menuRef}
        className="fixed top-[calc(2.25rem+1.75rem+3.5rem)] sm:top-[calc(2.75rem+1.75rem+3.5rem)] left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm hidden md:block"
        onMouseLeave={handleMouseLeave}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-0">
            {activeNavItems.map((item) => (
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="px-3 py-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 text-gray-700 hover:text-green-700 border-transparent"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onMouseEnter={() => handleMouseEnter(item.menuKey)}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                    activeMenu === item.menuKey
                      ? 'text-green-700 border-green-700'
                      : 'text-gray-700 hover:text-green-700 border-transparent'
                  }`}
                >
                  {item.label}
                  {activeMegaMenus[item.menuKey] && (
                    <i className="ri-arrow-down-s-line ml-0.5 text-xs"></i>
                  )}
                </button>
              )
            ))}
            <div className="ml-auto flex items-center gap-4 py-2">
              <button onClick={() => scrollToSection('about')} className="text-xs text-gray-500 hover:text-green-700 cursor-pointer whitespace-nowrap">
                {language === 'en' ? 'About Us' : 'Nosotros'}
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-xs text-gray-500 hover:text-green-700 cursor-pointer whitespace-nowrap">FAQ</button>
              <button onClick={() => scrollToSection('contact')} className="text-xs text-gray-500 hover:text-green-700 cursor-pointer whitespace-nowrap">
                {language === 'en' ? 'Contact' : 'Contacto'}
              </button>
            </div>
          </div>
        </div>

        {/* Mega dropdown */}
        {activeMenu && activeMegaMenus[activeMenu] && (
          <div
            className="absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 py-8"
            onMouseEnter={() => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-4 gap-8">
              {activeMegaMenus[activeMenu].map((col) => (
                <div key={col.heading}>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{col.heading}</h4>
                  <ul className="space-y-2">
                    {col.items.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => scrollToSection('products')}
                          className="text-sm text-gray-600 hover:text-green-700 transition-colors cursor-pointer text-left"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[calc(2.25rem+1.75rem+3.5rem)] sm:top-[calc(2.75rem+1.75rem+3.5rem)] left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-lg overflow-y-auto max-h-[80vh]">
          <div className="px-4 py-4 space-y-1">
            {/* Language toggle mobile */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 w-full text-left text-sm font-bold text-green-700 py-2.5 border-b border-gray-100 cursor-pointer"
            >
              <span className="text-base">{language === 'en' ? '🇲🇽' : '🇺🇸'}</span>
              {language === 'en' ? 'Ver en Español' : 'View in English'}
            </button>

            {currentUser ? (
              <div className="border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Hi, {getFirstName(currentUser.name)}</span>
                </div>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm text-gray-600 hover:text-green-700 py-2 cursor-pointer"
                >
                  <i className="ri-user-line mr-2"></i>
                  {language === 'en' ? 'My Account' : 'Mi Cuenta'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-sm text-gray-600 hover:text-green-700 py-2 cursor-pointer"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  {language === 'en' ? 'Sign Out' : 'Cerrar Sesión'}
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left text-sm font-semibold text-green-700 py-2.5 border-b border-gray-100 cursor-pointer"
              >
                <i className="ri-user-line mr-2"></i>
                {language === 'en' ? 'Sign In / Create Account' : 'Iniciar Sesión / Crear Cuenta'}
              </Link>
            )}

            {activeNavItems.map((item) => (
              item.href ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left text-sm font-semibold text-gray-800 hover:text-green-700 py-2.5 border-b border-gray-50 cursor-pointer"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-sm font-semibold text-gray-800 hover:text-green-700 py-2.5 border-b border-gray-50 cursor-pointer"
                >
                  {item.label}
                </button>
              )
            ))}
            <button onClick={() => scrollToSection('about')} className="block w-full text-left text-sm text-gray-600 hover:text-green-700 py-2.5 border-b border-gray-50 cursor-pointer">
              {language === 'en' ? 'About Us' : 'Nosotros'}
            </button>
            <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-sm text-gray-600 hover:text-green-700 py-2.5 border-b border-gray-50 cursor-pointer">FAQ</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-sm text-gray-600 hover:text-green-700 py-2.5 cursor-pointer">
              {language === 'en' ? 'Contact' : 'Contacto'}
            </button>
            <button
              onClick={() => scrollToSection('products')}
              className="w-full mt-3 px-4 py-2.5 bg-green-700 text-white text-sm font-bold rounded-md hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {language === 'en' ? 'Get Free Samples' : 'Obtener Muestras Gratis'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}