import { Button } from "@blinds/ui";
import { SectionHeader, SurfaceCard } from "@blinds/ui";
import { Eyebrow, SectionCopy, SectionTitle } from "@blinds/ui";
import Image from "next/image";
import Link from "next/link";
import { AnimateOnScroll } from "@/components/animate-on-scroll";

const galleryCards = [
  {
    title: "Living Room Refresh",
    copy: "Replaced heavy fabric drapes with 2-inch faux wood blinds. Clean sightlines, better light control, and a finish that ties into the hardwood floors.",
    image: "/images/home/before-after-1.png",
    eyebrow: "Residential update",
  },
  {
    title: "Apartment Turnover",
    copy: "24 units outfitted with 1-inch vinyl blinds in one repeatable order.",
    image: "/images/home/before-after-2.png",
    eyebrow: "Multi-family rollout",
  },
  {
    title: "Patio Door Coverage",
    copy: "Custom vertical blinds cut for a 120-inch slider with full edge-to-edge coverage.",
    image: "/images/home/before-after-3.png",
    eyebrow: "Large opening fit",
  },
] as const;

export function BeforeAfterGallery() {
  const [featuredStory, ...supportingStories] = galleryCards;

  return (
    <section className="page-section border-t border-black/5 bg-shell">
      <AnimateOnScroll className="content-shell max-w-[72rem]">
        <SectionHeader>
          <div>
            <Eyebrow>Installed Results</Eyebrow>
            <SectionTitle className="max-w-3xl">What the right blind changes in a finished room.</SectionTitle>
            <SectionCopy className="max-w-2xl">
              The point is not decoration alone. It is cleaner light control, a better fit, and a room
              that feels resolved once the window treatment is doing its job.
            </SectionCopy>
          </div>
          <Button asChild variant="secondary"><Link href="/products">
            Explore Product Types
          </Link></Button>
        </SectionHeader>

        <div className="mt-9 grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-slate text-white">
            <div className="relative min-h-[22rem] flex-1 bg-slate">
              <Image
                src={featuredStory.image}
                alt={featuredStory.title}
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/96 via-slate/44 to-slate/12" />
            </div>
            <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(16,24,32,0.96),rgba(16,24,32,0.92))] p-6 md:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">
                {featuredStory.eyebrow}
              </p>
              <h3 className="mt-3 max-w-lg font-display text-[1.65rem] font-medium leading-[1.08] tracking-tight text-white md:text-[1.95rem]">
                {featuredStory.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/82">
                {featuredStory.copy}
              </p>
            </div>
          </article>

          <div className="grid gap-5">
            {supportingStories.map((story) => (
              <SurfaceCard as="article" key={story.title} className="overflow-hidden">
                <div className="grid gap-0 sm:grid-cols-[1.52fr_0.48fr]">
                  <div className="relative aspect-[3/2] bg-shell">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-col justify-center px-4 py-4 md:px-5">
                    <h3 className="text-[0.92rem] font-semibold leading-[1.02] tracking-tight text-slate md:text-[1.02rem]">
                      {story.title}
                    </h3>
                    <p className="mt-2 text-[0.84rem] leading-5 text-slate/68">{story.copy}</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
