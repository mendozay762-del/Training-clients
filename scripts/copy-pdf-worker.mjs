// Copies pdfjs-dist's worker to public/ so the QuestionnaireViewer can load
// it from the same origin. Runs in postinstall; idempotent.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const projectRoot = dirname(fileURLToPath(import.meta.url)) + "/..";
const publicDir = join(projectRoot, "public");

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

let src;
try {
  src = require.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
} catch {
  console.warn("[copy-pdf-worker] pdfjs-dist not installed yet, skipping");
  process.exit(0);
}

const dst = join(publicDir, "pdf.worker.min.mjs");
copyFileSync(src, dst);
console.log(`[copy-pdf-worker] ${src} -> ${dst}`);
