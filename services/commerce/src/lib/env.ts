export interface CommerceServiceEnv {
  databaseUrl: string;
  redisUrl: string;
  storeCors: string[];
  adminCors: string[];
  authCors: string[];
  jwtSecret: string;
  cookieSecret: string;
  backendUrl: string;
  adminPath: `/${string}`;
  workerMode: "shared" | "server" | "worker";
  adminDisabled: boolean;
}

function requireValue(key: string, fallback?: string) {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new Error(`Missing required Medusa environment variable: ${key}`);
  }

  return value;
}

function parseCors(key: string, fallback: string) {
  return (process.env[key] ?? fallback)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function readCommerceServiceEnv(): CommerceServiceEnv {
  const workerMode = (process.env.MEDUSA_WORKER_MODE ??
    process.env.WORKER_MODE ??
    "shared") as CommerceServiceEnv["workerMode"];

  return {
    databaseUrl: requireValue("DATABASE_URL"),
    redisUrl: requireValue("REDIS_URL"),
    storeCors: parseCors("STORE_CORS", "http://localhost:3000"),
    adminCors: parseCors("ADMIN_CORS", "http://localhost:9000"),
    authCors: parseCors("AUTH_CORS", "http://localhost:3000,http://localhost:9000"),
    jwtSecret: requireValue("JWT_SECRET", "supersecret"),
    cookieSecret: requireValue("COOKIE_SECRET", "supersecret"),
    backendUrl: requireValue("MEDUSA_BACKEND_URL", "http://localhost:9000"),
    adminPath: requireValue("MEDUSA_ADMIN_PATH", "/app") as `/${string}`,
    workerMode,
    adminDisabled:
      process.env.DISABLE_MEDUSA_ADMIN === "true" ||
      process.env.ADMIN_DISABLED === "true",
  };
}
