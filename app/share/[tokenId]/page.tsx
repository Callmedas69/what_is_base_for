import type { Metadata } from "next";
import { redirect } from "next/navigation";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

interface SharePageProps {
  params: Promise<{ tokenId: string }>;
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { tokenId } = await params;
  const imageUrl = `${APP_URL}/api/nft/${tokenId}/image.png`;

  return {
    title: `What is Base for? #${tokenId}`,
    description: "Turns words into identity, and phrases into home",
    openGraph: {
      title: `What is Base for? #${tokenId}`,
      description: "Turns words into identity, and phrases into home",
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: `Base For NFT #${tokenId}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `What is Base for? #${tokenId}`,
      description: "Turns words into identity, and phrases into home",
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  // Redirect to main app - metadata is already served for crawlers
  redirect("/");
}
