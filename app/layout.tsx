import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "What is Base for?",
  description: "A fully onchain collection of base spirits",
  openGraph: {
    title: "What is Base for?",
    description: "A fully onchain collection of base spirits",
    siteName: "What is Base for?",
    images: [
      {
        url: "/og_600x400.webp",
        width: 600,
        height: 400,
        alt: "What is Base for? - Base collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Base for?",
    description: "A fully onchain collection of base spirits",
    images: ["/og_600x400.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
