import { PlayCircle } from "lucide-react";

type ProductVideoProps = {
  slug: string;
  title: string;
  description: string;
};

export function ProductVideo({ slug, title, description }: ProductVideoProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07101f] shadow-[0_24px_80px_rgba(0,0,0,0.28)]" aria-labelledby={`${slug}-video-title`}>
      <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative bg-black">
          <video
            className="aspect-video w-full object-cover"
            controls
            preload="metadata"
            playsInline
            poster={`/assets/product-videos/${slug}-poster.png`}
            aria-label={`${title} commercial overview`}
          >
            <source src={`/assets/product-videos/${slug}.mp4`} type="video/mp4" />
            Your browser does not support embedded video.
          </video>
          <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <PlayCircle className="h-3.5 w-3.5 text-cyan-300" />
            Product overview
          </div>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Watch the short version</div>
          <h2 id={`${slug}-video-title`} className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-3 text-sm leading-7 text-white/62">{description}</p>
          <div className="mt-5 text-xs leading-6 text-white/42">Plain-language overview. Technical verification details stay below the product surface.</div>
        </div>
      </div>
    </section>
  );
}
