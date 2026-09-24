import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { AppShellProviders } from "@/components/app-shell-providers";
import { SiteActivityBeacon } from "@/components/site-activity-beacon";
import { SiteChrome } from "@/components/site-chrome";
import {
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
  defaultOgImage,
  siteDescription,
  siteKeywords,
  siteName,
  siteTitle,
  siteUrl,
} from "@/lib/site-brand";
import { JsonLd } from "@/components/seo-structured-data";
import { supportedLocales } from "@/lib/i18n";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingSiteVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s",
  },
  description: siteDescription,
  keywords: siteKeywords,
  metadataBase: new URL(`${siteUrl}/`),
  alternates: {
    canonical: "/",
    languages: Object.fromEntries(
      supportedLocales.map((locale) => [locale.code, `/?lang=${locale.code}`]),
    ),
  },
    applicationName: siteName,
    icons: {
      icon: [
      { url: "/assets/privatedao-brand-mark-20260918.jpeg", type: "image/jpeg" },
      { url: "/favicon.ico", type: "image/x-icon" },
      ],
    apple: [{ url: "/assets/privatedao-brand-mark-20260918.jpeg", type: "image/jpeg" }],
  },
  category: "technology",
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(bingSiteVerification
      ? { other: { "msvalidate.01": bingSiteVerification } }
      : {}),
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName,
    type: "website",
    url: "/",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [defaultOgImage],
  },
  other: {
    "content-language": supportedLocales.map((locale) => locale.code).join(", "),
    "ai-crawl": "allowed",
    "llms-txt": "/llms.txt",
    "llms-full": "/llms-full.txt",
    "llms-json": "/llms.json",
    "boot-txt": "/boot.txt",
    "boot-json": "/boot.json",
    "ai-manifest": "/ai.json",
    "evidence-manifest": "/evidence.json",
    "ownership-manifest": "/ownership.json",
    "rights-notice": "/rights.txt",
    "ai-guide": "/whitepaper/",
    "reviewer-entry": "/govern#live-dao",
    "product-surface":
      "PrivateDAO helps organizations keep payroll, treasury, governance, bids, and records private while making outcomes easier to trust.",
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
      className="h-full antialiased"
    >
      <body className="min-h-full bg-white text-[#10233f]">
        <AppShellProviders>
            <Script
              id="privatedao-domain-redirect"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(){var target='https://privatedao.org';var protocol=window.location.protocol;var host=window.location.hostname;var path=window.location.pathname;var search=window.location.search||'';var hash=window.location.hash||'';if(protocol==='http:'&&host==='privatedao.org'){window.location.replace(target+path+search+hash);return;}if(host==='www.privatedao.org'){window.location.replace(target+path+search+hash);return;}if(host==='x-pact.github.io'&&path.indexOf('/PrivateDAO')===0){var nextPath=path.replace(/^\\/PrivateDAO/,'')||'/';window.location.replace(target+nextPath+search+hash);}})();`,
              }}
            />
            <Script
              id="privatedao-next-asset-recovery"
              strategy="beforeInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(){var PARAM='__pd_reload';var KEY='privatedao-next-asset-recovery:'+(window.location.pathname||'/');function nextAsset(url){return typeof url==='string'&&url.indexOf('/_next/static/')!==-1;}function once(){try{if(window.sessionStorage.getItem(KEY)==='1'){return false;}window.sessionStorage.setItem(KEY,'1');return true;}catch(_){return true;}}function hardReload(){if(!once()){return;}var url=new URL(window.location.href);url.searchParams.set(PARAM,String(Date.now()));window.location.replace(url.toString());}function maybeRecover(value){var message='';if(typeof value==='string'){message=value;}else if(value&&typeof value.message==='string'){message=value.message;}else if(value&&typeof value.reason==='string'){message=value.reason;}if(message.indexOf('ChunkLoadError')!==-1||message.indexOf('Loading CSS chunk')!==-1||message.indexOf('Failed to fetch dynamically imported module')!==-1){hardReload();}}window.addEventListener('error',function(event){var target=event.target;if(target&&nextAsset(target.src||target.href)){hardReload();}},true);window.addEventListener('unhandledrejection',function(event){maybeRecover(event.reason);});if(window.location.search.indexOf(PARAM+'=')!==-1){window.addEventListener('load',function(){var url=new URL(window.location.href);url.searchParams.delete(PARAM);window.history.replaceState(window.history.state,'',url.toString());},{once:true});}})();`,
              }}
            />
            <JsonLd data={buildOrganizationJsonLd()} />
            <JsonLd data={buildWebSiteJsonLd()} />
            <JsonLd data={buildSoftwareApplicationJsonLd()} />
            <div className="relative flex min-h-full flex-col overflow-x-hidden">
              <SiteActivityBeacon />
              <SiteChrome>{children}</SiteChrome>
            </div>
        </AppShellProviders>
      </body>
    </html>
  );
}
