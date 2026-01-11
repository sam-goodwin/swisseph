/**
 * Swiss Ephemeris WebAssembly bindings
 *
 * Provides direct access to the Swiss Ephemeris C library compiled to WASM.
 * All function signatures match the C API exactly.
 *
 * @example
 * ```ts
 * import { loadSwissEph, SE_SUN, SEFLG_SPEED, createMemoryHelpers } from "@jyoti/swisseph";
 *
 * const swe = await loadSwissEph();
 * const mem = createMemoryHelpers(swe);
 *
 * // Calculate Julian Day
 * const jd = swe.swe_julday(1990, 5, 15, 12.5, 1); // 1 = Gregorian
 *
 * // Calculate planet position
 * const xxPtr = swe.malloc(6 * 8); // 6 doubles for result
 * const serrPtr = swe.malloc(256); // error buffer
 *
 * const result = swe.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxPtr, serrPtr);
 *
 * if (result >= 0) {
 *   const [longitude, latitude, distance, speedLon, speedLat, speedDist] =
 *     mem.getFloat64Array(xxPtr, 6);
 *   console.log(`Sun longitude: ${longitude}°`);
 * } else {
 *   console.error(mem.getString(serrPtr));
 * }
 *
 * swe.free(xxPtr);
 * swe.free(serrPtr);
 * swe.swe_close();
 * ```
 */

// Loader
export { loadSwissEph } from "./loader.js";
export type { SwissEphWasm } from "./loader.js";

// Memory helpers (optional)
export {
  createMemoryHelpers,
  withErrorBuffer,
  type MemoryHelpers,
} from "./helpers.js";

// All constants from the C header
export * from "./generated/constants.js";

// The SwissEphWasm interface type is also re-exported from generated
// for users who want to import types separately
export type { SwissEphWasm as SwissEph } from "./generated/functions.js";
