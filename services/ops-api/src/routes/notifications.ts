import type { FastifyInstance } from "fastify";

import { listNotifications, processPendingNotifications } from "../lib/notifications-store.js";

export async function registerNotificationRoutes(app: FastifyInstance) {
  app.get("/api/v1/notifications", async () => {
    return {
      notifications: await listNotifications(),
    };
  });

  app.post("/api/v1/notifications/process", async (request, reply) => {
    const result = await processPendingNotifications();

    return reply.status(202).send({
      accepted: true,
      queue: "notifications",
      ...result,
    });
  });
}
