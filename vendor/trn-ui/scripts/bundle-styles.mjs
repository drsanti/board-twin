import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(root, "dist");
mkdirSync(distDir, { recursive: true });

const parts = [
  resolve(root, "src/theme/trn-theme.css"),
  resolve(root, "src/TRNFloatingNotice.css"),
  resolve(root, "src/pie-menu/pie-menu.css"),
];

writeFileSync(
  resolve(distDir, "styles.css"),
  parts.map((path) => readFileSync(path, "utf8")).join("\n\n"),
);
