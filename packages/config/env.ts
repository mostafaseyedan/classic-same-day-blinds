export const requiredProductionEnv = [
  "DATABASE_URL",
  "REDIS_URL",
  "STRIPE_SECRET_KEY",
  "JWT_SECRET",
  "COOKIE_SECRET",
] as const;

type EnvMap = Record<string, string | undefined>;

function requireEnv(env: EnvMap, key: string) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function optionalEnv(env: EnvMap, key: string, fallback?: string) {
  return env[key] ?? fallback;
}

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseList(value: string | undefined, fallback: string[]) {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export interface StorefrontPublicEnv {
  medusaBackendUrl: string;
  medusaPublishableKey?: string;
  stripePublishableKey?: string;
  opsApiUrl: string;
  chatServiceUrl?: string;
}

export interface OpsApiEnv {
  nodeEnv: string;
  host: string;
  port: number;
  allowedOrigins: string[];
  databaseUrl: string;
  medusaBackendUrl: string;
  storefrontUrl: string;
  medusaPublishableKey?: string;
  medusaAdminEmail?: string;
  medusaAdminPassword?: string;
  stripeSecretKey?: string;
  resendApiKey?: string;
  emailFrom: string;
  emailAdminRecipients: string[];
  internalApiSecret?: string;
}

export interface CommerceEnv {
  nodeEnv: string;
  databaseUrl: string;
  redisUrl: string;
  backendUrl: string;
  jwtSecret: string;
  cookieSecret: string;
  storeCors: string[];
  adminCors: string[];
  authCors: string[];
  adminPath: string;
}

export interface WorkerEnv {
  nodeEnv: string;
  opsApiBaseUrl: string;
  medusaBackendUrl: string;
  refreshIntervalMs: number;
  notificationIntervalMs: number;
}

export function readStorefrontPublicEnv(env: EnvMap = process.env): StorefrontPublicEnv {
  return {
    medusaBackendUrl: optionalEnv(env, "NEXT_PUBLIC_MEDUSA_BACKEND_URL", "http://localhost:9000")!,
    medusaPublishableKey: optionalEnv(env, "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"),
    stripePublishableKey: optionalEnv(env, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    opsApiUrl: optionalEnv(env, "NEXT_PUBLIC_OPS_API_URL", "http://localhost:4000")!,
    chatServiceUrl: optionalEnv(env, "NEXT_PUBLIC_CHAT_SERVICE_URL"),
  };
}

export function readOpsApiEnv(env: EnvMap = process.env): OpsApiEnv {
  return {
    nodeEnv: optionalEnv(env, "NODE_ENV", "development")!,
    host: optionalEnv(env, "OPS_API_HOST", optionalEnv(env, "HOST", "0.0.0.0"))!,
    port: parseNumber(optionalEnv(env, "OPS_API_PORT", optionalEnv(env, "PORT")), 4000),
    allowedOrigins: parseList(
      optionalEnv(env, "OPS_API_ALLOWED_ORIGINS"),
      [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:9000",
      ],
    ),
    databaseUrl: optionalEnv(
      env,
      "OPS_DATABASE_URL",
      optionalEnv(env, "DATABASE_URL", "postgres://postgres:postgres@localhost:5432/blinds_commerce"),
    )!,
    medusaBackendUrl: optionalEnv(
      env,
      "MEDUSA_BACKEND_URL",
      optionalEnv(env, "NEXT_PUBLIC_MEDUSA_BACKEND_URL", "http://localhost:9000"),
    )!,
    storefrontUrl: optionalEnv(env, "STOREFRONT_URL", "http://localhost:3000")!,
    medusaPublishableKey: optionalEnv(
      env,
      "MEDUSA_PUBLISHABLE_KEY",
      optionalEnv(env, "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"),
    ),
    medusaAdminEmail: optionalEnv(env, "MEDUSA_ADMIN_EMAIL"),
    medusaAdminPassword: optionalEnv(env, "MEDUSA_ADMIN_PASSWORD"),
    stripeSecretKey: optionalEnv(env, "STRIPE_SECRET_KEY"),
    resendApiKey: optionalEnv(env, "RESEND_API_KEY"),
    emailFrom: optionalEnv(env, "EMAIL_FROM", "orders@classicsamedayblinds.local")!,
    emailAdminRecipients: parseList(
      optionalEnv(env, "EMAIL_ADMIN_RECIPIENTS"),
      ["ops@classicsamedayblinds.local"],
    ),
    internalApiSecret: optionalEnv(env, "INTERNAL_API_SECRET"),
  };
}

export function readCommerceEnv(env: EnvMap = process.env): CommerceEnv {
  return {
    nodeEnv: optionalEnv(env, "NODE_ENV", "development")!,
    databaseUrl: requireEnv(env, "DATABASE_URL"),
    redisUrl: requireEnv(env, "REDIS_URL"),
    backendUrl: optionalEnv(env, "MEDUSA_BACKEND_URL", "http://localhost:9000")!,
    jwtSecret: requireEnv(env, "JWT_SECRET"),
    cookieSecret: requireEnv(env, "COOKIE_SECRET"),
    storeCors: parseList(optionalEnv(env, "STORE_CORS"), ["http://localhost:3000"]),
    adminCors: parseList(optionalEnv(env, "ADMIN_CORS"), ["http://localhost:9000"]),
    authCors: parseList(optionalEnv(env, "AUTH_CORS"), [
      "http://localhost:3000",
      "http://localhost:9000",
    ]),
    adminPath: optionalEnv(env, "MEDUSA_ADMIN_PATH", "/app")!,
  };
}

export function readWorkerEnv(env: EnvMap = process.env): WorkerEnv {
  return {
    nodeEnv: optionalEnv(env, "NODE_ENV", "development")!,
    opsApiBaseUrl: optionalEnv(env, "OPS_API_BASE_URL", "http://localhost:4000")!,
    medusaBackendUrl: optionalEnv(
      env,
      "MEDUSA_BACKEND_URL",
      optionalEnv(env, "NEXT_PUBLIC_MEDUSA_BACKEND_URL", "http://localhost:9000"),
    )!,
    refreshIntervalMs: parseNumber(optionalEnv(env, "WORKER_REFRESH_INTERVAL_MS"), 15 * 60 * 1000),
    notificationIntervalMs: parseNumber(
      optionalEnv(env, "WORKER_NOTIFICATION_INTERVAL_MS"),
      60 * 1000,
    ),
  };
}

export function assertRequiredProductionEnv(env: EnvMap = process.env) {
  if ((env.NODE_ENV ?? "development") !== "production") {
    return;
  }

  requiredProductionEnv.forEach((key) => requireEnv(env, key));
}
