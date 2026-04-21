import { faqItems } from "@/lib/site-data";

export function FaqSection() {
  return (
    <section className="px-6 pb-20 pt-16 md:px-10 lg:px-14">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-black/5 bg-white/84 px-6 py-10 shadow-[0_24px_70px_rgba(24,36,34,0.08)] backdrop-blur md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-olive">
          FAQ
        </p>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate md:text-5xl">
          The practical questions buyers ask before they place an order.
        </h2>
        <div className="mt-8 space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-[1.5rem] border border-black/5 bg-shell px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-lg font-semibold text-slate">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-sm font-medium text-brass transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate/72">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
