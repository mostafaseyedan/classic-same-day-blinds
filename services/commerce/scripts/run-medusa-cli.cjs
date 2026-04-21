const Module = require("node:module");
const path = require("node:path");

// Force quit on termination signals to prevent Medusa graceful shutdown hangs
// when running under concurrently in local development.
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`\n[commerce] Received ${signal}. Forcefully exiting CLI wrapper to prevent hang...`);
    process.exit(0);
  });
});

const workspaceRoot = path.resolve(__dirname, "..");
const rootNodeModules = path.resolve(workspaceRoot, "..", "..", "node_modules");
const workspaceNodeModules = path.join(workspaceRoot, "node_modules");

process.env.NODE_PATH = [workspaceNodeModules, rootNodeModules, process.env.NODE_PATH]
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

const cliEntry = require.resolve("@medusajs/cli/dist/index.js", {
  paths: [workspaceRoot],
});

process.argv = [process.argv[0], cliEntry, ...process.argv.slice(2)];

require(cliEntry);
