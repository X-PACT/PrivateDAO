export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#050816]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-white/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          PrivateDAO is a privacy-focused governance and treasury product on Solana with additive hardening, runtime evidence, and reviewer-ready proof surfaces.
        </div>
        <div className="flex flex-wrap gap-5">
          <a href="https://x-pact.github.io/PrivateDAO/?page=proof&judge=1" target="_blank" rel="noreferrer" className="hover:text-white">
            Judge view
          </a>
          <a href="https://github.com/X-PACT/PrivateDAO" target="_blank" rel="noreferrer" className="hover:text-white">
            Repository
          </a>
          <a href="https://x-pact.github.io/PrivateDAO/" target="_blank" rel="noreferrer" className="hover:text-white">
            Current live site
          </a>
        </div>
      </div>
    </footer>
  );
}
