import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

function setCorsHeaders(
  request: FastifyRequest,
  reply: FastifyReply,
  allowedOrigins: Set<string>,
) {
  const origin = request.headers.origin;

  if (!origin) {
    return;
  }

  if (allowedOrigins.has(origin) || allowedOrigins.has("*")) {
    reply.header("Access-Control-Allow-Origin", origin);
    reply.header("Vary", "Origin");
  }
}

export function registerCors(app: FastifyInstance, allowedOrigins: string[]) {
  const origins = new Set(allowedOrigins);

  app.addHook("onRequest", async (request, reply) => {
    setCorsHeaders(request, reply, origins);
    reply.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      return reply.status(204).send();
    }
  });
}
