import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "approvals — expense requests",
  description: "Request, review, and decide on company expenses.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://db.onlinewebfonts.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-cream text-ink antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
