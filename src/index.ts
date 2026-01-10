/**
 * Swiss Ephemeris WebAssembly bindings for Jyotish astrology
 * Provides high-level TypeScript API for planetary calculations
 *
 * Uses Moshier ephemeris (built-in, no external files needed)
 * Accuracy is within 1 arc second for the Sun, Moon, and planets
 */

import { loadSwissEphModule, type SwissEphModule } from "./swisseph.js";

export type { SwissEphModule };

// Planet identifiers
export const Planet = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  MEAN_NODE: 10,
  TRUE_NODE: 11,
  MEAN_APOG: 12,
  OSCU_APOG: 13,
  EARTH: 14,
  CHIRON: 15,
  PHOLUS: 16,
  CERES: 17,
  PALLAS: 18,
  JUNO: 19,
  VESTA: 20,
} as const;

export type PlanetId = (typeof Planet)[keyof typeof Planet];

// Calculation flags
export const CalcFlag = {
  SPEED: 256,
  SIDEREAL: 64 * 1024,
  EQUATORIAL: 2 * 1024,
  XYZ: 4 * 1024,
  RADIANS: 8 * 1024,
  TOPOCENTRIC: 32 * 1024,
  HELIOCENTRIC: 8,
  TRUE_POS: 16,
  NO_ABERRATION: 1024,
  NO_DEFLECTION: 512,
} as const;

// Sidereal modes (Ayanamsas)
export const Ayanamsa = {
  FAGAN_BRADLEY: 0,
  LAHIRI: 1,
  DELUCE: 2,
  RAMAN: 3,
  USHASHASHI: 4,
  KRISHNAMURTI: 5,
  DJWHAL_KHUL: 6,
  YUKTESHWAR: 7,
  JN_BHASIN: 8,
  TRUE_CITRA: 27,
  TRUE_REVATI: 28,
  TRUE_PUSHYA: 29,
  LAHIRI_1940: 43,
  LAHIRI_VP285: 44,
  LAHIRI_ICRC: 46,
} as const;

export type AyanamsaId = (typeof Ayanamsa)[keyof typeof Ayanamsa];

// House systems
export const HouseSystem = {
  PLACIDUS: 80,
  KOCH: 75,
  PORPHYRIUS: 79,
  REGIOMONTANUS: 82,
  CAMPANUS: 67,
  EQUAL: 69,
  WHOLE_SIGN: 87,
  MERIDIAN: 88,
  ALCABITIUS: 66,
  MORINUS: 77,
  KRUSINSKI: 85,
  SRIPATI: 83,
} as const;

export type HouseSystemId = (typeof HouseSystem)[keyof typeof HouseSystem];

// Calendar types
export const Calendar = {
  JULIAN: 0,
  GREGORIAN: 1,
} as const;

// Result interfaces
export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speedLongitude: number;
  speedLatitude: number;
  speedDistance: number;
}

export interface HouseCusps {
  cusps: number[];
  ascendant: number;
  mc: number;
  armc: number;
  vertex: number;
  equatorialAscendant: number;
  coAscendantKoch: number;
  coAscendantMunkasey: number;
  polarAscendant: number;
}

export interface DateComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface CalcError {
  error: string;
}

export type CalcResult = PlanetPosition | CalcError;

export function isCalcError(result: CalcResult): result is CalcError {
  return "error" in result;
}

// Main SwissEph class
export class SwissEph {
  private module: SwissEphModule;

  constructor(module: SwissEphModule) {
    this.module = module;
  }

  close(): void {
    this.module.exports.swe_close();
  }

  setSiderealMode(ayanamsa: AyanamsaId, t0 = 0, ayanT0 = 0): void {
    this.module.exports.swe_set_sid_mode(ayanamsa, t0, ayanT0);
  }

  setTopo(longitude: number, latitude: number, altitude = 0): void {
    this.module.exports.swe_set_topo(longitude, latitude, altitude);
  }

  julday(
    year: number,
    month: number,
    day: number,
    hour = 0,
    gregorian = true,
  ): number {
    return this.module.exports.swe_julday(
      year,
      month,
      day,
      hour,
      gregorian ? Calendar.GREGORIAN : Calendar.JULIAN,
    );
  }

  revjul(jd: number, gregorian = true): DateComponents {
    const yearPtr = this.module.malloc(4);
    const monthPtr = this.module.malloc(4);
    const dayPtr = this.module.malloc(4);
    const hourPtr = this.module.malloc(8);

    try {
      this.module.exports.swe_revjul(
        jd,
        gregorian ? Calendar.GREGORIAN : Calendar.JULIAN,
        yearPtr,
        monthPtr,
        dayPtr,
        hourPtr,
      );

      return {
        year: this.module.getInt32(yearPtr),
        month: this.module.getInt32(monthPtr),
        day: this.module.getInt32(dayPtr),
        hour: this.module.getFloat64(hourPtr),
      };
    } finally {
      this.module.free(yearPtr);
      this.module.free(monthPtr);
      this.module.free(dayPtr);
      this.module.free(hourPtr);
    }
  }

  calc(
    jdUt: number,
    planet: PlanetId,
    flags: number = CalcFlag.SPEED,
  ): CalcResult {
    const xxPtr = this.module.malloc(6 * 8);
    const serrPtr = this.module.malloc(256);

    try {
      const result = this.module.exports.swe_calc_ut(
        jdUt,
        planet,
        flags,
        xxPtr,
        serrPtr,
      );

      if (result < 0) {
        return { error: this.module.getString(serrPtr) };
      }

      return {
        longitude: this.module.getFloat64(xxPtr),
        latitude: this.module.getFloat64(xxPtr + 8),
        distance: this.module.getFloat64(xxPtr + 16),
        speedLongitude: this.module.getFloat64(xxPtr + 24),
        speedLatitude: this.module.getFloat64(xxPtr + 32),
        speedDistance: this.module.getFloat64(xxPtr + 40),
      };
    } finally {
      this.module.free(xxPtr);
      this.module.free(serrPtr);
    }
  }

  calcSidereal(
    jdUt: number,
    planet: PlanetId,
    flags: number = CalcFlag.SPEED,
  ): CalcResult {
    return this.calc(jdUt, planet, flags | CalcFlag.SIDEREAL);
  }

  getAyanamsa(jdUt: number): number {
    return this.module.exports.swe_get_ayanamsa_ut(jdUt);
  }

  houses(
    jdUt: number,
    latitude: number,
    longitude: number,
    system: HouseSystemId = HouseSystem.WHOLE_SIGN,
    flags: number = 0,
  ): HouseCusps {
    const cuspsPtr = this.module.malloc(13 * 8);
    const ascmcPtr = this.module.malloc(10 * 8);

    try {
      this.module.exports.swe_houses_ex(
        jdUt,
        flags,
        latitude,
        longitude,
        system,
        cuspsPtr,
        ascmcPtr,
      );

      const cusps: number[] = [];
      for (let i = 0; i <= 12; i++) {
        cusps.push(this.module.getFloat64(cuspsPtr + i * 8));
      }

      return {
        cusps,
        ascendant: this.module.getFloat64(ascmcPtr),
        mc: this.module.getFloat64(ascmcPtr + 8),
        armc: this.module.getFloat64(ascmcPtr + 16),
        vertex: this.module.getFloat64(ascmcPtr + 24),
        equatorialAscendant: this.module.getFloat64(ascmcPtr + 32),
        coAscendantKoch: this.module.getFloat64(ascmcPtr + 40),
        coAscendantMunkasey: this.module.getFloat64(ascmcPtr + 48),
        polarAscendant: this.module.getFloat64(ascmcPtr + 56),
      };
    } finally {
      this.module.free(cuspsPtr);
      this.module.free(ascmcPtr);
    }
  }

  housesSidereal(
    jdUt: number,
    latitude: number,
    longitude: number,
    system: HouseSystemId = HouseSystem.WHOLE_SIGN,
  ): HouseCusps {
    return this.houses(jdUt, latitude, longitude, system, CalcFlag.SIDEREAL);
  }

  siderealTime(jdUt: number): number {
    return this.module.exports.swe_sidtime(jdUt);
  }

  getPlanetName(planet: PlanetId): string {
    const sPtr = this.module.malloc(64);
    try {
      this.module.exports.swe_get_planet_name(planet, sPtr);
      return this.module.getString(sPtr);
    } finally {
      this.module.free(sPtr);
    }
  }

  normalizeDegrees(degrees: number): number {
    return this.module.exports.swe_degnorm(degrees);
  }

  calcKetu(
    jdUt: number,
    useTrueNode = true,
    flags: number = CalcFlag.SPEED,
  ): CalcResult {
    const rahu = useTrueNode ? Planet.TRUE_NODE : Planet.MEAN_NODE;
    const result = this.calc(jdUt, rahu, flags);

    if (isCalcError(result)) {
      return result;
    }

    return {
      ...result,
      longitude: this.normalizeDegrees(result.longitude + 180),
      latitude: -result.latitude,
    };
  }

  calcKetuSidereal(
    jdUt: number,
    useTrueNode = true,
    flags: number = CalcFlag.SPEED,
  ): CalcResult {
    return this.calcKetu(jdUt, useTrueNode, flags | CalcFlag.SIDEREAL);
  }

  getModule(): SwissEphModule {
    return this.module;
  }
}

export const createSwissEph = async (): Promise<SwissEph> => {
  return new SwissEph(await loadSwissEphModule());
};
