import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const farcasterEmbed = {
  version: "1",
  imageUrl: `${APP_URL}/embed_1200x800.webp`,
  button: {
    title: "Open App",
    action: {
      type: "launch_frame",
      name: "What is Base for?",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash_200x200.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const metadata: Metadata = {
  title: "What is Base for?",
  description: "A fully onchain collection of base spirits",
  openGraph: {
    title: "What is Base for?",
    description: "A fully onchain collection of base spirits",
    siteName: "What is Base for?",
    images: [
      {
        url: "/ogHero_1200x630.webp",
        width: 1200,
        height: 630,
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
    images: ["/ogHero_1200x630.webp"],
  },
  other: {
    "fc:miniapp": JSON.stringify(farcasterEmbed),
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
