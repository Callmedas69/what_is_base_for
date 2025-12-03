"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Image from "next/image";

const PERSONAL_LINKS = [
  { name: "X", url: "https://x.com/0xdasx", icon: "/twitter_logo.svg" },
  { name: "Farcaster", url: "https://farcaster.xyz/0xd", icon: "/farcster_new_logo.svg" },
];

const GEOART_LINKS = [
  { name: "X", url: "https://x.com/geoart_studio", icon: "/twitter_logo.svg" },
  { name: "Farcaster", url: "https://farcaster.xyz/geoart", icon: "/farcster_new_logo.svg" },
];

export function ProfileBadge() {
  return (
    <HoverCard>
        <HoverCardTrigger asChild>
          <button className="text-sm font-medium text-[#5b616e] hover:text-[#0a0b0d] transition-colors">
            @0xdas
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-auto" side="top">
          <div className="flex gap-6">
            {/* Personal */}
            <div className="flex gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden shadow-md">
                <Image
                  src="/oxdas_avatar.png"
                  alt="0xdas"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">@0xdas</h4>
                <div className="flex gap-2 pt-1">
                  {PERSONAL_LINKS.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-4 w-4 opacity-70 hover:opacity-100"
                    >
                      <Image src={link.icon} alt={link.name} width={16} height={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-[#dee1e7]" />

            {/* GeoArt Studio */}
            <div className="flex gap-3">
              <div className="space-y-1 text-right">
                <h4 className="text-sm font-semibold">GeoArt Studio</h4>
                <div className="flex gap-2 pt-1 justify-end">
                  {GEOART_LINKS.map((link) => (
                    <a
                      key={`geoart-${link.name}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-4 w-4 opacity-70 hover:opacity-100"
                    >
                      <Image src={link.icon} alt={link.name} width={16} height={16} />
                    </a>
                  ))}
                </div>
              </div>
              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden shadow-md">
                <Image
                  src="/geoart_avatar.png"
                  alt="GeoArt Studio"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
  );
}
