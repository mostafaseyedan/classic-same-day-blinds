const fs = require("node:fs");
const path = require("node:path");

const workspaceRoot = path.resolve(__dirname, "..");
const medusaPackageJson = require.resolve("@medusajs/medusa/package.json", {
  paths: [workspaceRoot],
});
const medusaRoot = path.dirname(medusaPackageJson);
const moduleDir = path.join(medusaRoot, "dist", "modules");
const cliPackageJson = require.resolve("@medusajs/cli/package.json", {
  paths: [workspaceRoot],
});
const cliRoot = path.dirname(cliPackageJson);

const files = [
  {
    path: path.join(moduleDir, "link-modules.js"),
    contents: `"use strict";

const linkModules = require("@medusajs/link-modules");

Object.assign(exports, linkModules);
exports.default = linkModules;
exports.discoveryPath = require.resolve("@medusajs/link-modules");
`,
  },
  {
    path: path.join(moduleDir, "link-modules.d.ts"),
    contents: `export * from "@medusajs/link-modules";
declare const _default: typeof import("@medusajs/link-modules");
export default _default;
export declare const discoveryPath: string;
`,
  },
  {
    path: path.join(cliRoot, "cli.js"),
    contents: `#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

try {
  require("ts-node").register({});

  const workspaceDir = process.cwd();
  const tsconfigPath = path.join(workspaceDir, "tsconfig.json");

  if (fs.existsSync(tsconfigPath)) {
    const tsconfigPaths = require("tsconfig-paths");
    const loaded = tsconfigPaths.loadConfig(workspaceDir);

    if (loaded.resultType === "success") {
      tsconfigPaths.register({
        baseUrl: loaded.absoluteBaseUrl,
        paths: loaded.paths,
      });
    }
  }
} catch (e) {
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    console.warn(
      "ts-node cannot be loaded and used, if you are running in production don't forget to set your NODE_ENV to production",
    );
    console.warn(e);
  }
}

require("dotenv").config();
require("./dist/index.js");
`,
  },
];

let wrote = false;

for (const file of files) {
  if (!fs.existsSync(file.path) || fs.readFileSync(file.path, "utf8") !== file.contents) {
    fs.writeFileSync(file.path, file.contents, "utf8");
    wrote = true;
  }
}

if (wrote) {
  process.stdout.write("Applied Medusa compatibility export fix\n");
}
