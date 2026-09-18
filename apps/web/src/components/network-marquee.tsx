/* eslint-disable @next/next/no-img-element -- tiny third-party brand marks stay unoptimized to keep the ticker lightweight. */

const networks = [
  ["Solana", "https://solana.com/", "https://cdn.simpleicons.org/solana"],
  ["Ethereum", "https://ethereum.org/", "https://cdn.simpleicons.org/ethereum"],
  ["Arbitrum", "https://arbitrum.io/", "https://arbitrum.io/favicon.ico"],
  ["Base", "https://www.base.org/", "https://www.base.org/favicon.ico"],
  ["Tempo", "https://docs.tempo.xyz/", "https://tempo.xyz/favicon.ico"],
  ["Zcash", "https://zcash.readthedocs.io/", "https://cdn.simpleicons.org/zcash"],
  ["Hyperliquid", "https://hyperliquid.gitbook.io/hyperliquid-docs/", "https://app.hyperliquid.xyz/favicon.ico"],
  ["Robinhood Chain", "https://docs.robinhood.com/chain/", "https://robinhood.com/favicon.ico"],
] as const;

function NetworkSet() {
  return (
    <div className="flex shrink-0 items-center gap-3 px-2">
      {networks.map(([name, href, logo]) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
          title={name}
          className="inline-flex h-10 w-14 items-center justify-center rounded-full border border-[#dce5f0] bg-white px-3 transition hover:border-[#175cd3] hover:shadow-[0_4px_14px_rgba(23,92,211,0.12)]"
        >
          <img src={logo} alt="" aria-hidden="true" className="h-5 w-5 object-contain" loading="lazy" />
        </a>
      ))}
    </div>
  );
}

export function NetworkMarquee() {
  return (
    <section aria-label="Supported networks" className="border-y border-[#dce5f0] bg-[#fbfcfe] py-3">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7a8ba0] sm:block">
          Supported networks
        </div>
        <div className="network-marquee min-w-0 overflow-hidden">
          <div className="network-marquee-track">
            <NetworkSet />
            <NetworkSet />
          </div>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-7xl px-4 text-[11px] text-[#7a8ba0] sm:px-6 lg:px-8">
        Availability depends on the selected solution and deployment.
      </p>
    </section>
  );
}
