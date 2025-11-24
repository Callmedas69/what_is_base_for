"use client";

interface ShareButtonsProps {
  text: string;
  url: string;
  imageUrl?: string;
  className?: string;
  size?: "sm" | "md";
}

export function ShareButtons({
  text,
  url,
  imageUrl,
  className = "",
  size = "md",
}: ShareButtonsProps) {
  // Twitter share URL (image preview via OpenGraph tags)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;

  // Farcaster share URL (with explicit image embed)
  const getFarcasterUrl = () => {
    const baseUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      text
    )}`;
    const embeds = [];

    if (imageUrl) {
      embeds.push(`embeds[]=${encodeURIComponent(imageUrl)}`);
    }
    embeds.push(`embeds[]=${encodeURIComponent(url)}`);

    return `${baseUrl}&${embeds.join("&")}`;
  };

  const farcasterUrl = getFarcasterUrl();

  const handleShare = (platform: "twitter" | "farcaster") => {
    const shareUrl = platform === "twitter" ? twitterUrl : farcasterUrl;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "p-2" : "p-2.5";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Twitter Share Button */}
      <button
        onClick={() => handleShare("twitter")}
        className={`${buttonSize} rounded-lg bg-[#0a0b0d] transition-all hover:scale-110 hover:bg-[#32353d]`}
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <svg
          className={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: "#ffffff" }}
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Farcaster Share Button */}
      <button
        onClick={() => handleShare("farcaster")}
        className={`${buttonSize} rounded-lg bg-[#8A63D2] transition-all hover:scale-110 hover:bg-[#9f7ee3]`}
        aria-label="Share on Farcaster"
        title="Share on Farcaster"
      >
        <svg
          className={iconSize}
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"
            fill="white"
          />
          <path
            d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
            fill="white"
          />
          <path
            d="M871.111 253.333L842.222 351.111H817.778V746.667C830.051 746.667 840 756.616 840 768.889V795.556H844.444C856.717 795.556 866.667 805.505 866.667 817.778V844.445H617.778V817.778C617.778 805.505 627.727 795.556 640 795.556H644.444V768.889C644.444 756.616 654.394 746.667 666.667 746.667H693.333V253.333H871.111Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
}
