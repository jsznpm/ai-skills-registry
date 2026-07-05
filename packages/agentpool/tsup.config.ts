import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  platform: "node",
  clean: true,
  minify: false,
  banner: { js: "#!/usr/bin/env node" },
  external: [
    "react",
    "react-dom",
    "ink",
    "react-devtools-core",
    "yoga-layout",
    "yoga-wasm-web",
  ],
});
