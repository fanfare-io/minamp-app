import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes("--watch");

// Build plugin (sandbox thread)
// Figma's plugin sandbox uses a restricted JS engine (QuickJS-based) that
// does NOT support optional chaining (?.) or nullish coalescing (??).
// Target es2017 to ensure esbuild transpiles those away.
const pluginConfig = {
  entryPoints: ["src/plugin/main.ts"],
  bundle: true,
  outfile: "dist/plugin.js",
  format: "iife",
  target: "es2017",
  platform: "browser",
  logLevel: "info",
};

// Build UI (iframe thread) — output JS, then inline into HTML
const uiConfig = {
  entryPoints: ["src/ui/index.tsx"],
  bundle: true,
  outfile: "dist/ui.js",
  format: "iife",
  target: "es2020",
  platform: "browser",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
  },
  logLevel: "info",
};

function buildHtml() {
  mkdirSync(join(__dirname, "dist"), { recursive: true });

  let jsContent = "";
  try {
    jsContent = readFileSync(join(__dirname, "dist/ui.js"), "utf-8");
  } catch {
    jsContent = "// UI not yet built";
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      color: var(--figma-color-text, #333);
      background: var(--figma-color-bg, #fff);
    }
    #root { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>${jsContent}</script>
</body>
</html>`;

  writeFileSync(join(__dirname, "dist/ui.html"), html);
  console.log("  dist/ui.html written");
}

async function build() {
  if (isWatch) {
    const pluginCtx = await esbuild.context(pluginConfig);
    const uiCtx = await esbuild.context({
      ...uiConfig,
      plugins: [
        {
          name: "rebuild-html",
          setup(build) {
            build.onEnd(() => buildHtml());
          },
        },
      ],
    });
    await Promise.all([pluginCtx.watch(), uiCtx.watch()]);
    console.log("Watching for changes...");
  } else {
    await Promise.all([
      esbuild.build(pluginConfig),
      esbuild.build(uiConfig),
    ]);
    buildHtml();
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
