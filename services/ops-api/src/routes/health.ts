import type { FastifyInstance } from "fastify";
import type { HealthCheckResponse } from "@blinds/types";

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/health", async (): Promise<HealthCheckResponse> => {
    return {
      service: "ops-api",
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });
}
