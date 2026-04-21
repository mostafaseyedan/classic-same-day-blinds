import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(currentDir, "../../../.env");
const serviceEnvPath = resolve(currentDir, "../.env");

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: serviceEnvPath, override: true });
