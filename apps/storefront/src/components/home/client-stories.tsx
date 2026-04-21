const stories = [
  {
    name: "Marcus Webb",
    title: "General Manager",
    company: "Meridian Hotel & Spa",
    quote:
      "The new storefront direction feels much closer to how our buyers actually purchase: fast product evaluation, quote backup when needed, and cleaner order handoff.",
  },
  {
    name: "Sandra Kowalski",
    title: "Operations Director",
    company: "Sunrise Apartment Communities",
    quote:
      "Property teams care about repeatability more than novelty. The catalog, cart, and account work now looks like a system we can actually operate.",
  },
  {
    name: "Priya Nair",
    title: "Facilities Manager",
    company: "Harborview Conference Center",
    quote:
      "The legacy demo showed the breadth of the idea. The new storefront is finally shaping that into a maintainable buying experience.",
  },
];

export function ClientStories() {
  return (
    <section className="bg-slate px-6 py-16 text-shell md:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass/90">
              Client Stories
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Keep the proof points, drop the old review widget logic.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-shell/72">
              This section carries forward the stakeholder-facing social proof pattern from legacy
              without pretending the old form endpoint or moderation flow is part of the new stack.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5 text-center">
            <div>
              <p className="text-3xl font-semibold text-white">4.9</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-shell/58">Target rating</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-white">98%</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-shell/58">Satisfaction</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {stories.map((story) => (
            <article
              key={story.name}
              className="rounded-[1.5rem] border border-white/10 bg-white/6 px-6 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.15)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brass text-lg font-semibold text-slate">
                  {story.name
                    .split(" ")
                    .map((part) => part.charAt(0))
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">{story.name}</p>
                  <p className="text-sm text-shell/68">{story.title}</p>
                  <p className="text-sm text-brass">{story.company}</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-shell/82">{story.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
