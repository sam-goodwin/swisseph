/**
 * Swiss Ephemeris WASM module loader
 *
 * Loads the WASM module and returns the raw SwissEphWasm interface.
 * Works in Bun, Node.js, browsers, and Cloudflare Workers.
 */

import type { SwissEphWasm } from "./generated/functions.js";
import wasmModule from "./swisseph.wasm";

export type { SwissEphWasm };

// Minimal WASI stubs for standalone WASM
const wasiStubs = {
  fd_close: () => 0,
  fd_fdstat_get: () => 0,
  fd_read: () => 0,
  fd_seek: () => 0,
  fd_write: () => 0,
  proc_exit: () => {},
  environ_get: () => 0,
  environ_sizes_get: () => 0,
};

const imports = {
  wasi_snapshot_preview1: wasiStubs,
  env: {
    emscripten_notify_memory_growth: () => {},
  },
};

/**
 * Load the Swiss Ephemeris WASM module.
 *
 * Returns the raw WASM exports - all function parameters that are pointers
 * in C become `number` (memory addresses) in TypeScript.
 *
 * Use the helper utilities from `./helpers.js` to work with memory.
 *
 * @example
 * ```ts
 * import { loadSwissEph } from "@jyoti/swisseph";
 * import { SE_SUN, SEFLG_SPEED } from "@jyoti/swisseph";
 *
 * const swe = await loadSwissEph();
 * const jd = swe.swe_julday(1990, 5, 15, 12.5, 1);
 *
 * // Allocate memory for results
 * const xxPtr = swe.malloc(6 * 8); // 6 doubles
 * const serrPtr = swe.malloc(256);
 *
 * const result = swe.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxPtr, serrPtr);
 *
 * // Read results from memory...
 * // (use helpers for convenience)
 *
 * swe.free(xxPtr);
 * swe.free(serrPtr);
 * ```
 */
export async function loadSwissEph(): Promise<SwissEphWasm> {
  let instance: WebAssembly.Instance;

  if (wasmModule instanceof WebAssembly.Module) {
    // Already a compiled WebAssembly.Module
    instance = await WebAssembly.instantiate(wasmModule, imports);
  } else if (typeof wasmModule === "string") {
    // File path (Bun)
    const fs = await import("node:fs/promises");
    const bytes = await fs.readFile(wasmModule);
    const result = await WebAssembly.instantiate(
      bytes as unknown as BufferSource,
      imports
    );
    instance = result.instance;
  } else if (
    // @ts-expect-error - ArrayBuffer check
    wasmModule instanceof ArrayBuffer ||
    ArrayBuffer.isView(wasmModule)
  ) {
    // Raw bytes
    const result = await WebAssembly.instantiate(wasmModule, imports);
    instance = result.instance;
  } else if (
    typeof wasmModule === "object" &&
    wasmModule !== null &&
    "memory" in wasmModule
  ) {
    // Already instantiated exports (vite-plugin-wasm)
    return wasmModule as unknown as SwissEphWasm;
  } else {
    throw new Error(`Unsupported WASM module type: ${typeof wasmModule}`);
  }

  return instance.exports as unknown as SwissEphWasm;
}
