import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

const storiesEn = [
  {
    id: 1,
    name: 'Marcus Webb',
    title: 'General Manager',
    company: 'The Meridian Hotel & Spa · Las Vegas, NV',
    rooms: '420 rooms',
    product: 'Blackout Roller Blinds',
    quote: '"We outfitted all 420 rooms with Classic Same Day Blinds blackout rollers. Installation was seamless, the quality is exceptional, and guests constantly comment on how well they sleep. Bulk pricing saved us over $40,000 compared to local suppliers."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20African%20American%20male%20hotel%20general%20manager%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20white%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-001&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=luxury%20hotel%20bedroom%20with%20elegant%20blackout%20roller%20blinds%2C%20king%20bed%20with%20white%20linens%2C%20city%20view%20window%2C%20warm%20ambient%20lighting%2C%20upscale%20interior%20design%2C%20professional%20architectural%20photography&width=600&height=480&seq=story-hotel-001&orientation=portrait',
  },
  {
    id: 2,
    name: 'Sandra Kowalski',
    title: 'Director of Operations',
    company: 'Sunrise Apartment Communities · Phoenix, AZ',
    rooms: '280 units',
    product: 'Cellular Shades',
    quote: '"We renovated 280 apartment units across three properties. The cellular shades look premium, tenants love the energy savings, and the bulk discount made it incredibly cost-effective. Our vacancy rate dropped after the upgrade."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20white%20female%20property%20manager%20headshot%2C%20warm%20smile%2C%20business%20casual%20attire%2C%20clean%20neutral%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-002&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=modern%20apartment%20living%20room%20with%20light%20filtering%20cellular%20shades%2C%20bright%20airy%20space%2C%20contemporary%20furniture%2C%20natural%20light%2C%20professional%20interior%20photography&width=600&height=480&seq=story-apt-001&orientation=portrait',
  },
  {
    id: 3,
    name: 'Derek Fontaine',
    title: 'Resort Owner',
    company: 'Palms Boutique Resort · Scottsdale, AZ',
    rooms: '96 suites',
    product: 'Motorized Roller Shades',
    quote: '"The motorized shades transformed our guest experience. Controlled via tablet in every suite, they add a true luxury feel. The team handled our custom sizing perfectly and delivered on time. Absolutely worth every penny."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20resort%20owner%20headshot%2C%20tanned%20confident%20smile%2C%20smart%20casual%20attire%2C%20outdoor%20resort%20background%20blurred%2C%20portrait%20photography&width=80&height=80&seq=avatar-003&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=luxury%20resort%20suite%20with%20motorized%20roller%20shades%2C%20desert%20view%2C%20modern%20minimalist%20decor%2C%20smart%20home%20tablet%20control%2C%20warm%20golden%20lighting%2C%20professional%20interior%20photography&width=600&height=480&seq=story-resort-001&orientation=portrait',
  },
  {
    id: 4,
    name: 'Priya Nair',
    title: 'Facilities Manager',
    company: 'Harborview Conference Center · Seattle, WA',
    rooms: '60 rooms',
    product: 'Vertical Blinds',
    quote: '"Our conference rooms needed blackout capability for presentations and natural light for breaks. The vertical blinds do both perfectly. The ordering process was smooth and the installation team was professional and fast."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20Indian%20female%20facilities%20manager%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20office%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-004&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=modern%20conference%20room%20with%20vertical%20blinds%2C%20large%20windows%2C%20boardroom%20table%2C%20professional%20meeting%20space%2C%20Seattle%20waterfront%20view%2C%20architectural%20interior%20photography&width=600&height=480&seq=story-conf-001&orientation=portrait',
  },
];

const storiesEs = [
  {
    id: 1,
    name: 'Marcus Webb',
    title: 'Gerente General',
    company: 'The Meridian Hotel & Spa · Las Vegas, NV',
    rooms: '420 habitaciones',
    product: 'Persianas Enrollables Blackout',
    quote: '"Equipamos las 420 habitaciones con persianas blackout de Classic Same Day Blinds. La instalación fue impecable, la calidad es excepcional y los huéspedes comentan constantemente lo bien que duermen. El precio por volumen nos ahorró más de $40,000 comparado con proveedores locales."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20African%20American%20male%20hotel%20general%20manager%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20white%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-001&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=luxury%20hotel%20bedroom%20with%20elegant%20blackout%20roller%20blinds%2C%20king%20bed%20with%20white%20linens%2C%20city%20view%20window%2C%20warm%20ambient%20lighting%2C%20upscale%20interior%20design%2C%20professional%20architectural%20photography&width=600&height=480&seq=story-hotel-001&orientation=portrait',
  },
  {
    id: 2,
    name: 'Sandra Kowalski',
    title: 'Directora de Operaciones',
    company: 'Sunrise Apartment Communities · Phoenix, AZ',
    rooms: '280 unidades',
    product: 'Cortinas Celulares',
    quote: '"Renovamos 280 unidades de apartamentos en tres propiedades. Las cortinas celulares lucen premium, los inquilinos adoran el ahorro de energía y el descuento por volumen lo hizo muy rentable. Nuestra tasa de vacantes bajó después de la mejora."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20white%20female%20property%20manager%20headshot%2C%20warm%20smile%2C%20business%20casual%20attire%2C%20clean%20neutral%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-002&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=modern%20apartment%20living%20room%20with%20light%20filtering%20cellular%20shades%2C%20bright%20airy%20space%2C%20contemporary%20furniture%2C%20natural%20light%2C%20professional%20interior%20photography&width=600&height=480&seq=story-apt-001&orientation=portrait',
  },
  {
    id: 3,
    name: 'Derek Fontaine',
    title: 'Dueño del Resort',
    company: 'Palms Boutique Resort · Scottsdale, AZ',
    rooms: '96 suites',
    product: 'Cortinas Enrollables Motorizadas',
    quote: '"Las cortinas motorizadas transformaron la experiencia de nuestros huéspedes. Controladas por tablet en cada suite, añaden un verdadero toque de lujo. El equipo manejó nuestras medidas personalizadas perfectamente y entregó a tiempo. Absolutamente vale cada centavo."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20resort%20owner%20headshot%2C%20tanned%20confident%20smile%2C%20smart%20casual%20attire%2C%20outdoor%20resort%20background%20blurred%2C%20portrait%20photography&width=80&height=80&seq=avatar-003&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=luxury%20resort%20suite%20with%20motorized%20roller%20shades%2C%20desert%20view%2C%20modern%20minimalist%20decor%2C%20smart%20home%20tablet%20control%2C%20warm%20golden%20lighting%2C%20professional%20interior%20photography&width=600&height=480&seq=story-resort-001&orientation=portrait',
  },
  {
    id: 4,
    name: 'Priya Nair',
    title: 'Gerente de Instalaciones',
    company: 'Harborview Conference Center · Seattle, WA',
    rooms: '60 salas',
    product: 'Persianas Verticales',
    quote: '"Nuestras salas de conferencias necesitaban oscurecimiento para presentaciones y luz natural para los descansos. Las persianas verticales hacen ambas cosas perfectamente. El proceso de pedido fue fluido y el equipo de instalación fue profesional y rápido."',
    rating: 5,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20Indian%20female%20facilities%20manager%20headshot%2C%20confident%20smile%2C%20business%20attire%2C%20clean%20office%20background%2C%20corporate%20portrait%20photography&width=80&height=80&seq=avatar-004&orientation=squarish',
    image: 'https://readdy.ai/api/search-image?query=modern%20conference%20room%20with%20vertical%20blinds%2C%20large%20windows%2C%20boardroom%20table%2C%20professional%20meeting%20space%2C%20Seattle%20waterfront%20view%2C%20architectural%20interior%20photography&width=600&height=480&seq=story-conf-001&orientation=portrait',
  },
];

const statsEn = [
  { value: '2,500+', label: 'Properties Served', icon: 'ri-building-2-line' },
  { value: '180,000+', label: 'Units Installed', icon: 'ri-window-line' },
  { value: '98%', label: 'Satisfaction Rate', icon: 'ri-emotion-happy-line' },
  { value: '4.9★', label: 'Average Rating', icon: 'ri-star-line' },
];

const statsEs = [
  { value: '2,500+', label: 'Propiedades Atendidas', icon: 'ri-building-2-line' },
  { value: '180,000+', label: 'Unidades Instaladas', icon: 'ri-window-line' },
  { value: '98%', label: 'Tasa de Satisfacción', icon: 'ri-emotion-happy-line' },
  { value: '4.9★', label: 'Calificación Promedio', icon: 'ri-star-line' },
];

export default function ClientStories() {
  const [active, setActive] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const { language } = useLanguage();

  const stories = language === 'en' ? storiesEn : storiesEs;
  const stats = language === 'en' ? statsEn : statsEs;

  const prev = () => setActive((a) => (a - 1 + stories.length) % stories.length);
  const next = () => setActive((a) => (a + 1) % stories.length);
  const story = stories[active];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();
    data.forEach((value, key) => {
      if (key !== 'photo') params.append(key, value as string);
    });
    params.append('rating', String(rating));
    if (photoName) params.append('photo', 'Uncollectable');
    try {
      await fetch('https://readdy.ai/api/form/d6pojoba90d3mf3eg52g', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
    } catch (_) {
      // Submission error silently ignored
    }
    setSubmitted(true);
  };

  return (
    <section id="client-stories" className="py-24" style={{ background: 'linear-gradient(160deg, #0d1b2a 0%, #0f2744 60%, #0d1b2a 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            {language === 'en' ? 'CLIENT STORIES' : 'HISTORIAS DE CLIENTES'}
          </p>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            {language === 'en' ? 'Trusted by Property Professionals' : 'La Confianza de los Profesionales Inmobiliarios'}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            {language === 'en'
              ? 'Hear from hotel GMs, apartment directors, and resort owners who outfit their properties with Classic Same Day Blinds.'
              : 'Escucha a gerentes de hoteles, directores de apartamentos y dueños de resorts que equipan sus propiedades con Classic Same Day Blinds.'}
          </p>
          <button
            onClick={() => { setShowReviewForm(true); setSubmitted(false); setPhotoPreview(null); setPhotoName(''); }}
            className="mt-6 inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm px-6 py-3 rounded-full transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-amber-400/20"
          >
            <i className="ri-edit-line"></i>
            {language === 'en' ? 'Leave a Review' : 'Dejar una Reseña'}
          </button>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0f2744] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowReviewForm(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-full bg-amber-400/10 border border-amber-400/30">
                    <i className="ri-checkbox-circle-line text-4xl text-amber-400"></i>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {language === 'en' ? 'Thank You!' : '¡Gracias!'}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {language === 'en'
                      ? <>Your review has been submitted and is <strong className="text-amber-400">pending approval</strong>. Once reviewed by our team, it will appear on the live site.</>
                      : <>Tu reseña ha sido enviada y está <strong className="text-amber-400">pendiente de aprobación</strong>. Una vez revisada por nuestro equipo, aparecerá en el sitio.</>}
                  </p>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="mt-6 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm px-6 py-2.5 rounded-full transition-all cursor-pointer whitespace-nowrap"
                  >
                    {language === 'en' ? 'Close' : 'Cerrar'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Share Your Experience' : 'Comparte Tu Experiencia'}
                    </p>
                    <h3 className="text-white text-xl font-bold">
                      {language === 'en' ? 'Leave a Review' : 'Dejar una Reseña'}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      {language === 'en' ? 'Reviews are approved before going live on the site.' : 'Las reseñas se aprueban antes de publicarse en el sitio.'}
                    </p>
                  </div>

                  <form data-readdy-form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                          {language === 'en' ? 'Your Name *' : 'Tu Nombre *'}
                        </label>
                        <input name="name" required type="text" placeholder="John Smith"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                          {language === 'en' ? 'Job Title' : 'Cargo'}
                        </label>
                        <input name="title" type="text" placeholder={language === 'en' ? 'General Manager' : 'Gerente General'}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                        {language === 'en' ? 'Company / Property' : 'Empresa / Propiedad'}
                      </label>
                      <input name="company" type="text" placeholder={language === 'en' ? 'The Grand Hotel · New York, NY' : 'El Gran Hotel · Ciudad de México'}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                        {language === 'en' ? 'Product Purchased' : 'Producto Comprado'}
                      </label>
                      <input name="product" type="text" placeholder={language === 'en' ? 'e.g. Blackout Roller Blinds' : 'ej. Persianas Enrollables Blackout'}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-2">
                        {language === 'en' ? 'Your Rating *' : 'Tu Calificación *'}
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                            className="w-8 h-8 flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
                            <i className={`ri-star-fill text-2xl ${star <= (hoverRating || rating) ? 'text-amber-400' : 'text-white/20'}`}></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                        {language === 'en' ? 'Your Review *' : 'Tu Reseña *'}
                      </label>
                      <textarea name="review" required rows={4} maxLength={500}
                        placeholder={language === 'en' ? 'Tell us about your experience...' : 'Cuéntanos sobre tu experiencia...'}
                        onChange={(e) => setCharCount(e.target.value.length)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors resize-none" />
                      <p className="text-slate-500 text-xs text-right mt-1">{charCount}/500</p>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                        {language === 'en' ? 'Upload a Photo' : 'Subir una Foto'}{' '}
                        <span className="text-slate-500 font-normal">({language === 'en' ? 'optional' : 'opcional'})</span>
                      </label>
                      <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-lg cursor-pointer transition-colors bg-white/5 overflow-hidden">
                        {photoPreview ? (
                          <div className="relative w-full">
                            <img src={photoPreview} alt="Preview" className="w-full h-36 object-cover object-top" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-semibold">{language === 'en' ? 'Click to change' : 'Clic para cambiar'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-5 px-4 text-center">
                            <div className="w-10 h-10 flex items-center justify-center mb-2 rounded-full bg-amber-400/10">
                              <i className="ri-image-add-line text-xl text-amber-400"></i>
                            </div>
                            <p className="text-slate-300 text-xs font-semibold">{language === 'en' ? 'Click to upload a photo' : 'Clic para subir una foto'}</p>
                            <p className="text-slate-500 text-xs mt-1">JPG, PNG or WEBP · Max 10MB</p>
                          </div>
                        )}
                        <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      {photoName && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-slate-400 text-xs truncate max-w-[80%]">
                            <i className="ri-image-line mr-1 text-amber-400"></i>{photoName}
                          </p>
                          <button type="button" onClick={() => { setPhotoPreview(null); setPhotoName(''); }}
                            className="text-slate-500 hover:text-red-400 text-xs transition-colors cursor-pointer whitespace-nowrap">
                            {language === 'en' ? 'Remove' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-slate-300 text-xs font-semibold mb-1.5">
                        {language === 'en' ? 'Email Address' : 'Correo Electrónico'}
                      </label>
                      <input name="email" type="email" placeholder="you@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors" />
                    </div>
                    <button type="submit"
                      className="w-full bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm py-3 rounded-full transition-all cursor-pointer whitespace-nowrap mt-2">
                      {language === 'en' ? 'Submit Review for Approval' : 'Enviar Reseña para Aprobación'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="relative md:w-5/12 h-72 md:h-auto flex-shrink-0">
              <img key={story.id} src={story.image} alt={story.product} className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  <i className="ri-building-line text-sm"></i>{story.rooms}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap border border-white/30">
                  {story.product}
                </span>
              </div>
            </div>
            <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 flex items-center justify-center mb-4">
                  <i className="ri-double-quotes-l text-4xl text-amber-400"></i>
                </div>
                <div className="flex gap-1 mb-5">
                  {[...Array(story.rating)].map((_, i) => (
                    <div key={i} className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-star-fill text-amber-400 text-lg"></i>
                    </div>
                  ))}
                </div>
                <p className="text-white text-base leading-relaxed mb-8 font-light">{story.quote}</p>
              </div>
              <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-amber-400/50">
                  <img src={story.avatar} alt={story.name} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{story.name}</p>
                  <p className="text-slate-400 text-xs">{story.title}</p>
                  <p className="text-amber-400 text-xs font-medium mt-0.5">{story.company}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button onClick={prev} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer">
              <i className="ri-arrow-left-s-line text-xl"></i>
            </button>
            <div className="flex gap-2">
              {stories.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${i === active ? 'w-8 h-3 bg-amber-400' : 'w-3 h-3 bg-white/30 hover:bg-white/50'}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer">
              <i className="ri-arrow-right-s-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <i className={`${stat.icon} text-2xl`}></i>
              </div>
              <p className="text-2xl font-extrabold text-white mb-1">{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
