import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const galleryPhotos = [
  { id: 10, titleEn: 'White Faux Wood Blinds', titleEs: 'Persianas de Madera Sintética Blanca', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/649c295b2728ced9cae2c40cb74b4589.png' },
  { id: 11, titleEn: 'Faux Wood Blinds Close-Up', titleEs: 'Detalle de Persiana de Madera Sintética', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/afcfb07233e4323e4bec66126de153bb.webp' },
  { id: 12, titleEn: 'Raised Faux Wood Blinds with Garden View', titleEs: 'Persiana de Madera Sintética con Vista al Jardín', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/4767e1f7e90f2b55e1334116f13f51e5.png' },
  { id: 13, titleEn: 'Conference Room Aluminum Blinds', titleEs: 'Persianas de Aluminio en Sala de Conferencias', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/e89a509b5b0ebdb0a0e5d2f83facfc1f.jpeg' },
  { id: 14, titleEn: 'Textured Beige Aluminum Slats Detail', titleEs: 'Detalle de Lamas de Aluminio Texturizadas Beige', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/e76ecd4353f387e644c4508052547bd7.webp' },
  { id: 16, titleEn: 'White Faux Wood Blinds in Living Room', titleEs: 'Persianas de Madera Sintética Blanca en Sala de Estar', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/75e1c76a2c4eb8b8bb068c119ac5a8c9.png' },
  // 1" Vinyl Blinds
  { id: 17, titleEn: '1" Vinyl Blinds', titleEs: 'Persianas de Vinilo 1"', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://images.thdstatic.com/productImages/cb74b7ea-e408-49e1-86b1-d82faf955438/svn/white-commercial-grade-chicology-vinyl-mini-blinds-vnbgw2436-64_600.jpg' },
  { id: 18, titleEn: '1" Vinyl Blinds – White', titleEs: 'Persianas de Vinilo 1" – Blancas', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://www.chicology.com/cdn/shop/files/VNBGW-01_e77a3455-04ce-4c37-852b-b05c15b646ee.jpg?v=1765475792&width=2000' },
  { id: 19, titleEn: '1" Vinyl Blinds – Cordless', titleEs: 'Persianas de Vinilo 1" – Sin Cordón', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://i5.walmartimages.com/seo/Cordless-Light-Filtering-Window-Blinds-Horizontal-Vinyl-Mini-Blinds-Shades-1-Slats-Easy-Install_bc0ed27c-9824-4188-a0d9-48582be235c5.702ffe82b410e2b9eb7d0c3bae2ed094.jpeg' },
  { id: 20, titleEn: '1" Vinyl Blinds – Installed', titleEs: 'Persianas de Vinilo 1" – Instaladas', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://m.media-amazon.com/images/I/71M-pTMUkEL.jpg' },
  // 1" Vinyl Plus Blinds
  { id: 21, titleEn: '1" Vinyl Plus Blinds', titleEs: 'Persianas de Vinilo Plus 1"', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://m.media-amazon.com/images/I/51%2BCbmpdDTL._AC_UF350%2C350_QL80_.jpg' },
  { id: 22, titleEn: '1" Vinyl Plus Blinds – White', titleEs: 'Persianas de Vinilo Plus 1" – Blancas', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://images.thdstatic.com/productImages/e943d337-09dd-4e55-84cc-9e97706a823c/svn/white-perfect-lift-window-treatment-vinyl-mini-blinds-qkwt194480-64_600.jpg' },
  { id: 23, titleEn: '1" Vinyl Plus Blinds – Detail', titleEs: 'Detalle de Persianas de Vinilo Plus 1"', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://windowblindoutlet.com/cdn/shop/files/whtdsp2.png?v=1714407380&width=1445' },
  { id: 24, titleEn: '1" Vinyl Plus Blinds – Room', titleEs: 'Persianas de Vinilo Plus 1" en Habitación', categoryEn: 'Vinyl Blinds', categoryEs: 'Persianas de Vinilo', src: 'https://easeeasecurtains.com/cdn/shop/files/3W3A2073.jpg?v=1773000663&width=1445' },
  // 1" Aluminum Blinds
  { id: 25, titleEn: '1" Aluminum Blinds', titleEs: 'Persianas de Aluminio 1"', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://m.media-amazon.com/images/I/81u7lZm0SoL.jpg' },
  { id: 26, titleEn: '1" Aluminum Blinds – Silver', titleEs: 'Persianas de Aluminio 1" – Plateadas', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://m.media-amazon.com/images/I/91qTb4W1JYL._AC_UF894%2C1000_QL80_.jpg' },
  { id: 27, titleEn: '1" Aluminum Blinds – Modern', titleEs: 'Persianas de Aluminio 1" – Modernas', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://www.ikea.com/us/en/images/products/vecklarfly-venetian-blind-aluminum__1246592_pe922191_s5.jpg?f=s' },
  { id: 28, titleEn: '1" Aluminum Blinds – Premium', titleEs: 'Persianas de Aluminio 1" – Premium', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://glecopaint.com/cdn/shop/products/HunterDouglas-Modern-Precious-Metals_1400x.jpg?v=1571717003' },
  // Aluminum Business Class
  { id: 30, titleEn: 'Business Class Aluminum – Installed', titleEs: 'Aluminio Business Class – Instaladas', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://dgav6ksxm0vi5.cloudfront.net/images/_1920xAUTO_crop_center-center_none/Aluminum-blinds-5.jpg' },
  { id: 31, titleEn: 'Business Class Aluminum – Detail', titleEs: 'Aluminio Business Class – Detalle', categoryEn: 'Aluminum Blinds', categoryEs: 'Persianas de Aluminio', src: 'https://cdn.blindster.com/site/product/bln-2pab89n/color/7021-product-swatch-6.jpg' },
  // 2" Faux Wood Blinds
  { id: 32, titleEn: '2" Faux Wood Blinds', titleEs: 'Persianas de Madera Sintética 2"', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://m.media-amazon.com/images/I/71a%2Bq5LHWyL.jpg' },
  { id: 33, titleEn: '2" Faux Wood Blinds – White', titleEs: 'Persianas de Madera Sintética 2" – Blancas', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://m.media-amazon.com/images/I/51kV5h1wmML.jpg' },
  { id: 34, titleEn: '2" Faux Wood Blinds – Cordless', titleEs: 'Persianas de Madera Sintética 2" – Sin Cordón', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://www.chicology.com/cdn/shop/files/FauxWoodBlind_BO_White_1_V3.jpg?v=1767721065' },
  { id: 35, titleEn: '2" Faux Wood Blinds – Premier', titleEs: 'Persianas de Madera Sintética 2" – Premier', categoryEn: 'Faux Wood Blinds', categoryEs: 'Madera Sintética', src: 'https://www.factorydirectblinds.com/cdn/shop/files/2-premier-cordless-faux-wood-blinds-9886849.jpg?v=1762593150' },
  // Vertical Blinds
  { id: 36, titleEn: 'Vertical Blinds – White', titleEs: 'Persianas Verticales – Blancas', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://images.thdstatic.com/productImages/f061ffb2-fb1d-4379-835f-0e749dfe8105/svn/white-vertical-blinds-10793478804986-64_1000.jpg' },
  { id: 37, titleEn: 'Vertical Blinds – Room View', titleEs: 'Persianas Verticales – Vista de Habitación', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://m.media-amazon.com/images/I/61X9jusxAQL._AC_UF894%2C1000_QL80_.jpg' },
  { id: 38, titleEn: 'Vertical Blinds – Crown White', titleEs: 'Persianas Verticales – Crown Blancas', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://images.thdstatic.com/productImages/fcd49271-8438-4fbf-9842-ec876d58cdf8/svn/crown-white-home-decorators-collection-vertical-blinds-10793478808588-64_600.jpg' },
  { id: 39, titleEn: 'Vertical Blinds – Open View', titleEs: 'Persianas Verticales – Vista Abierta', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://www.blinds.com/product-images/e0d5a3cb-2d72-f011-848d-0afffee37a07.jpg' },
  // Stock Vertical Blinds
  { id: 40, titleEn: 'Stock Vertical Blinds', titleEs: 'Persianas Verticales en Stock', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://www.blinds.com/product-images/8cb1323e-f47c-ee11-94a4-0a986990730e.jpg' },
  { id: 41, titleEn: 'Stock Vertical Blinds – Side View', titleEs: 'Persianas Verticales en Stock – Vista Lateral', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://www.blinds.com/product-images/a31e2d01-1d64-f011-848d-0afffee37a07.jpg?height=728&mode=crop&quality=90&scale=both&width=728' },
  { id: 42, titleEn: 'Stock Vertical Blinds – Oxford White', titleEs: 'Persianas Verticales en Stock – Blanco Oxford', categoryEn: 'Vertical Blinds', categoryEs: 'Persianas Verticales', src: 'https://images.thdstatic.com/productImages/9f31cd00-7b58-43b0-a4de-e6f50f58a4f9/svn/oxford-white-chicology-vertical-blinds-vbow7884-64_600.jpg' },
  { id: 43, titleEn: 'White Roller Shades – Dining Room', titleEs: 'Persianas Enrollables Blancas – Comedor', categoryEn: 'Roller Shades', categoryEs: 'Persianas Enrollables', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/571489ad5b2b4059cc114cfa8bb17af6.jpeg' },
  { id: 44, titleEn: 'Roller Shades – Luxury Bedroom City View', titleEs: 'Persianas Enrollables – Dormitorio de Lujo con Vista a la Ciudad', categoryEn: 'Roller Shades', categoryEs: 'Persianas Enrollables', src: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/140430269941f19746ed3d95c0ba143d.png' },
];

const categoriesEn = ['All', 'Faux Wood Blinds', 'Aluminum Blinds', 'Vinyl Blinds', 'Vertical Blinds'];
const categoriesEs = ['Todos', 'Madera Sintética', 'Persianas de Aluminio', 'Persianas de Vinilo', 'Persianas Verticales'];

export default function PhotoGallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCategoryEs, setActiveCategoryEs] = useState('Todos');
  const [lightboxPhoto, setLightboxPhoto] = useState<typeof galleryPhotos[0] | null>(null);
  const { language } = useLanguage();

  const categories = language === 'en' ? categoriesEn : categoriesEs;

  const handleCategoryClick = (cat: string, index: number) => {
    if (language === 'en') {
      setActiveCategory(cat);
      setActiveCategoryEs(categoriesEs[index]);
    } else {
      setActiveCategoryEs(cat);
      setActiveCategory(categoriesEn[index]);
    }
  };

  const filtered = activeCategory === 'All'
    ? galleryPhotos
    : galleryPhotos.filter((p) => p.categoryEn === activeCategory);

  const activeDisplay = language === 'en' ? activeCategory : activeCategoryEs;

  return (
    <section id="photo-gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-green-700 text-sm font-semibold uppercase tracking-widest mb-2">
            {language === 'en' ? 'Our Work' : 'Nuestro Trabajo'}
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {language === 'en' ? 'Photo Gallery' : 'Galería de Fotos'}
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            {language === 'en'
              ? 'Browse real installations from our customers — beautiful window treatments for every room and style.'
              : 'Explora instalaciones reales de nuestros clientes — hermosos tratamientos de ventanas para cada habitación y estilo.'}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat, index) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat, index)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeDisplay === cat
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-600 border-stone-300 hover:border-green-600 hover:text-green-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              className="break-inside-avoid rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              onClick={() => setLightboxPhoto(photo)}
            >
              <img src={photo.src} alt={language === 'en' ? photo.titleEn : photo.titleEs}
                className="w-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                <div className="w-full p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="inline-block bg-green-700 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                    {language === 'en' ? photo.categoryEn : photo.categoryEs}
                  </span>
                  <p className="text-white font-bold text-sm">
                    {language === 'en' ? photo.titleEn : photo.titleEs}
                  </p>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                <i className="ri-zoom-in-line text-gray-800 text-sm"></i>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-stone-50 border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-2xl">
              <i className="ri-image-add-line text-green-700 text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'en' ? 'Share Your Installation' : 'Comparte Tu Instalación'}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {language === 'en'
                  ? "Have photos of your window treatments? We'd love to feature them here!"
                  : '¿Tienes fotos de tus tratamientos de ventanas? ¡Nos encantaría mostrarlas aquí!'}
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-green-700 text-white text-sm font-bold rounded-xl hover:bg-green-800 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-upload-cloud-2-line text-base"></i>
            </div>
            {language === 'en' ? 'Submit Your Photos' : 'Enviar Tus Fotos'}
          </button>
        </div>
      </div>

      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightboxPhoto(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxPhoto.src} alt={language === 'en' ? lightboxPhoto.titleEn : lightboxPhoto.titleEs}
              className="w-full max-h-[70vh] object-cover object-top" />
            <div className="p-5 flex items-center justify-between">
              <div>
                <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-1">
                  {language === 'en' ? lightboxPhoto.categoryEn : lightboxPhoto.categoryEs}
                </span>
                <p className="text-gray-900 font-bold text-lg">
                  {language === 'en' ? lightboxPhoto.titleEn : lightboxPhoto.titleEs}
                </p>
              </div>
              <button onClick={() => setLightboxPhoto(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer">
                <i className="ri-close-line text-gray-700 text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
