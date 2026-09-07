type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brand-bg" x1="120" y1="96" x2="904" y2="928" gradientUnits="userSpaceOnUse">
          <stop stopColor="#07121f" />
          <stop offset="0.48" stopColor="#081426" />
          <stop offset="1" stopColor="#030914" />
        </linearGradient>
        <linearGradient id="brand-stroke" x1="258" y1="210" x2="778" y2="790" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14F195" />
          <stop offset="0.48" stopColor="#00C2FF" />
          <stop offset="1" stopColor="#9945FF" />
        </linearGradient>
        <radialGradient
          id="brand-glow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(512 512) rotate(90) scale(420)"
        >
          <stop stopColor="#00C2FF" stopOpacity="0.24" />
          <stop offset="0.55" stopColor="#14F195" stopOpacity="0.13" />
          <stop offset="1" stopColor="#9945FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brand-delta-fill" x1="398" y1="282" x2="662" y2="752" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14F195" />
          <stop offset="0.5" stopColor="#00C2FF" />
          <stop offset="1" stopColor="#9945FF" />
        </linearGradient>
        <linearGradient id="brand-delta-edge" x1="428" y1="266" x2="690" y2="738" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C5FFF0" />
          <stop offset="0.35" stopColor="#91EAFF" />
          <stop offset="1" stopColor="#D1B1FF" />
        </linearGradient>
      </defs>

      <rect x="64" y="64" width="896" height="896" rx="248" fill="url(#brand-bg)" />
      <rect x="64" y="64" width="896" height="896" rx="248" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

      <circle cx="512" cy="512" r="344" fill="url(#brand-glow)" />
      <circle cx="512" cy="512" r="298" stroke="url(#brand-stroke)" strokeOpacity="0.6" strokeWidth="18" />
      <circle cx="512" cy="512" r="260" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />

      <path d="M512 268L696 744H328L512 268Z" fill="url(#brand-delta-fill)" fillOpacity="0.15" />
      <path d="M512 268L696 744H328L512 268Z" stroke="url(#brand-delta-edge)" strokeWidth="26" strokeLinejoin="round" />
      <path d="M512 268V744" stroke="url(#brand-delta-edge)" strokeWidth="18" strokeLinecap="round" opacity="0.96" />
      <path d="M428 522H596" stroke="url(#brand-delta-edge)" strokeWidth="18" strokeLinecap="round" opacity="0.88" />

      <path
        d="M436 408V378C436 338.235 468.235 306 508 306H516C555.765 306 588 338.235 588 378V408"
        stroke="rgba(255,255,255,0.34)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <rect x="430" y="404" width="164" height="128" rx="42" fill="rgba(3,9,20,0.72)" stroke="rgba(255,255,255,0.16)" strokeWidth="10" />
      <circle cx="512" cy="462" r="18" fill="url(#brand-stroke)" />
      <path d="M512 476V506" stroke="url(#brand-stroke)" strokeWidth="12" strokeLinecap="round" />

      <circle cx="256" cy="512" r="11" fill="#14F195" />
      <circle cx="768" cy="512" r="11" fill="#9945FF" />
      <circle cx="512" cy="256" r="11" fill="#00C2FF" />
      <circle cx="512" cy="768" r="11" fill="#14F195" />
    </svg>
  );
}
