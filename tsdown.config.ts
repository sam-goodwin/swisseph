import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: {
    build: true,
  },
  outDir: "lib",
  clean: true,
  external: [/\.wasm$/],
  onSuccess: async () => {
    await copyFile("src/swisseph.wasm", "lib/swisseph.wasm");
  },
});
