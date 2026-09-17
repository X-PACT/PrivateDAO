const networks = [
  ["Solana", "https://solana.com/"],
  ["Ethereum", "https://ethereum.org/"],
  ["Arbitrum", "https://arbitrum.io/"],
  ["Base", "https://www.base.org/"],
  ["Tempo", "https://docs.tempo.xyz/"],
  ["Zcash", "https://zcash.readthedocs.io/"],
  ["Hyperliquid", "https://hyperliquid.gitbook.io/hyperliquid-docs/"],
  ["Robinhood Chain", "https://docs.robinhood.com/chain/"],
] as const;

function NetworkSet() {
  return (
    <div className="flex shrink-0 items-center gap-3 px-2">
      {networks.map(([name, href]) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce5f0] bg-white px-4 text-sm font-semibold text-[#425570] transition hover:border-[#175cd3] hover:text-[#175cd3]"
        >
          <span className="h-2 w-2 rounded-full bg-[#175cd3]" aria-hidden="true" />
          {name}
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
        Availability depends on the selected product and environment. Testnet and devnet access are shown before mainnet activation.
      </p>
    </section>
  );
}
