import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};