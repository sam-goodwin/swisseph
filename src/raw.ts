/**
 * Swiss Ephemeris Raw WASM API
 *
 * Direct access to the Swiss Ephemeris C library compiled to WASM.
 * All function signatures match the C API exactly.
 *
 * For a friendlier API with automatic memory management, use the main export:
 * ```ts
 * import { createSwissEph } from "@jyoti/swisseph";
 * ```
 *
 * @example
 * ```ts
 * import { loadSwissEph, createMemoryHelpers, SE_SUN, SEFLG_SPEED } from "@jyoti/swisseph/raw";
 *
 * const raw = await loadSwissEph();
 * const mem = createMemoryHelpers(raw);
 *
 * const jd = raw.swe_julday(2024, 1, 1, 12.0, 1);
 * const xxPtr = raw.malloc(6 * 8);
 * const serrPtr = raw.malloc(256);
 *
 * raw.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxPtr, serrPtr);
 * const longitude = mem.getFloat64(xxPtr);
 *
 * raw.free(xxPtr);
 * raw.free(serrPtr);
 * raw.swe_close();
 * ```
 */

// Raw WASM loader
export { loadSwissEph } from "./loader.js";
export type { SwissEphWasm } from "./loader.js";

// Memory helpers
export {
  createMemoryHelpers,
  withErrorBuffer,
  type MemoryHelpers,
} from "./helpers.js";

// All constants
export * from "./generated/constants.js";

// Raw function interface type
export type { SwissEphWasm as RawSwissEph } from "./generated/functions.js";
