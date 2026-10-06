import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.CF_PAGES === "1" ? { output: "export" as const } : {})
};

export default nextConfig;
