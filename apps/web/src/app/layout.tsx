import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WalletProviderShell } from "@/components/wallet-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PrivateDAO Next Surface",
    template: "%s",
  },
  description:
    "Next.js migration for PrivateDAO: private governance, confidential treasury execution, runtime trust, and buyer-facing service surfaces on Solana.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_LIVE_SITE_URL ?? "https://x-pact.github.io/PrivateDAO/"),
  openGraph: {
    title: "PrivateDAO Next Surface",
    description:
      "Private governance, confidential treasury execution, runtime trust, and buyer-facing service surfaces on Solana.",
    siteName: "PrivateDAO",
    type: "website",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "PrivateDAO Next Surface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrivateDAO Next Surface",
    description:
      "Private governance, confidential treasury execution, runtime trust, and buyer-facing service surfaces on Solana.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#030510] text-white">
        <WalletProviderShell>
          <div className="relative flex min-h-full flex-col overflow-x-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(153,69,255,0.28),transparent_44%),radial-gradient(circle_at_20%_20%,rgba(20,241,149,0.2),transparent_26%),radial-gradient(circle_at_80%_0%,rgba(0,194,255,0.18),transparent_28%)]" />
            <SiteHeader />
            <div className="relative z-10 flex-1">{children}</div>
            <SiteFooter />
          </div>
        </WalletProviderShell>
      </body>
    </html>
  );
}
