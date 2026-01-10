/**
 * Swiss Ephemeris WASM module loader
 */

import wasmModule from "./swisseph.wasm";

// Raw exports from the WASM module
export interface SwissEphExports {
  memory: WebAssembly.Memory;
  malloc(size: number): number;
  free(ptr: number): void;
  swe_calc_ut(
    tjd_ut: number,
    ipl: number,
    iflag: number,
    xxPtr: number,
    serrPtr: number,
  ): number;
  swe_julday(
    year: number,
    month: number,
    day: number,
    hour: number,
    gregflag: number,
  ): number;
  swe_revjul(
    tjd: number,
    gregflag: number,
    yearPtr: number,
    monthPtr: number,
    dayPtr: number,
    hourPtr: number,
  ): void;
  swe_houses_ex(
    tjd_ut: number,
    iflag: number,
    geolat: number,
    geolon: number,
    hsys: number,
    cuspsPtr: number,
    ascmcPtr: number,
  ): number;
  swe_set_sid_mode(sid_mode: number, t0: number, ayan_t0: number): void;
  swe_get_ayanamsa_ut(tjd_ut: number): number;
  swe_close(): void;
  swe_get_planet_name(ipl: number, sPtr: number): number;
  swe_set_topo(geolon: number, geolat: number, altitude: number): void;
  swe_sidtime(tjd_ut: number): number;
  swe_degnorm(x: number): number;
}

// High-level module interface with memory utilities
export interface SwissEphModule {
  exports: SwissEphExports;
  malloc(size: number): number;
  free(ptr: number): void;
  getInt32(ptr: number): number;
  getFloat64(ptr: number): number;
  setFloat64(ptr: number, value: number): void;
  getString(ptr: number): string;
  allocString(str: string): number;
}

/**
 * Create a SwissEphModule from WASM exports
 */
function createModule(exports: SwissEphExports): SwissEphModule {
  const getMemoryView = () => new DataView(exports.memory.buffer);
  const getUint8Array = () => new Uint8Array(exports.memory.buffer);

  return {
    exports,

    malloc(size: number): number {
      return exports.malloc(size);
    },

    free(ptr: number): void {
      exports.free(ptr);
    },

    getInt32(ptr: number): number {
      return getMemoryView().getInt32(ptr, true);
    },

    getFloat64(ptr: number): number {
      return getMemoryView().getFloat64(ptr, true);
    },

    setFloat64(ptr: number, value: number): void {
      getMemoryView().setFloat64(ptr, value, true);
    },

    getString(ptr: number): string {
      const mem = getUint8Array();
      let end = ptr;
      while (mem[end] !== 0) end++;
      return new TextDecoder().decode(mem.subarray(ptr, end));
    },

    allocString(str: string): number {
      const encoded = new TextEncoder().encode(str + "\0");
      const ptr = exports.malloc(encoded.length);
      getUint8Array().set(encoded, ptr);
      return ptr;
    },
  };
}

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
 * Load the Swiss Ephemeris WASM module
 */
export async function loadSwissEphModule(): Promise<SwissEphModule> {
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
      imports,
    );
    // @ts-ignore
    instance = result.instance;
  } else if (
    // @ts-expect-error
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
    return createModule(wasmModule as unknown as SwissEphExports);
  } else {
    throw new Error(`Unsupported WASM module type: ${typeof wasmModule}`);
  }

  return createModule(instance.exports as unknown as SwissEphExports);
}
