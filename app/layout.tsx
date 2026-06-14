import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import "./globals.css";

// Canonical origin for absolute OG/Twitter image URLs. Prefer an explicit env
// var; otherwise use Vercel's production URL, falling back to the live deploy.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://expense-approval-teal.vercel.app");

const description =
  "Multi-tenant expense approvals with authorization enforced in the database. Request, review, decide — secure by default, responsive on any device.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "approvals — expense requests",
    template: "%s · approvals",
  },
  description,
  applicationName: "approvals",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "approvals",
    title: "approvals — expense requests",
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "approvals — expense requests",
    description,
  },
  // `og:logo` is not part of the typed OpenGraph spec, so emit it manually as an
  // absolute URL for validators/crawlers that look for it.
  other: {
    "og:logo": `${siteUrl}/icon.svg`,
  },
};

// viewport-fit=cover lets us pad against the notch / home indicator with env().
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf9f6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="preconnect"
          href="https://db.onlinewebfonts.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-cream text-ink antialiased">
        {process.env.NODE_ENV === "development" ? (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        ) : null}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
