import type { NextConfig } from "next";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

// Load the monorepo root .env into process.env before Next.js processes anything.
// envDir alone doesn't guarantee vars are in process.env when server components run.
const repoRoot = path.resolve(process.cwd(), "../../");
loadDotenv({ path: path.join(repoRoot, ".env"), override: false });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
  transpilePackages: ["@blinds/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
