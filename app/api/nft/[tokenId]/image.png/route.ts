import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { Resvg } from "@resvg/resvg-js";
import { WHATISBASEFOR_ABI } from "@/abi/WhatIsBaseFor.abi";
import { CONTRACTS } from "@/lib/config";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;

    // Validate tokenId
    if (!tokenId || isNaN(Number(tokenId))) {
      return new Response("Invalid tokenId", { status: 400 });
    }

    // Create viem client
    const client = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Fetch tokenURI from contract
    const tokenURI = await client.readContract({
      address: CONTRACTS.WHATISBASEFOR,
      abi: WHATISBASEFOR_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    if (!tokenURI || typeof tokenURI !== "string") {
      return new Response("Token not found", { status: 404 });
    }

    // Decode base64 JSON (format: data:application/json;base64,...)
    const base64Data = (tokenURI as string).split(",")[1];
    const jsonData = JSON.parse(Buffer.from(base64Data, "base64").toString());

    // Extract and decode image SVG (format: data:image/svg+xml;base64,...)
    if (!jsonData.image) {
      return new Response("Image not found in metadata", { status: 404 });
    }

    const svgBase64 = jsonData.image.split(",")[1];
    const svgString = Buffer.from(svgBase64, "base64").toString("utf-8");

    // Local TTF font paths for resvg (no system fonts on Vercel)
    const dotoFontPath = path.join(process.cwd(), "public", "fonts", "Doto-Medium.ttf");
    const robotoFontPath = path.join(process.cwd(), "public", "fonts", "Roboto-Regular.ttf");

    // Convert SVG to PNG using resvg with bundled fonts
    const resvg = new Resvg(svgString, {
      fitTo: {
        mode: "width",
        value: 512,
      },
      font: {
        fontFiles: [dotoFontPath, robotoFontPath],
        loadSystemFonts: false,
        defaultFontFamily: "Roboto",
      },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Return PNG with cache headers (immutable - NFT never changes)
    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating NFT image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
