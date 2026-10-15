import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

export default {
  cacheDirectory: join(currentDirectory, ".cache", "puppeteer"),
};