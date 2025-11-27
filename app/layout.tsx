import type { Metadata } from "next";
import { FarcasterMiniAppProvider } from "@/contexts/FarcasterContext";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

const farcasterEmbed = {
  version: "1",
  imageUrl: `${APP_URL}/embed_1200x800.webp`,
  button: {
    title: "What is Base for?",
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
  metadataBase: new URL(APP_URL),
  title: "What is Base for?",
  description: "Turns words into identity, and phrases into home",
  openGraph: {
    title: "What is Base for?",
    description: "Turns words into identity, and phrases into home",
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
    description: "Turns words into identity, and phrases into home",
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
        <FarcasterMiniAppProvider>
          {children}
        </FarcasterMiniAppProvider>
      </body>
    </html>
  );
}
