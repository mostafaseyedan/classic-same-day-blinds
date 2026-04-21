import type { IntakeAcceptedResponse, OpsQueueName } from "@blinds/types";

export function buildAcceptedResponse<TPayload>(
  queue: OpsQueueName,
  payload: TPayload,
): IntakeAcceptedResponse<TPayload> {
  return {
    accepted: true,
    queue,
    referenceId: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    payload,
  };
}
