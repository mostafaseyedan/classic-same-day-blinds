import { spawn } from "node:child_process";

function parseArgs(argv) {
  const args = {
    url: "",
    label: "service",
    timeoutMs: 180000,
    intervalMs: 1500,
    command: [],
  };

  const separatorIndex = argv.indexOf("--");
  const optionArgs = separatorIndex === -1 ? argv : argv.slice(0, separatorIndex);
  args.command = separatorIndex === -1 ? [] : argv.slice(separatorIndex + 1);

  for (let index = 0; index < optionArgs.length; index += 1) {
    const part = optionArgs[index];
    if (part === "--url") {
      args.url = optionArgs[index + 1] ?? "";
      index += 1;
    } else if (part === "--label") {
      args.label = optionArgs[index + 1] ?? args.label;
      index += 1;
    } else if (part === "--timeout-ms") {
      args.timeoutMs = Number(optionArgs[index + 1] ?? args.timeoutMs);
      index += 1;
    } else if (part === "--interval-ms") {
      args.intervalMs = Number(optionArgs[index + 1] ?? args.intervalMs);
      index += 1;
    }
  }

  return args;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHttp(url, label, timeoutMs, intervalMs) {
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt += 1;
    try {
      const response = await fetch(url);
      if (response.ok) {
        if (attempt > 1) {
          console.log(`[wait] ${label} became ready after ${attempt} attempts`);
        }
        return;
      }
    } catch {
      // Service is still starting.
    }

    console.log(`[wait] waiting for ${label} (${attempt})`);
    await sleep(intervalMs);
  }

  throw new Error(`${label} did not become ready before timeout: ${url}`);
}

async function main() {
  const { url, label, timeoutMs, intervalMs, command } = parseArgs(process.argv.slice(2));

  if (!url) {
    throw new Error("--url is required");
  }

  if (command.length === 0) {
    throw new Error("command is required after --");
  }

  await waitForHttp(url, label, timeoutMs, intervalMs);

  const child = spawn(command[0], command.slice(1), {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("[wait]", error instanceof Error ? error.message : String(error));
  process.exit(1);
});
