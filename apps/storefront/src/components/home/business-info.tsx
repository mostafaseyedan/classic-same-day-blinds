import { Button } from "@blinds/ui";
import Link from 'next/link';
import { MapPin, Phone, Clock, CalendarCheck, Envelope } from "@phosphor-icons/react/ssr";

export function BusinessInfo() {
  return (
    <section className="bg-shell border-b border-black/5 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 items-start">
          
          {/* Business Name & Address */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-olive/10 rounded-full mb-4">
              <MapPin className="text-olive w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-semibold text-slate mb-1">Classic Same Day Blinds</h2>
            <p className="text-slate/70 text-base leading-relaxed">
              2801 Brasher Ln<br />
              Bedford, TX 76021
            </p>
            <a
              href="https://maps.google.com/?q=2801+Brasher+Ln,+Bedford,+TX+76021"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-brass text-sm font-semibold hover:text-brass/80 hover:underline transition-all whitespace-nowrap"
            >
              Get Directions
            </a>
          </div>

          {/* Phone Numbers */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-olive/10 rounded-full mb-4">
              <Phone className="text-olive w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate mb-2">
              Call Us
            </h3>
            <a
              href="tel:8175409300"
              className="text-slate/90 text-base font-medium hover:text-brass transition-colors whitespace-nowrap flex items-center gap-2"
            >
              (817) 540-9300
            </a>
            <p className="text-slate/50 text-xs mt-1 mb-2 uppercase tracking-wide font-semibold">Local</p>
            
            <a
              href="tel:18009619867"
              className="text-slate/90 text-base font-medium hover:text-brass transition-colors whitespace-nowrap flex items-center gap-2"
            >
              (800) 961-9867
            </a>
            <p className="text-slate/50 text-xs mt-1 uppercase tracking-wide font-semibold">Toll Free</p>
          </div>

          {/* Business Hours */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-12 h-12 flex items-center justify-center bg-olive/10 rounded-full mb-4">
              <Clock className="text-olive w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate mb-3">
              Business Hours
            </h3>
            <div className="space-y-2 text-base text-slate/70 w-full">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <span className="font-semibold text-slate min-w-[5rem]">Mon – Fri</span>
                <span>8:00 am – 5:00 pm</span>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <span className="font-semibold text-slate min-w-[5rem]">Sat – Sun</span>
                <span>Online orders only</span>
              </div>
              <p className="text-sm text-slate/50 italic mt-2 text-center md:text-left">
                Delivered Mon or Tue of the following week
              </p>
            </div>
          </div>
        </div>

        {/* Order Online Callout */}
        <div className="mt-12 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive">
            <CalendarCheck className="h-5 w-5 text-shell" />
          </div>
          <p className="text-olive text-lg font-bold tracking-[0.1em] uppercase">
            Order Online 7 Days a Week
          </p>
        </div>

        {/* Informational Block */}
        <div className="mt-8 rounded-[1.5rem] bg-white border border-black/5 px-6 py-8 md:px-10 shadow-sm text-center">
          <p className="text-slate/80 text-base leading-relaxed max-w-4xl mx-auto">
            <strong className="text-slate font-semibold">In need of new blinds right away?</strong> Look no further than Classic Same Day Blinds. If you are located in the <strong className="text-olive font-semibold">Dallas Fort Worth area</strong>, we offer convenient <strong>same day delivery and pick-up</strong> options with certain orders. Are you located outside of this area? Don't worry, we'd still love to help! You can still place an order online for your convenience for delivery.
            <br /><br />
            Our location in <strong className="text-olive font-semibold">Bedford, TX</strong> has a huge inventory of blinds. If we don't have your selected blinds in stock, please reach out to us in the{' '}
            <Link href="/contact" className="text-brass font-bold hover:text-brass/80 hover:underline transition-colors">
              contact us
            </Link>
            {' '}section — we will order them right away! Rest assured that we will get your blinds delivered as soon as possible.
          </p>

          <div className="mt-6 flex justify-center">
            <Button asChild variant="olive">
              <Link href="/contact">
                <Envelope className="h-4 w-4" />
                Send Us a Quick Inquiry
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
}
