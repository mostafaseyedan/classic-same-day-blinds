import path from "node:path";
import { defineConfig, loadEnv } from "@medusajs/framework/utils";
import { readCommerceServiceEnv } from "./src/lib/env";

loadEnv(process.env.NODE_ENV || "development", process.cwd());
const env = readCommerceServiceEnv();

// ── File storage ──────────────────────────────────────────────────────────────
// Dev:  local filesystem — files in ./uploads/, served at /static/*
// Prod: GCS via S3-compatible API — set GCS_BUCKET_NAME + GCS_ACCESS_KEY_ID +
//       GCS_SECRET_ACCESS_KEY + GCS_REGION in the production environment.
const fileModule = process.env.GCS_BUCKET_NAME
  ? {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}`,
              access_key_id: process.env.GCS_ACCESS_KEY_ID,
              secret_access_key: process.env.GCS_SECRET_ACCESS_KEY,
              region: process.env.GCS_REGION ?? "auto",
              bucket: process.env.GCS_BUCKET_NAME,
              endpoint: "https://storage.googleapis.com",
            },
          },
        ],
      },
    }
  : {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              backend_url: `${env.backendUrl}/static`,
            },
          },
        ],
      },
    };

const paymentModule = process.env.STRIPE_SECRET_KEY
  ? {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_SECRET_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    }
  : null;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: env.databaseUrl,
    redisUrl: env.redisUrl,
    http: {
      storeCors: env.storeCors.join(","),
      adminCors: env.adminCors.join(","),
      authCors: env.authCors.join(","),
      jwtSecret: env.jwtSecret,
      cookieSecret: env.cookieSecret,
    },
  },
  modules: [
    fileModule,
    ...(paymentModule ? [paymentModule] : []),
  ],
  admin: {
    path: env.adminPath,
    backendUrl: env.backendUrl,
    // Stub the draft-order admin plugin to avoid react-router context bug in @medusajs/draft-order@2.13.5
    vite: () => ({
      resolve: {
        alias: {
          "@medusajs/draft-order/admin": path.resolve(
            __dirname,
            "src/admin/draft-order-stub.mjs",
          ),
        },
      },
    }),
  },
});
