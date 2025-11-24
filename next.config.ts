import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@onchainfi/connect"],
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
};

export default nextConfig;
