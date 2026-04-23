import { useState } from 'react';

interface RestockNotificationProps {
  productId: number;
  productName: string;
  language: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function RestockNotification({ productId, productName, language }: RestockNotificationProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [touched, setTouched] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const showEmailError = touched && !isValidEmail;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (!isValidEmail) return;

    setSubmitState('submitting');
    try {
      const body = new URLSearchParams({
        email,
        name,
        product_name: productName,
        product_id: String(productId),
      });
      const res = await fetch('https://readdy.ai/api/form/d6ug5pm7ipaugi04l91g', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        setSubmitState('success');
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  };

  const isEs = language === 'es';

  if (submitState === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-700">
          <i className="ri-mail-check-line text-2xl"></i>
        </div>
        <div>
          <p className="text-sm font-bold text-green-900 mb-1">
            {isEs ? "¡Ya te tenemos registrado!" : "You're on the list!"}
          </p>
          <p className="text-xs text-green-700 leading-relaxed">
            {isEs
              ? `Te notificaremos a ${email} cuando ${productName} vuelva a estar disponible.`
              : `We'll email ${email} the moment ${productName} is back in stock.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <i className="ri-notification-3-line text-xl"></i>
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900">
            {isEs ? 'Notifícame cuando esté disponible' : 'Notify Me When Available'}
          </p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            {isEs
              ? 'Este producto está sin stock ahora mismo. Déjanos tu correo y serás el primero en saberlo cuando vuelva.'
              : "This item is currently out of stock. Drop your email and you'll be the first to know when it's back."}
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        data-readdy-form
        onSubmit={handleSubmit}
        className="px-5 pb-5 flex flex-col gap-3"
      >
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-amber-900">
            {isEs ? 'Nombre (opcional)' : 'Your Name (optional)'}
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isEs ? 'Tu nombre' : 'e.g. Maria'}
            className="w-full px-3 py-2 text-sm rounded-md border border-amber-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-amber-900">
            {isEs ? 'Correo electrónico' : 'Email Address'} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (touched) setTouched(true); }}
            onBlur={() => setTouched(true)}
            placeholder={isEs ? 'tucorreo@ejemplo.com' : 'you@example.com'}
            className={`w-full px-3 py-2 text-sm rounded-md border bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${showEmailError ? 'border-red-400 focus:ring-red-300' : 'border-amber-200 focus:ring-amber-400'}`}
          />
          {showEmailError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <i className="ri-error-warning-line"></i>
              {isEs ? 'Por favor introduce un correo válido.' : 'Please enter a valid email address.'}
            </p>
          )}
        </div>

        {/* Hidden fields */}
        <input type="hidden" name="product_name" value={productName} />
        <input type="hidden" name="product_id" value={String(productId)} />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitState === 'submitting'}
          className="w-full py-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitState === 'submitting' ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base"></i>
              {isEs ? 'Registrando...' : 'Submitting...'}
            </>
          ) : (
            <>
              <i className="ri-mail-send-line text-base"></i>
              {isEs ? 'Avisarme cuando esté disponible' : 'Alert Me When Back in Stock'}
            </>
          )}
        </button>

        {submitState === 'error' && (
          <p className="text-xs text-red-600 flex items-center gap-1 justify-center">
            <i className="ri-error-warning-line"></i>
            {isEs ? 'Algo salió mal. Por favor intenta de nuevo.' : 'Something went wrong. Please try again.'}
          </p>
        )}

        <p className="text-xs text-amber-600 text-center">
          <i className="ri-lock-line mr-1"></i>
          {isEs
            ? 'Sin spam. Solo te avisamos cuando el producto esté listo.'
            : 'No spam — we only send one email when the item is restocked.'}
        </p>
      </form>
    </div>
  );
}
