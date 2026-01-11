/**
 * Swiss Ephemeris - Friendly API
 *
 * TypeScript-friendly wrapper around the Swiss Ephemeris WASM module.
 * Handles all memory management automatically.
 *
 * For direct WASM access with manual memory management:
 * ```ts
 * import { loadSwissEph, createMemoryHelpers } from "@jyoti/swisseph/raw";
 * ```
 *
 * @example
 * ```ts
 * import { createSwissEph, SE_SUN, SEFLG_SPEED, SE_SIDM_LAHIRI } from "@jyoti/swisseph";
 *
 * const swe = await createSwissEph();
 *
 * // Calculate Julian Day
 * const jd = swe.julday(2024, 1, 1, 12.0);
 *
 * // Calculate planet position - no memory management needed!
 * const sun = swe.calc(jd, SE_SUN, SEFLG_SPEED);
 * console.log(`Sun longitude: ${sun.longitude}°`);
 *
 * // Sidereal calculations
 * swe.setSiderealMode(SE_SIDM_LAHIRI, 0, 0);
 * const ayanamsa = swe.getAyanamsa(jd);
 *
 * // House cusps
 * const houses = swe.houses(jd, 0, 28.6, 77.2, "W"); // "W" for Whole Sign
 * console.log(`Ascendant: ${houses.ascendant}°`);
 *
 * swe.close();
 * ```
 */

// ============================================================================
// Friendly API
// ============================================================================

export { createSwissEph, type SwissEph } from "./generated/friendly.js";

// Result types for the friendly API
export type {
  AzimuthAltitude,
  DateComponents,
  EclipseAttributes,
  EclipseTimeResult,
  EclipseWhereResult,
  HouseResult,
  HouseResultWithSpeed,
  JulianDayResult,
  NodesApsidesResult,
  OrbitalElements,
  PhenomenaResult,
  PlanetPosition,
  SplitDegrees,
  UtcComponents,
} from "./generated/friendly.js";

// ============================================================================
// Constants
// ============================================================================

// All constants from the C header (SE_SUN, SEFLG_SPEED, SE_SIDM_LAHIRI, etc.)
export * from "./generated/constants.js";
