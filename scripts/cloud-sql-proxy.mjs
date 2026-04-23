#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const proxyVersion = "2.19.0";
const proxyBinary = "/tmp/blinds-cloud-sql-proxy";
const stateDir = "/tmp/blinds-cloud-sql-proxy-state";
const pidFile = path.join(stateDir, "proxy.pid.json");
const logFile = path.join(stateDir, "proxy.log");

const config = {
  instance: process.env.CLOUD_SQL_CONNECTION_NAME ?? "classic-same-day-blinds:us-central1:blinds-postgres",
  host: process.env.CLOUD_SQL_PROXY_ADDRESS ?? "127.0.0.1",
  port: Number(process.env.CLOUD_SQL_PROXY_PORT ?? "5432"),
};

function ensureStateDir() {
  fs.mkdirSync(stateDir, { recursive: true });
}

function readState() {
  if (!fs.existsSync(pidFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(pidFile, "utf8"));
  } catch {
    return null;
  }
}

function removeState() {
  fs.rmSync(pidFile, { force: true });
}

function isAlive(pid) {
  if (!pid) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function downloadProxy() {
  if (fs.existsSync(proxyBinary)) {
    return;
  }

  console.log("Downloading Cloud SQL Auth Proxy...");
  const url = `https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v${proxyVersion}/cloud-sql-proxy.linux.amd64`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download Cloud SQL Auth Proxy: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(proxyBinary, bytes, { mode: 0o755 });
}

function waitForPort(port, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tryConnect = async () => {
      const net = await import("node:net");
      const socket = net.createConnection({ host: config.host, port });

      const done = (err) => {
        socket.removeAllListeners();
        socket.destroy();

        if (!err) {
          resolve();
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          reject(new Error(`Timed out waiting for Cloud SQL proxy on ${config.host}:${port}`));
          return;
        }

        setTimeout(() => {
          void tryConnect();
        }, 500);
      };

      socket.once("connect", () => done(null));
      socket.once("error", done);
      socket.setTimeout(1000, () => done(new Error("timeout")));
    };

    void tryConnect();
  });
}

async function up() {
  ensureStateDir();
  const existing = readState();

  if (existing?.pid && isAlive(existing.pid)) {
    if (
      existing.host === config.host &&
      existing.port === config.port &&
      existing.instance === config.instance
    ) {
      console.log(`Cloud SQL proxy already running on ${config.host}:${config.port} (pid ${existing.pid})`);
      return;
    }

    try {
      process.kill(existing.pid, "SIGTERM");
    } catch {
      // ignore stale pid
    }

    removeState();
  }

  await downloadProxy();
  fs.writeFileSync(logFile, "", "utf8");

  const out = fs.openSync(logFile, "a");
  const child = spawn(
    proxyBinary,
    ["--address", config.host, "--port", String(config.port), config.instance],
    {
      detached: true,
      stdio: ["ignore", out, out],
    },
  );

  child.unref();

  fs.writeFileSync(
    pidFile,
    JSON.stringify(
      {
        pid: child.pid,
        startedAt: new Date().toISOString(),
        host: config.host,
        port: config.port,
        instance: config.instance,
      },
      null,
      2,
    ),
  );

  await waitForPort(config.port);
  console.log(`Cloud SQL proxy ready on ${config.host}:${config.port}`);
}

function down() {
  const existing = readState();

  if (!existing?.pid) {
    console.log("Cloud SQL proxy is not running.");
    return;
  }

  try {
    process.kill(existing.pid, "SIGTERM");
  } catch {
    // ignore stale pid
  }

  removeState();
  console.log("Stopped Cloud SQL proxy.");
}

function logs() {
  const existing = readState();
  console.log(`Proxy pid: ${existing?.pid ?? "not running"}`);
  console.log(`Target: ${config.instance}`);
  console.log(`Address: ${config.host}:${config.port}`);

  if (!fs.existsSync(logFile)) {
    console.log("\n(no proxy log file yet)");
    return;
  }

  const content = fs.readFileSync(logFile, "utf8").trim();
  console.log(`\n== Cloud SQL proxy log ==\n${content || "(empty)"}`);
}

const command = process.argv[2] ?? "up";

try {
  if (command === "up") {
    await up();
  } else if (command === "down") {
    down();
  } else if (command === "logs") {
    logs();
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
