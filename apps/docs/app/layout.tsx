import { siteDescription, siteName, siteUrl } from "@/lib/site";
import {
  CookieConsent,
  consentHeadScript,
  gtmNoScriptSrc,
} from "@plainconceptsplatform/ui-components/cookie-consent";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";

/** Google Tag Manager container for the public Platform sites. */
const GTM_ID = "GTM-T2QXWRBW";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a constant built from GTM_ID; consent defaults must be set before GTM loads */}
        <script dangerouslySetInnerHTML={{ __html: consentHeadScript(GTM_ID) }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <noscript>
          <iframe
            src={gtmNoScriptSrc(GTM_ID)}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
