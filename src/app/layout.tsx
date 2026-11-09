import type { Metadata, Viewport } from "next";
import { site } from "@/config/site";
import { MotionGate } from "@/components/ui/MotionGate";
import { body, display } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · Refugio natural en Pucallpa`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: `${site.name} · Refugio natural en Pucallpa`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · Refugio natural en Pucallpa`,
    description: site.description,
  },
  robots: site.allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#203A2C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${display.variable} ${body.variable}`}>
      <body>
        <MotionGate />
        {children}
      </body>
    </html>
  );
}
