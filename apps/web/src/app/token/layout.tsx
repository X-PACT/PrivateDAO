import type { ReactNode } from "react";
import Script from "next/script";

export default function TokenLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script src="https://plugin.jup.ag/plugin-v1.js" strategy="afterInteractive" data-preload defer />
      {children}
    </>
  );
}
