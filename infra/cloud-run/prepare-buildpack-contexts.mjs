import { mkdir, rm, writeFile, cp, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const outputRoot = path.join(repoRoot, ".cloudrun");
const contextFilter = process.argv[2] ?? null;

const basePackageJson = {
  private: true,
  version: "0.1.0",
  type: "module",
  packageManager: "npm@10.9.4",
  engines: {
    node: ">=22.0.0",
  },
};

const commerceSourcePkg = JSON.parse(
  await readFile(path.join(repoRoot, "services/commerce/package.json"), "utf8"),
);

const commercePackageJson = {
  name: commerceSourcePkg.name,
  private: commerceSourcePkg.private,
  version: commerceSourcePkg.version,
  type: commerceSourcePkg.type,
  engines: { node: ">=22.0.0" },
  scripts: {
    build: commerceSourcePkg.scripts["deploy:build"],
    predeploy: commerceSourcePkg.scripts["deploy:predeploy"],
    start: commerceSourcePkg.scripts["deploy:start"],
  },
  dependencies: {
    ...commerceSourcePkg.dependencies,
    "@blinds/types": "file:./packages/types",
  },
  devDependencies: commerceSourcePkg.devDependencies,
  overrides: commerceSourcePkg.overrides,
};

const contexts = [
  {
    name: "storefront",
    packageJson: {
      ...basePackageJson,
      name: "cloudrun-storefront",
      workspaces: [
        "apps/storefront",
        "packages/ui",
        "packages/types",
      ],
      scripts: {
        build: "npm run build -w @blinds/storefront",
        start: "node apps/storefront/.next/standalone/apps/storefront/server.js",
      },
    },
    procfile: "web: node apps/storefront/.next/standalone/apps/storefront/server.js\n",
    copyPaths: [
      "apps/storefront/package.json",
      "apps/storefront/next.config.ts",
      "apps/storefront/postcss.config.mjs",
      "apps/storefront/tailwind.config.ts",
      "apps/storefront/tsconfig.json",
      "apps/storefront/next-env.d.ts",
      "apps/storefront/public",
      "apps/storefront/src",
      "packages/ui/package.json",
      "packages/ui/src",
      "packages/types/package.json",
      "packages/types/src",
      "design-system",
    ],
  },
  {
    name: "commerce",
    procfile: "web: sh -c 'if [ \"$RUN_DB_MIGRATIONS\" = \"true\" ]; then npm run predeploy; fi && npm start'\n",
    checkedInLockfile: "commerce.package-lock.json",
    packageJson: commercePackageJson,
    flatCopyPaths: [
      { from: "services/commerce/medusa-config.ts", to: "medusa-config.ts" },
      { from: "services/commerce/tsconfig.json", to: "tsconfig.json" },
      { from: "services/commerce/tsconfig.admin.json", to: "tsconfig.admin.json" },
      { from: "services/commerce/src", to: "src" },
      { from: "services/commerce/public", to: "public" },
      { from: "packages/types", to: "packages/types" },
    ],
  },
  {
    name: "ops-api",
    packageJson: {
      ...basePackageJson,
      name: "cloudrun-ops-api",
      workspaces: [
        "services/ops-api",
        "packages/config",
        "packages/integrations",
        "packages/types",
      ],
      scripts: {
        build: [
          "npm run build -w @blinds/config",
          "npm run build -w @blinds/integrations",
          "npm run build -w @blinds/ops-api",
        ].join(" && "),
        start: "node services/ops-api/dist/index.js",
      },
    },
    procfile: "web: node services/ops-api/dist/index.js\n",
    copyPaths: [
      "services/ops-api/package.json",
      "services/ops-api/tsconfig.json",
      "services/ops-api/src",
      "packages/config/package.json",
      "packages/config/tsconfig.json",
      "packages/config/env.ts",
      "packages/integrations/package.json",
      "packages/integrations/tsconfig.json",
      "packages/integrations/src",
      "packages/types/package.json",
      "packages/types/src",
    ],
  },
];

async function copyRelative(srcRoot, destRoot, relativePath) {
  const source = path.join(srcRoot, relativePath);
  const destination = path.join(destRoot, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

async function copyFlat(srcRoot, destRoot, { from, to }) {
  const source = path.join(srcRoot, from);
  const destination = path.join(destRoot, to);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { recursive: true });
}

async function runCommand(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        npm_config_audit: "false",
        npm_config_fund: "false",
      },
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

if (contextFilter) {
  await rm(path.join(outputRoot, contextFilter), { recursive: true, force: true });
} else {
  await rm(outputRoot, { recursive: true, force: true });
}
await mkdir(outputRoot, { recursive: true });

for (const context of contexts) {
  if (contextFilter && context.name !== contextFilter) continue;

  const contextRoot = path.join(outputRoot, context.name);

  await mkdir(contextRoot, { recursive: true });
  await writeFile(
    path.join(contextRoot, "package.json"),
    `${JSON.stringify(context.packageJson, null, 2)}\n`,
  );
  await writeFile(path.join(contextRoot, "Procfile"), context.procfile);

  for (const relativePath of context.copyPaths ?? []) {
    await copyRelative(repoRoot, contextRoot, relativePath);
  }

  for (const entry of context.flatCopyPaths ?? []) {
    await copyFlat(repoRoot, contextRoot, entry);
  }

  if (context.checkedInLockfile) {
    await cp(path.join(__dirname, context.checkedInLockfile), path.join(contextRoot, "package-lock.json"));
  } else if (!context.skipLockfile) {
    await runCommand("npm", ["install", "--package-lock-only", "--ignore-scripts"], contextRoot);
  }
}
