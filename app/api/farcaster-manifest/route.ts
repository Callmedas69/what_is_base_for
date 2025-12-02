import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjIyNDIwLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NmU1RDE3NGQ3MjYxOUFFNDUxMzE2OThhZjMwREYxZDc3M0UwZENCMyJ9",
      payload: "eyJkb21haW4iOiJiYXNlZm9yLmdlb2FydC5zdHVkaW8ifQ",
      signature: "zxV3PvzKqV3Og7itSgj4YolLLl5HMpFuQXf2aDGzE1AvuBVIP6s7n0snEZCStQmnGG9kDW2DJacnw3hrbnCNgxs=",
    },
    baseBuilder: {
      ownerAddress: "0xdc41d6DA6Bb2D02b19316B2bfFF0CBb42606484d",
    },
    miniapp: {
      version: "1",
      name: "What is Base for?",
      homeUrl: APP_URL,
      iconUrl: `${APP_URL}/icon_1024x1024.png`,
      splashImageUrl: `${APP_URL}/splash_200x200.png`,
      splashBackgroundColor: "#ffffff",

      // Metadata for discoverability
      subtitle: "A fully onchain collection",
      description: "Turns words into identity, and phrases into home",
      primaryCategory: "social",
      tags: ["nft", "base", "onchain", "mint", "art"],

      // Visual assets
      heroImageUrl: `${APP_URL}/ogHero_1200x630.webp`,
      tagline: "Your Base, Your Story",

      // OpenGraph metadata
      ogTitle: "What is Base for?",
      ogDescription: "Turns words into identity, and phrases into home",
      ogImageUrl: `${APP_URL}/ogHero_1200x630.webp`,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
