import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: ["**/node_modules/**", "**/.next/**", "**/work/**"],
    };
    return config;
  },
};

export default nextConfig;
