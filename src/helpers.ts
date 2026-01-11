/**
 * Memory helper utilities for working with Swiss Ephemeris WASM
 *
 * These are optional convenience functions for reading/writing values
 * from/to the WASM linear memory.
 */

import type { SwissEphWasm } from "./generated/functions.js";

/**
 * Create memory helper functions for a SwissEphWasm instance.
 *
 * @example
 * ```ts
 * const swe = await loadSwissEph();
 * const mem = createMemoryHelpers(swe);
 *
 * const xxPtr = swe.malloc(6 * 8);
 * const serrPtr = swe.malloc(256);
 *
 * swe.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxPtr, serrPtr);
 *
 * const longitude = mem.getFloat64(xxPtr);
 * const error = mem.getString(serrPtr);
 *
 * swe.free(xxPtr);
 * swe.free(serrPtr);
 * ```
 */
export function createMemoryHelpers(swe: SwissEphWasm) {
  const getDataView = () => new DataView(swe.memory.buffer);
  const getUint8Array = () => new Uint8Array(swe.memory.buffer);

  return {
    /**
     * Read a 32-bit signed integer from memory
     */
    getInt32(ptr: number): number {
      return getDataView().getInt32(ptr, true);
    },

    /**
     * Read a 64-bit float from memory
     */
    getFloat64(ptr: number): number {
      return getDataView().getFloat64(ptr, true);
    },

    /**
     * Write a 64-bit float to memory
     */
    setFloat64(ptr: number, value: number): void {
      getDataView().setFloat64(ptr, value, true);
    },

    /**
     * Read an array of 64-bit floats from memory
     */
    getFloat64Array(ptr: number, count: number): number[] {
      const result: number[] = [];
      const view = getDataView();
      for (let i = 0; i < count; i++) {
        result.push(view.getFloat64(ptr + i * 8, true));
      }
      return result;
    },

    /**
     * Read a null-terminated string from memory
     */
    getString(ptr: number): string {
      const mem = getUint8Array();
      let end = ptr;
      while (mem[end] !== 0) end++;
      return new TextDecoder().decode(mem.subarray(ptr, end));
    },

    /**
     * Allocate and write a null-terminated string to memory.
     * Remember to free the returned pointer when done.
     */
    allocString(str: string): number {
      const encoded = new TextEncoder().encode(str + "\0");
      const ptr = swe.malloc(encoded.length);
      getUint8Array().set(encoded, ptr);
      return ptr;
    },

    /**
     * Allocate memory for N float64 values.
     * Remember to free the returned pointer when done.
     */
    allocFloat64Array(count: number): number {
      return swe.malloc(count * 8);
    },

    /**
     * Allocate memory for N int32 values.
     * Remember to free the returned pointer when done.
     */
    allocInt32Array(count: number): number {
      return swe.malloc(count * 4);
    },
  };
}

export type MemoryHelpers = ReturnType<typeof createMemoryHelpers>;

/**
 * Execute a function with automatic memory management for the error buffer.
 *
 * @example
 * ```ts
 * const result = withErrorBuffer(swe, 256, (serrPtr) => {
 *   return swe.swe_calc_ut(jd, ipl, flags, xxPtr, serrPtr);
 * });
 *
 * if (result.error) {
 *   console.error(result.error);
 * } else {
 *   console.log("Success, return code:", result.value);
 * }
 * ```
 */
export function withErrorBuffer<T>(
  swe: SwissEphWasm,
  bufferSize: number,
  fn: (serrPtr: number) => T,
): { value: T; error?: string } {
  const mem = createMemoryHelpers(swe);
  const serrPtr = swe.malloc(bufferSize);

  try {
    const value = fn(serrPtr);
    const errorStr = mem.getString(serrPtr);
    return {
      value,
      error: errorStr.length > 0 ? errorStr : undefined,
    };
  } finally {
    swe.free(serrPtr);
  }
}
