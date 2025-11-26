import { NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET() {
  const manifest = {
    accountAssociation: {
      header: "SIGN_AT_FARCASTER_DEVELOPER_PORTAL",
      payload: "SIGN_AT_FARCASTER_DEVELOPER_PORTAL",
      signature: "SIGN_AT_FARCASTER_DEVELOPER_PORTAL",
    },
    frame: {
      version: "1",
      name: "What is Base for?",
      iconUrl: `${APP_URL}/icon_1024x1024.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/embed_1200x800.webp`,
      buttonTitle: "Open App",
      splashImageUrl: `${APP_URL}/splash_200x200.png`,
      splashBackgroundColor: "#ffffff",
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
