type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.34em] text-emerald-300/80">{eyebrow}</div>
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="text-base leading-8 text-white/60 sm:text-lg">{description}</p>
    </div>
  );
}
