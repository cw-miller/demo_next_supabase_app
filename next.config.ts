import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents removed: incompatible with per-route `dynamic` / `revalidate` segment config.
  // Per-page caching is handled explicitly via route segment exports instead.
};

export default nextConfig;
