import Link from "next/link";

type HeaderBrandProps = {
  mobile?: boolean;
  glass?: boolean;
};

export function HeaderBrand({ mobile = false, glass = false }: HeaderBrandProps) {
  const widths = mobile ? [10, 14, 18, 22] : [11, 17, 23];

  return (
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <div className="grid gap-1">
        {widths.map((width) => (
          <span
            key={width}
            className={`rounded-full transition-colors duration-500 ${glass ? "bg-[#4a8a6e] shadow-[0_1px_2px_rgba(255,255,255,0.1)]" : "bg-olive"} ${mobile ? "h-[3px]" : ""}`}
            style={{ width, height: mobile ? undefined : 4 }}
          />
        ))}
      </div>
      <div className="grid gap-0.5">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
            glass
              ? "text-[#c98b44] [text-shadow:0_1px_1px_rgba(0,0,0,0.38),0_0_12px_rgba(255,255,255,0.05)]"
              : "text-brass"
          }`}
        >
          Classic Same Day
        </p>
        <p className={`font-display text-xl font-semibold leading-none ${glass ? "text-white" : "text-slate"}`}>
          Blinds
        </p>
        <p
          className={`text-[10px] font-medium uppercase tracking-[0.16em] ${
            glass ? "text-white/72" : "text-slate/58"
          }`}
        >
          Since 1994
        </p>
      </div>
    </Link>
  );
}
