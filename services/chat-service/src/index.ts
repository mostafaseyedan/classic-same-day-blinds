import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({
  logger: true,
});

const chatSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1),
  customerId: z.string().optional(),
});

app.get("/health", async () => {
  return {
    service: "chat-service",
    status: "ok",
    provider: process.env.LLM_PROVIDER || "vertex-ai",
  };
});

app.post("/api/v1/chat/respond", async (request, reply) => {
  const parsed = chatSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      error: "Invalid chat payload",
      details: parsed.error.flatten(),
    });
  }

  return {
    role: "assistant",
    message:
      "Chat service scaffold is active. Next steps are retrieval wiring, Medusa product tools, FAQ grounding, and human escalation flows.",
    source: "placeholder",
    sessionId: parsed.data.sessionId,
  };
});

const port = Number(process.env.PORT || 4100);
const host = process.env.HOST || "0.0.0.0";

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
