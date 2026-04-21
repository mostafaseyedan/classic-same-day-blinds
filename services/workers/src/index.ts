import "./load-env.js";

import { readWorkerEnv } from "@blinds/config";

const workerEnv = readWorkerEnv(process.env);

const workerJobs = [
  "competitor-price-refresh",
  "quote-review-processing",
  "review-sync",
  "notification-retries",
] as const;

async function waitForOpsApi(maxAttempts = 20, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${workerEnv.opsApiBaseUrl}/health`);

      if (response.ok) {
        if (attempt > 1) {
          console.log(`[workers] ops-api became ready after ${attempt} attempts`);
        }

        return true;
      }
    } catch {
      // Keep retrying until the API is up.
    }

    if (attempt < maxAttempts) {
      console.log(`[workers] waiting for ops-api (${attempt}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error("[workers] ops-api did not become ready before refresh startup");
  return false;
}

async function waitForMedusa(maxAttempts = 60, delayMs = 1500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${workerEnv.medusaBackendUrl}/health`);

      if (response.ok) {
        if (attempt > 1) {
          console.log(`[workers] medusa became ready after ${attempt} attempts`);
        }

        return true;
      }
    } catch {
      // Keep retrying until Medusa is up.
    }

    if (attempt < maxAttempts) {
      console.log(`[workers] waiting for medusa (${attempt}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.error("[workers] medusa did not become ready before refresh startup");
  return false;
}

async function runCompetitorRefresh() {
  try {
    const response = await fetch(`${workerEnv.opsApiBaseUrl}/api/v1/competitor-pricing/refresh`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`refresh failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      refresh: { id: string; status: string; matchesChecked: number; alertsRaised: number };
    };

    console.log("[workers] competitor pricing refresh completed");
    console.log(
      JSON.stringify(
        {
          refreshId: payload.refresh.id,
          status: payload.refresh.status,
          matchesChecked: payload.refresh.matchesChecked,
          alertsRaised: payload.refresh.alertsRaised,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error("[workers] competitor pricing refresh failed");
    console.error(error);
  }
}

async function runNotificationProcessing() {
  try {
    const response = await fetch(`${workerEnv.opsApiBaseUrl}/api/v1/notifications/process`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`notification processing failed with ${response.status}`);
    }

    const payload = (await response.json()) as { processed: number };
    console.log(`[workers] notification processing completed (${payload.processed} items)`);
  } catch (error) {
    console.error("[workers] notification processing failed");
    console.error(error);
  }
}

console.log("[workers] worker service started");
console.log("[workers] registered jobs:", workerJobs.join(", "));

void (async () => {
  const opsReady = await waitForOpsApi();

  if (!opsReady) {
    return;
  }

  const medusaReady = await waitForMedusa();

  if (!medusaReady) {
    return;
  }

  await runCompetitorRefresh();
  await runNotificationProcessing();
})();

if (workerEnv.nodeEnv !== "test") {
  setInterval(() => {
    void runCompetitorRefresh();
  }, workerEnv.refreshIntervalMs).unref();

  setInterval(() => {
    void runNotificationProcessing();
  }, workerEnv.notificationIntervalMs).unref();
}
