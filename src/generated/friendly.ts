/**
 * Swiss Ephemeris Friendly API
 * Auto-generated - DO NOT EDIT
 *
 * Provides TypeScript-friendly wrappers around the raw WASM interface.
 * Handles memory allocation/deallocation automatically.
 */

import type { SwissEphWasm } from "./functions.js";
import { loadSwissEph } from "../loader.js";
import { createMemoryHelpers, type MemoryHelpers } from "../helpers.js";

// Result Types

export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
  latitudeSpeed: number;
  distanceSpeed: number;
}

export interface DateComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface UtcComponents {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface HouseResult {
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

export interface HouseResultWithSpeed extends HouseResult {
  cuspSpeeds: number[];
  ascmcSpeeds: number[];
}

export interface SplitDegrees {
  degrees: number;
  minutes: number;
  seconds: number;
  secondFraction: number;
  sign: number;
}

export interface JulianDayResult {
  et: number;
  ut: number;
}

export interface AzimuthAltitude {
  azimuth: number;
  trueAltitude: number;
  apparentAltitude: number;
}

export interface PhenomenaResult {
  phaseAngle: number;
  phase: number;
  elongation: number;
  apparentDiameter: number;
  apparentMagnitude: number;
}

export interface NodesApsidesResult {
  ascendingNode: PlanetPosition;
  descendingNode: PlanetPosition;
  perihelion: PlanetPosition;
  aphelion: PlanetPosition;
}

export interface EclipseTimeResult {
  times: number[];
  attributes?: number[];
}

export interface EclipseWhereResult {
  geopos: number[];
  attributes: number[];
}

export interface EclipseAttributes {
  attributes: number[];
}

export interface OrbitalElements {
  elements: number[];
}

/**
 * Create a Swiss Ephemeris instance with friendly API.
 *
 * All functions handle memory management automatically.
 * Call close() when done to free resources.
 *
 * @example
 * ```ts
 * const swe = await createSwissEph();
 * const jd = swe.julday(2024, 1, 1, 12.0);
 * const sun = swe.calc(jd, SE_SUN, SEFLG_SPEED);
 * console.log(sun.longitude);
 * swe.close();
 * ```
 */
export async function createSwissEph() {
  const raw = await loadSwissEph();
  const mem = createMemoryHelpers(raw);

  return {
    /** Calculate heliacal rising/setting */
    heliacalRising: (tjdstart_ut: number, geopos: number, datm: number, dobs: number, ObjectName: string, TypeEvent: number, iflag: number): number[] => {
      const dretPtr = raw.malloc(50 * 8);
      const serrPtr = raw.malloc(256);
      const ObjectNamePtr = mem.allocString(ObjectName);
      try {
        const ret = raw.swe_heliacal_ut(tjdstart_ut, geopos, datm, dobs, ObjectNamePtr, TypeEvent, iflag, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64Array(dretPtr, 50);
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
        raw.free(ObjectNamePtr);
      }
    },

    /** Calculate heliacal phenomena */
    heliacalPhenomena: (tjd_ut: number, geopos: number, datm: number, dobs: number, ObjectName: string, TypeEvent: number, helflag: number): number[] => {
      const darrPtr = raw.malloc(50 * 8);
      const serrPtr = raw.malloc(256);
      const ObjectNamePtr = mem.allocString(ObjectName);
      try {
        const ret = raw.swe_heliacal_pheno_ut(tjd_ut, geopos, datm, dobs, ObjectNamePtr, TypeEvent, helflag, darrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64Array(darrPtr, 50);
      } finally {
        raw.free(darrPtr);
        raw.free(serrPtr);
        raw.free(ObjectNamePtr);
      }
    },

    /** Calculate limiting magnitude for visibility */
    visibilityLimitMagnitude: (tjdut: number, geopos: number, datm: number, dobs: number, ObjectName: string, helflag: number): number[] => {
      const dretPtr = raw.malloc(8 * 8);
      const serrPtr = raw.malloc(256);
      const ObjectNamePtr = mem.allocString(ObjectName);
      try {
        const ret = raw.swe_vis_limit_mag(tjdut, geopos, datm, dobs, ObjectNamePtr, helflag, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64Array(dretPtr, 8);
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
        raw.free(ObjectNamePtr);
      }
    },

    /** Calculate heliacal angle */
    heliacalAngle: (tjdut: number, dgeo: number, datm: number, dobs: number, helflag: number, mag: number, azi_obj: number, azi_sun: number, azi_moon: number, alt_moon: number): number[] => {
      const dretPtr = raw.malloc(3 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_heliacal_angle(tjdut, dgeo, datm, dobs, helflag, mag, azi_obj, azi_sun, azi_moon, alt_moon, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64Array(dretPtr, 3);
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate topocentric arcus visionis */
    topoArcusVisionis: (tjdut: number, dgeo: number, datm: number, dobs: number, helflag: number, mag: number, azi_obj: number, alt_obj: number, azi_sun: number, azi_moon: number, alt_moon: number): number[] => {
      const dretPtr = raw.malloc(3 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_topo_arcus_visionis(tjdut, dgeo, datm, dobs, helflag, mag, azi_obj, alt_obj, azi_sun, azi_moon, alt_moon, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64Array(dretPtr, 3);
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate planet position (ET time) */
    calcEt: (tjd: number, ipl: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_calc(tjd, ipl, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate planet position (UT time) */
    calc: (tjd_ut: number, ipl: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_calc_ut(tjd_ut, ipl, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate position relative to another planet */
    calcPlanetocentric: (tjd: number, ipl: number, iplctr: number, iflag: number): PlanetPosition => {
      const xxretPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_calc_pctr(tjd, ipl, iplctr, iflag, xxretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxretPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxretPtr);
        raw.free(serrPtr);
      }
    },

    /** Find when Sun crosses a longitude (ET) */
    solarCrossingEt: (x2cross: number, jd_et: number, flag: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_solcross(x2cross, jd_et, flag, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Find when Sun crosses a longitude (UT) */
    solarCrossing: (x2cross: number, jd_ut: number, flag: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_solcross_ut(x2cross, jd_ut, flag, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Find when Moon crosses a longitude (ET) */
    moonCrossingEt: (x2cross: number, jd_et: number, flag: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_mooncross(x2cross, jd_et, flag, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Find when Moon crosses a longitude (UT) */
    moonCrossing: (x2cross: number, jd_ut: number, flag: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_mooncross_ut(x2cross, jd_ut, flag, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Find when Moon crosses its node (ET) */
    moonNodeCrossingEt: (jd_et: number, flag: number): { xlon: number; xlat: number } => {
      const xlonPtr = raw.malloc(8);
      const xlatPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_mooncross_node(jd_et, flag, xlonPtr, xlatPtr, serrPtr);
        return {
          xlon: mem.getFloat64(xlonPtr),
          xlat: mem.getFloat64(xlatPtr),
        };
      } finally {
        raw.free(xlonPtr);
        raw.free(xlatPtr);
        raw.free(serrPtr);
      }
    },

    /** Find when Moon crosses its node (UT) */
    moonNodeCrossing: (jd_ut: number, flag: number): { xlon: number; xlat: number } => {
      const xlonPtr = raw.malloc(8);
      const xlatPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_mooncross_node_ut(jd_ut, flag, xlonPtr, xlatPtr, serrPtr);
        return {
          xlon: mem.getFloat64(xlonPtr),
          xlat: mem.getFloat64(xlatPtr),
        };
      } finally {
        raw.free(xlonPtr);
        raw.free(xlatPtr);
        raw.free(serrPtr);
      }
    },

    /** Find heliocentric crossing (ET) */
    helioCrossingEt: (ipl: number, x2cross: number, jd_et: number, iflag: number, dir: number): number => {
      const jd_crossPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_helio_cross(ipl, x2cross, jd_et, iflag, dir, jd_crossPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(jd_crossPtr);
      } finally {
        raw.free(jd_crossPtr);
        raw.free(serrPtr);
      }
    },

    /** Find heliocentric crossing (UT) */
    helioCrossing: (ipl: number, x2cross: number, jd_ut: number, iflag: number, dir: number): number => {
      const jd_crossPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_helio_cross_ut(ipl, x2cross, jd_ut, iflag, dir, jd_crossPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(jd_crossPtr);
      } finally {
        raw.free(jd_crossPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate fixed star position (ET) */
    fixedStarEt: (star: string, tjd: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar(starPtr, tjd, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Calculate fixed star position (UT) */
    fixedStar: (star: string, tjd_ut: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar_ut(starPtr, tjd_ut, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Get fixed star magnitude */
    fixedStarMagnitude: (star: string): number => {
      const magPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar_mag(starPtr, magPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(magPtr);
      } finally {
        raw.free(magPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Calculate fixed star position v2 (ET) */
    fixedStar2Et: (star: string, tjd: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar2(starPtr, tjd, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Calculate fixed star position v2 (UT) */
    fixedStar2: (star: string, tjd_ut: number, iflag: number): PlanetPosition => {
      const xxPtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar2_ut(starPtr, tjd_ut, iflag, xxPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xx = mem.getFloat64Array(xxPtr, 6);
        return {
          longitude: xx[0],
          latitude: xx[1],
          distance: xx[2],
          longitudeSpeed: xx[3],
          latitudeSpeed: xx[4],
          distanceSpeed: xx[5],
        };
      } finally {
        raw.free(xxPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Get fixed star magnitude v2 */
    fixedStar2Magnitude: (star: string): number => {
      const magPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      const starPtr = mem.allocString(star);
      try {
        const ret = raw.swe_fixstar2_mag(starPtr, magPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(magPtr);
      } finally {
        raw.free(magPtr);
        raw.free(serrPtr);
        raw.free(starPtr);
      }
    },

    /** Close Swiss Ephemeris and free resources */
    close: (): void => {
      raw.swe_close();
    },

    /** Set path to ephemeris files */
    setEphemerisPath: (path: string): void => {
      const pathPtr = mem.allocString(path);
      try {
        raw.swe_set_ephe_path(pathPtr);
      } finally {
        raw.free(pathPtr);
      }
    },

    /** Set JPL ephemeris file */
    setJplFile: (fname: string): void => {
      const fnamePtr = mem.allocString(fname);
      try {
        raw.swe_set_jpl_file(fnamePtr);
      } finally {
        raw.free(fnamePtr);
      }
    },

    /** Get name of a planet */
    getPlanetName: (ipl: number): string => {
      const spnamePtr = raw.malloc(64);
      try {
        const ret = raw.swe_get_planet_name(ipl, spnamePtr);
        return mem.getString(spnamePtr);
      } finally {
        raw.free(spnamePtr);
      }
    },

    /** Set topocentric observer location */
    setTopocentric: (geolon: number, geolat: number, geoalt: number): void => {
      raw.swe_set_topo(geolon, geolat, geoalt);
    },

    /** Set sidereal calculation mode */
    setSiderealMode: (sid_mode: number, t0: number, ayan_t0: number): void => {
      raw.swe_set_sid_mode(sid_mode, t0, ayan_t0);
    },

    /** Get ayanamsa extended (ET) */
    getAyanamsaExEt: (tjd_et: number, iflag: number): number => {
      const dayaPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_get_ayanamsa_ex(tjd_et, iflag, dayaPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(dayaPtr);
      } finally {
        raw.free(dayaPtr);
        raw.free(serrPtr);
      }
    },

    /** Get ayanamsa extended (UT) */
    getAyanamsaEx: (tjd_ut: number, iflag: number): number => {
      const dayaPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_get_ayanamsa_ex_ut(tjd_ut, iflag, dayaPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(dayaPtr);
      } finally {
        raw.free(dayaPtr);
        raw.free(serrPtr);
      }
    },

    /** Get ayanamsa (ET) */
    getAyanamsaEt: (tjd_et: number): number => {
      const ret = raw.swe_get_ayanamsa(tjd_et);
      return ret;
    },

    /** Get ayanamsa (UT) */
    getAyanamsa: (tjd_ut: number): number => {
      const ret = raw.swe_get_ayanamsa_ut(tjd_ut);
      return ret;
    },

    /** Convert date with calendar check */
    dateConversion: (y: number, m: number, d: number, utime: number, c: number): number => {
      const tjdPtr = raw.malloc(8);
      try {
        const ret = raw.swe_date_conversion(y, m, d, utime, c, tjdPtr);
        return mem.getFloat64(tjdPtr);
      } finally {
        raw.free(tjdPtr);
      }
    },

    /** Convert date to Julian Day */
    julday: (year: number, month: number, day: number, hour: number, gregflag: number): number => {
      const ret = raw.swe_julday(year, month, day, hour, gregflag);
      return ret;
    },

    /** Convert Julian Day to date components */
    revjul: (jd: number, gregflag: number): DateComponents => {
      const jyearPtr = raw.malloc(4);
      const jmonPtr = raw.malloc(4);
      const jdayPtr = raw.malloc(4);
      const jutPtr = raw.malloc(8);
      try {
        raw.swe_revjul(jd, gregflag, jyearPtr, jmonPtr, jdayPtr, jutPtr);
        return {
          year: mem.getInt32(jyearPtr),
          month: mem.getInt32(jmonPtr),
          day: mem.getInt32(jdayPtr),
          hour: mem.getFloat64(jutPtr),
        };
      } finally {
        raw.free(jyearPtr);
        raw.free(jmonPtr);
        raw.free(jdayPtr);
        raw.free(jutPtr);
      }
    },

    /** Convert UTC to Julian Day */
    utcToJd: (iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number, gregflag: number): JulianDayResult => {
      const dretPtr = raw.malloc(2 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_utc_to_jd(iyear, imonth, iday, ihour, imin, dsec, gregflag, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const dret = mem.getFloat64Array(dretPtr, 2);
        return { et: dret[0], ut: dret[1] };
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
      }
    },

    /** Convert Julian Day ET to UTC */
    jdEtToUtc: (tjd_et: number, gregflag: number): UtcComponents => {
      const iyearPtr = raw.malloc(4);
      const imonthPtr = raw.malloc(4);
      const idayPtr = raw.malloc(4);
      const ihourPtr = raw.malloc(4);
      const iminPtr = raw.malloc(4);
      const dsecPtr = raw.malloc(8);
      try {
        raw.swe_jdet_to_utc(tjd_et, gregflag, iyearPtr, imonthPtr, idayPtr, ihourPtr, iminPtr, dsecPtr);
        return {
          year: mem.getInt32(iyearPtr),
          month: mem.getInt32(imonthPtr),
          day: mem.getInt32(idayPtr),
          hour: mem.getInt32(ihourPtr),
          minute: mem.getInt32(iminPtr),
          second: mem.getFloat64(dsecPtr),
        };
      } finally {
        raw.free(iyearPtr);
        raw.free(imonthPtr);
        raw.free(idayPtr);
        raw.free(ihourPtr);
        raw.free(iminPtr);
        raw.free(dsecPtr);
      }
    },

    /** Convert Julian Day UT1 to UTC */
    jdUt1ToUtc: (tjd_ut: number, gregflag: number): UtcComponents => {
      const iyearPtr = raw.malloc(4);
      const imonthPtr = raw.malloc(4);
      const idayPtr = raw.malloc(4);
      const ihourPtr = raw.malloc(4);
      const iminPtr = raw.malloc(4);
      const dsecPtr = raw.malloc(8);
      try {
        raw.swe_jdut1_to_utc(tjd_ut, gregflag, iyearPtr, imonthPtr, idayPtr, ihourPtr, iminPtr, dsecPtr);
        return {
          year: mem.getInt32(iyearPtr),
          month: mem.getInt32(imonthPtr),
          day: mem.getInt32(idayPtr),
          hour: mem.getInt32(ihourPtr),
          minute: mem.getInt32(iminPtr),
          second: mem.getFloat64(dsecPtr),
        };
      } finally {
        raw.free(iyearPtr);
        raw.free(imonthPtr);
        raw.free(idayPtr);
        raw.free(ihourPtr);
        raw.free(iminPtr);
        raw.free(dsecPtr);
      }
    },

    /** Convert between timezones */
    utcTimeZone: (iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number, d_timezone: number): UtcComponents => {
      const iyear_outPtr = raw.malloc(4);
      const imonth_outPtr = raw.malloc(4);
      const iday_outPtr = raw.malloc(4);
      const ihour_outPtr = raw.malloc(4);
      const imin_outPtr = raw.malloc(4);
      const dsec_outPtr = raw.malloc(8);
      try {
        raw.swe_utc_time_zone(iyear, imonth, iday, ihour, imin, dsec, d_timezone, iyear_outPtr, imonth_outPtr, iday_outPtr, ihour_outPtr, imin_outPtr, dsec_outPtr);
        return {
          year: mem.getInt32(iyear_outPtr),
          month: mem.getInt32(imonth_outPtr),
          day: mem.getInt32(iday_outPtr),
          hour: mem.getInt32(ihour_outPtr),
          minute: mem.getInt32(imin_outPtr),
          second: mem.getFloat64(dsec_outPtr),
        };
      } finally {
        raw.free(iyear_outPtr);
        raw.free(imonth_outPtr);
        raw.free(iday_outPtr);
        raw.free(ihour_outPtr);
        raw.free(imin_outPtr);
        raw.free(dsec_outPtr);
      }
    },

    /** Calculate house cusps (simple) */
    housesSimple: (tjd_ut: number, geolat: number, geolon: number, hsys: number | string): HouseResult => {
      const cuspsPtr = raw.malloc(13 * 8);
      const ascmcPtr = raw.malloc(10 * 8);
      try {
        const ret = raw.swe_houses(tjd_ut, geolat, geolon, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), cuspsPtr, ascmcPtr);
        const cusps = mem.getFloat64Array(cuspsPtr, 13);
        const ascmc = mem.getFloat64Array(ascmcPtr, 10);
        return {
          cusps: cusps.slice(1), // cusps[0] is unused
          ascendant: ascmc[0],
          mc: ascmc[1],
          armc: ascmc[2],
          vertex: ascmc[3],
          equatorialAscendant: ascmc[4],
          coAscendantKoch: ascmc[5],
          coAscendantMunkasey: ascmc[6],
          polarAscendant: ascmc[7],
        };
      } finally {
        raw.free(cuspsPtr);
        raw.free(ascmcPtr);
      }
    },

    /** Calculate house cusps (extended) */
    houses: (tjd_ut: number, iflag: number, geolat: number, geolon: number, hsys: number | string): HouseResult => {
      const cuspsPtr = raw.malloc(13 * 8);
      const ascmcPtr = raw.malloc(10 * 8);
      try {
        const ret = raw.swe_houses_ex(tjd_ut, iflag, geolat, geolon, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), cuspsPtr, ascmcPtr);
        const cusps = mem.getFloat64Array(cuspsPtr, 13);
        const ascmc = mem.getFloat64Array(ascmcPtr, 10);
        return {
          cusps: cusps.slice(1), // cusps[0] is unused
          ascendant: ascmc[0],
          mc: ascmc[1],
          armc: ascmc[2],
          vertex: ascmc[3],
          equatorialAscendant: ascmc[4],
          coAscendantKoch: ascmc[5],
          coAscendantMunkasey: ascmc[6],
          polarAscendant: ascmc[7],
        };
      } finally {
        raw.free(cuspsPtr);
        raw.free(ascmcPtr);
      }
    },

    /** Calculate house cusps with speeds */
    housesWithSpeed: (tjd_ut: number, iflag: number, geolat: number, geolon: number, hsys: number | string): HouseResultWithSpeed => {
      const cuspsPtr = raw.malloc(13 * 8);
      const ascmcPtr = raw.malloc(10 * 8);
      const cusp_speedPtr = raw.malloc(13 * 8);
      const ascmc_speedPtr = raw.malloc(10 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_houses_ex2(tjd_ut, iflag, geolat, geolon, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), cuspsPtr, ascmcPtr, cusp_speedPtr, ascmc_speedPtr, serrPtr);
        const cusps = mem.getFloat64Array(cuspsPtr, 13);
        const ascmc = mem.getFloat64Array(ascmcPtr, 10);
        const cuspSpeeds = mem.getFloat64Array(cusp_speedPtr, 13);
        const ascmcSpeeds = mem.getFloat64Array(ascmc_speedPtr, 10);
        return {
          cusps: cusps.slice(1),
          ascendant: ascmc[0],
          mc: ascmc[1],
          armc: ascmc[2],
          vertex: ascmc[3],
          equatorialAscendant: ascmc[4],
          coAscendantKoch: ascmc[5],
          coAscendantMunkasey: ascmc[6],
          polarAscendant: ascmc[7],
          cuspSpeeds: cuspSpeeds.slice(1),
          ascmcSpeeds: Array.from(ascmcSpeeds),
        };
      } finally {
        raw.free(cuspsPtr);
        raw.free(ascmcPtr);
        raw.free(cusp_speedPtr);
        raw.free(ascmc_speedPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate houses from ARMC */
    housesArmc: (armc: number, geolat: number, eps: number, hsys: number | string): HouseResult => {
      const cuspsPtr = raw.malloc(13 * 8);
      const ascmcPtr = raw.malloc(10 * 8);
      try {
        const ret = raw.swe_houses_armc(armc, geolat, eps, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), cuspsPtr, ascmcPtr);
        const cusps = mem.getFloat64Array(cuspsPtr, 13);
        const ascmc = mem.getFloat64Array(ascmcPtr, 10);
        return {
          cusps: cusps.slice(1), // cusps[0] is unused
          ascendant: ascmc[0],
          mc: ascmc[1],
          armc: ascmc[2],
          vertex: ascmc[3],
          equatorialAscendant: ascmc[4],
          coAscendantKoch: ascmc[5],
          coAscendantMunkasey: ascmc[6],
          polarAscendant: ascmc[7],
        };
      } finally {
        raw.free(cuspsPtr);
        raw.free(ascmcPtr);
      }
    },

    /** Calculate houses from ARMC with speeds */
    housesArmcWithSpeed: (armc: number, geolat: number, eps: number, hsys: number | string): HouseResultWithSpeed => {
      const cuspsPtr = raw.malloc(13 * 8);
      const ascmcPtr = raw.malloc(10 * 8);
      const cusp_speedPtr = raw.malloc(13 * 8);
      const ascmc_speedPtr = raw.malloc(10 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_houses_armc_ex2(armc, geolat, eps, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), cuspsPtr, ascmcPtr, cusp_speedPtr, ascmc_speedPtr, serrPtr);
        const cusps = mem.getFloat64Array(cuspsPtr, 13);
        const ascmc = mem.getFloat64Array(ascmcPtr, 10);
        const cuspSpeeds = mem.getFloat64Array(cusp_speedPtr, 13);
        const ascmcSpeeds = mem.getFloat64Array(ascmc_speedPtr, 10);
        return {
          cusps: cusps.slice(1),
          ascendant: ascmc[0],
          mc: ascmc[1],
          armc: ascmc[2],
          vertex: ascmc[3],
          equatorialAscendant: ascmc[4],
          coAscendantKoch: ascmc[5],
          coAscendantMunkasey: ascmc[6],
          polarAscendant: ascmc[7],
          cuspSpeeds: cuspSpeeds.slice(1),
          ascmcSpeeds: Array.from(ascmcSpeeds),
        };
      } finally {
        raw.free(cuspsPtr);
        raw.free(ascmcPtr);
        raw.free(cusp_speedPtr);
        raw.free(ascmc_speedPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate house position of a planet */
    housePosition: (armc: number, geolat: number, eps: number, hsys: number | string, xpin: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_house_pos(armc, geolat, eps, (typeof hsys === "string" ? hsys.charCodeAt(0) : hsys), xpin, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Calculate Gauquelin sector */
    gauquelinSector: (t_ut: number, ipl: number, starname: string, iflag: number, imeth: number, geopos: number, atpress: number, attemp: number): number => {
      const dgsectPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_gauquelin_sector(t_ut, ipl, starnamePtr, iflag, imeth, geopos, atpress, attemp, dgsectPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(dgsectPtr);
      } finally {
        raw.free(dgsectPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Find where solar eclipse is central */
    solarEclipseWhere: (tjd: number, ifl: number): EclipseWhereResult => {
      const geoposPtr = raw.malloc(10 * 8);
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_sol_eclipse_where(tjd, ifl, geoposPtr, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return {
          geopos: mem.getFloat64Array(geoposPtr, 10),
          attributes: mem.getFloat64Array(attrPtr, 20),
        };
      } finally {
        raw.free(geoposPtr);
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Find where lunar occultation is central */
    lunarOccultationWhere: (tjd: number, ipl: number, starname: string, ifl: number): EclipseWhereResult => {
      const geoposPtr = raw.malloc(10 * 8);
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_lun_occult_where(tjd, ipl, starnamePtr, ifl, geoposPtr, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return {
          geopos: mem.getFloat64Array(geoposPtr, 10),
          attributes: mem.getFloat64Array(attrPtr, 20),
        };
      } finally {
        raw.free(geoposPtr);
        raw.free(attrPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Calculate solar eclipse attributes */
    solarEclipseHow: (tjd: number, ifl: number, geopos: number): EclipseAttributes => {
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_sol_eclipse_how(tjd, ifl, geopos, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return { attributes: mem.getFloat64Array(attrPtr, 20) };
      } finally {
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Find next solar eclipse at location */
    solarEclipseWhenLocal: (tjd_start: number, ifl: number, geopos: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_sol_eclipse_when_loc(tjd_start, ifl, geopos, tretPtr, attrPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        const attributes = mem.getFloat64Array(attrPtr, 20);
        return { times: Array.from(times), attributes: Array.from(attributes) };
      } finally {
        raw.free(tretPtr);
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Find next lunar occultation at location */
    lunarOccultationWhenLocal: (tjd_start: number, ipl: number, starname: string, ifl: number, geopos: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_lun_occult_when_loc(tjd_start, ipl, starnamePtr, ifl, geopos, tretPtr, attrPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        const attributes = mem.getFloat64Array(attrPtr, 20);
        return { times: Array.from(times), attributes: Array.from(attributes) };
      } finally {
        raw.free(tretPtr);
        raw.free(attrPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Find next solar eclipse globally */
    solarEclipseWhenGlobal: (tjd_start: number, ifl: number, ifltype: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_sol_eclipse_when_glob(tjd_start, ifl, ifltype, tretPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        return { times: Array.from(times) };
      } finally {
        raw.free(tretPtr);
        raw.free(serrPtr);
      }
    },

    /** Find next lunar occultation globally */
    lunarOccultationWhenGlobal: (tjd_start: number, ipl: number, starname: string, ifl: number, ifltype: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_lun_occult_when_glob(tjd_start, ipl, starnamePtr, ifl, ifltype, tretPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        return { times: Array.from(times) };
      } finally {
        raw.free(tretPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Calculate lunar eclipse attributes */
    lunarEclipseHow: (tjd_ut: number, ifl: number, geopos: number): EclipseAttributes => {
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_lun_eclipse_how(tjd_ut, ifl, geopos, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return { attributes: mem.getFloat64Array(attrPtr, 20) };
      } finally {
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Find next lunar eclipse */
    lunarEclipseWhen: (tjd_start: number, ifl: number, ifltype: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_lun_eclipse_when(tjd_start, ifl, ifltype, tretPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        return { times: Array.from(times) };
      } finally {
        raw.free(tretPtr);
        raw.free(serrPtr);
      }
    },

    /** Find next lunar eclipse at location */
    lunarEclipseWhenLocal: (tjd_start: number, ifl: number, geopos: number, backward: number): EclipseTimeResult => {
      const tretPtr = raw.malloc(10 * 8);
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_lun_eclipse_when_loc(tjd_start, ifl, geopos, tretPtr, attrPtr, backward, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const times = mem.getFloat64Array(tretPtr, 10);
        const attributes = mem.getFloat64Array(attrPtr, 20);
        return { times: Array.from(times), attributes: Array.from(attributes) };
      } finally {
        raw.free(tretPtr);
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate planetary phenomena (ET) */
    phenomenaEt: (tjd: number, ipl: number, iflag: number): PhenomenaResult => {
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_pheno(tjd, ipl, iflag, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const attr = mem.getFloat64Array(attrPtr, 20);
        return {
          phaseAngle: attr[0],
          phase: attr[1],
          elongation: attr[2],
          apparentDiameter: attr[3],
          apparentMagnitude: attr[4],
        };
      } finally {
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate planetary phenomena (UT) */
    phenomena: (tjd_ut: number, ipl: number, iflag: number): PhenomenaResult => {
      const attrPtr = raw.malloc(20 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_pheno_ut(tjd_ut, ipl, iflag, attrPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const attr = mem.getFloat64Array(attrPtr, 20);
        return {
          phaseAngle: attr[0],
          phase: attr[1],
          elongation: attr[2],
          apparentDiameter: attr[3],
          apparentMagnitude: attr[4],
        };
      } finally {
        raw.free(attrPtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate atmospheric refraction */
    refraction: (inalt: number, atpress: number, attemp: number, calc_flag: number): number => {
      const ret = raw.swe_refrac(inalt, atpress, attemp, calc_flag);
      return ret;
    },

    /** Calculate extended atmospheric refraction */
    refractionExtended: (inalt: number, geoalt: number, atpress: number, attemp: number, lapse_rate: number, calc_flag: number): number[] => {
      const dretPtr = raw.malloc(4 * 8);
      try {
        const ret = raw.swe_refrac_extended(inalt, geoalt, atpress, attemp, lapse_rate, calc_flag, dretPtr);
        return mem.getFloat64Array(dretPtr, 4);
      } finally {
        raw.free(dretPtr);
      }
    },

    /** Set atmospheric lapse rate */
    setLapseRate: (lapse_rate: number): void => {
      raw.swe_set_lapse_rate(lapse_rate);
    },

    /** Convert ecliptic to horizontal coordinates */
    azimuthAltitude: (tjd_ut: number, calc_flag: number, geopos: number, atpress: number, attemp: number, xin: number): AzimuthAltitude => {
      const xazPtr = raw.malloc(3 * 8);
      try {
        raw.swe_azalt(tjd_ut, calc_flag, geopos, atpress, attemp, xin, xazPtr);
        const xaz = mem.getFloat64Array(xazPtr, 3);
        return { azimuth: xaz[0], trueAltitude: xaz[1], apparentAltitude: xaz[2] };
      } finally {
        raw.free(xazPtr);
      }
    },

    /** Convert horizontal to ecliptic coordinates */
    azimuthAltitudeReverse: (tjd_ut: number, calc_flag: number, geopos: number, xin: number): number[] => {
      const xoutPtr = raw.malloc(3 * 8);
      try {
        raw.swe_azalt_rev(tjd_ut, calc_flag, geopos, xin, xoutPtr);
        return mem.getFloat64Array(xoutPtr, 3);
      } finally {
        raw.free(xoutPtr);
      }
    },

    /** Calculate rise/transit with true horizon */
    riseTransitTrueHorizon: (tjd_ut: number, ipl: number, starname: string, epheflag: number, rsmi: number, geopos: number, atpress: number, attemp: number, horhgt: number): number => {
      const tretPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_rise_trans_true_hor(tjd_ut, ipl, starnamePtr, epheflag, rsmi, geopos, atpress, attemp, horhgt, tretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(tretPtr);
      } finally {
        raw.free(tretPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Calculate rise, transit, set times */
    riseTransit: (tjd_ut: number, ipl: number, starname: string, epheflag: number, rsmi: number, geopos: number, atpress: number, attemp: number): number => {
      const tretPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      const starnamePtr = mem.allocString(starname);
      try {
        const ret = raw.swe_rise_trans(tjd_ut, ipl, starnamePtr, epheflag, rsmi, geopos, atpress, attemp, tretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(tretPtr);
      } finally {
        raw.free(tretPtr);
        raw.free(serrPtr);
        raw.free(starnamePtr);
      }
    },

    /** Calculate nodes and apsides (ET) */
    nodesApsidesEt: (tjd_et: number, ipl: number, iflag: number, method: number): NodesApsidesResult => {
      const xnascPtr = raw.malloc(6 * 8);
      const xndscPtr = raw.malloc(6 * 8);
      const xperiPtr = raw.malloc(6 * 8);
      const xaphePtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_nod_aps(tjd_et, ipl, iflag, method, xnascPtr, xndscPtr, xperiPtr, xaphePtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xnasc = mem.getFloat64Array(xnascPtr, 6);
        const xndsc = mem.getFloat64Array(xndscPtr, 6);
        const xperi = mem.getFloat64Array(xperiPtr, 6);
        const xaphe = mem.getFloat64Array(xaphePtr, 6);
        const toPos = (arr: number[]): PlanetPosition => ({
          longitude: arr[0], latitude: arr[1], distance: arr[2],
          longitudeSpeed: arr[3], latitudeSpeed: arr[4], distanceSpeed: arr[5],
        });
        return {
          ascendingNode: toPos(Array.from(xnasc)),
          descendingNode: toPos(Array.from(xndsc)),
          perihelion: toPos(Array.from(xperi)),
          aphelion: toPos(Array.from(xaphe)),
        };
      } finally {
        raw.free(xnascPtr);
        raw.free(xndscPtr);
        raw.free(xperiPtr);
        raw.free(xaphePtr);
        raw.free(serrPtr);
      }
    },

    /** Calculate nodes and apsides (UT) */
    nodesApsides: (tjd_ut: number, ipl: number, iflag: number, method: number): NodesApsidesResult => {
      const xnascPtr = raw.malloc(6 * 8);
      const xndscPtr = raw.malloc(6 * 8);
      const xperiPtr = raw.malloc(6 * 8);
      const xaphePtr = raw.malloc(6 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_nod_aps_ut(tjd_ut, ipl, iflag, method, xnascPtr, xndscPtr, xperiPtr, xaphePtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        const xnasc = mem.getFloat64Array(xnascPtr, 6);
        const xndsc = mem.getFloat64Array(xndscPtr, 6);
        const xperi = mem.getFloat64Array(xperiPtr, 6);
        const xaphe = mem.getFloat64Array(xaphePtr, 6);
        const toPos = (arr: number[]): PlanetPosition => ({
          longitude: arr[0], latitude: arr[1], distance: arr[2],
          longitudeSpeed: arr[3], latitudeSpeed: arr[4], distanceSpeed: arr[5],
        });
        return {
          ascendingNode: toPos(Array.from(xnasc)),
          descendingNode: toPos(Array.from(xndsc)),
          perihelion: toPos(Array.from(xperi)),
          aphelion: toPos(Array.from(xaphe)),
        };
      } finally {
        raw.free(xnascPtr);
        raw.free(xndscPtr);
        raw.free(xperiPtr);
        raw.free(xaphePtr);
        raw.free(serrPtr);
      }
    },

    /** Get orbital elements of a planet */
    orbitalElements: (tjd_et: number, ipl: number, iflag: number): OrbitalElements => {
      const dretPtr = raw.malloc(50 * 8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_get_orbital_elements(tjd_et, ipl, iflag, dretPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return { elements: mem.getFloat64Array(dretPtr, 50) };
      } finally {
        raw.free(dretPtr);
        raw.free(serrPtr);
      }
    },

    /** Get max/min true distance of orbit */
    orbitDistanceExtremes: (tjd_et: number, ipl: number, iflag: number): { dmax: number; dmin: number; dtrue: number } => {
      const dmaxPtr = raw.malloc(8);
      const dminPtr = raw.malloc(8);
      const dtruePtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_orbit_max_min_true_distance(tjd_et, ipl, iflag, dmaxPtr, dminPtr, dtruePtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return {
          dmax: mem.getFloat64(dmaxPtr),
          dmin: mem.getFloat64(dminPtr),
          dtrue: mem.getFloat64(dtruePtr),
        };
      } finally {
        raw.free(dmaxPtr);
        raw.free(dminPtr);
        raw.free(dtruePtr);
        raw.free(serrPtr);
      }
    },

    /** Get Delta T (TT - UT) */
    deltaT: (tjd: number): number => {
      const ret = raw.swe_deltat(tjd);
      return ret;
    },

    /** Get Delta T with flags */
    deltaTExtended: (tjd: number, iflag: number): {  } => {
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_deltat_ex(tjd, iflag, serrPtr);
        return ret;
      } finally {
        raw.free(serrPtr);
      }
    },

    /** Get equation of time */
    equationOfTime: (tjd: number): number => {
      const tePtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_time_equ(tjd, tePtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(tePtr);
      } finally {
        raw.free(tePtr);
        raw.free(serrPtr);
      }
    },

    /** Convert LMT to LAT */
    localMeanTimeToApparent: (tjd_lmt: number, geolon: number): number => {
      const tjd_latPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_lmt_to_lat(tjd_lmt, geolon, tjd_latPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(tjd_latPtr);
      } finally {
        raw.free(tjd_latPtr);
        raw.free(serrPtr);
      }
    },

    /** Convert LAT to LMT */
    apparentToLocalMeanTime: (tjd_lat: number, geolon: number): number => {
      const tjd_lmtPtr = raw.malloc(8);
      const serrPtr = raw.malloc(256);
      try {
        const ret = raw.swe_lat_to_lmt(tjd_lat, geolon, tjd_lmtPtr, serrPtr);
        if (ret < 0) {
          const errMsg = mem.getString(serrPtr);
          throw new Error(errMsg || "Swiss Ephemeris error");
        }
        return mem.getFloat64(tjd_lmtPtr);
      } finally {
        raw.free(tjd_lmtPtr);
        raw.free(serrPtr);
      }
    },

    /** Get sidereal time with parameters */
    siderealTime0: (tjd_ut: number, eps: number, nut: number): number => {
      const ret = raw.swe_sidtime0(tjd_ut, eps, nut);
      return ret;
    },

    /** Get sidereal time */
    siderealTime: (tjd_ut: number): number => {
      const ret = raw.swe_sidtime(tjd_ut);
      return ret;
    },

    /** Set nutation interpolation */
    setInterpolateNutation: (do_interpolate: number): void => {
      raw.swe_set_interpolate_nut(do_interpolate);
    },

    /** Transform ecliptic/equatorial coordinates */
    coordinateTransform: (xpo: number, eps: number): number[] => {
      const xpnPtr = raw.malloc(3 * 8);
      try {
        raw.swe_cotrans(xpo, xpnPtr, eps);
        return mem.getFloat64Array(xpnPtr, 3);
      } finally {
        raw.free(xpnPtr);
      }
    },

    /** Transform coordinates with speed */
    coordinateTransformWithSpeed: (xpo: number, eps: number): number[] => {
      const xpnPtr = raw.malloc(6 * 8);
      try {
        raw.swe_cotrans_sp(xpo, xpnPtr, eps);
        return mem.getFloat64Array(xpnPtr, 6);
      } finally {
        raw.free(xpnPtr);
      }
    },

    /** Get tidal acceleration */
    getTidalAcceleration: (): number => {
      const ret = raw.swe_get_tid_acc();
      return ret;
    },

    /** Set tidal acceleration */
    setTidalAcceleration: (t_acc: number): void => {
      raw.swe_set_tid_acc(t_acc);
    },

    /** Set user-defined delta T */
    setDeltaTUserDefined: (dt: number): void => {
      raw.swe_set_delta_t_userdef(dt);
    },

    /** Normalize degrees to 0-360 */
    normalizeDegrees: (x: number): number => {
      const ret = raw.swe_degnorm(x);
      return ret;
    },

    /** Normalize radians to 0-2π */
    normalizeRadians: (x: number): number => {
      const ret = raw.swe_radnorm(x);
      return ret;
    },

    /** Calculate midpoint in radians */
    radianMidpoint: (x1: number, x0: number): number => {
      const ret = raw.swe_rad_midp(x1, x0);
      return ret;
    },

    /** Calculate midpoint in degrees */
    degreeMidpoint: (x1: number, x0: number): number => {
      const ret = raw.swe_deg_midp(x1, x0);
      return ret;
    },

    /** Split degrees into components */
    splitDegrees: (ddeg: number, roundflag: number): SplitDegrees => {
      const idegPtr = raw.malloc(4);
      const iminPtr = raw.malloc(4);
      const isecPtr = raw.malloc(4);
      const dsecfrPtr = raw.malloc(8);
      const isgnPtr = raw.malloc(4);
      try {
        raw.swe_split_deg(ddeg, roundflag, idegPtr, iminPtr, isecPtr, dsecfrPtr, isgnPtr);
        return {
          degrees: mem.getInt32(idegPtr),
          minutes: mem.getInt32(iminPtr),
          seconds: mem.getInt32(isecPtr),
          secondFraction: mem.getFloat64(dsecfrPtr),
          sign: mem.getInt32(isgnPtr),
        };
      } finally {
        raw.free(idegPtr);
        raw.free(iminPtr);
        raw.free(isecPtr);
        raw.free(dsecfrPtr);
        raw.free(isgnPtr);
      }
    },

    /** Normalize centiseconds */
    normalizeCentiseconds: (p: number): number => {
      const ret = raw.swe_csnorm(p);
      return ret;
    },

    /** Difference in centiseconds (normalized) */
    differenceCentiseconds: (p1: number, p2: number): number => {
      const ret = raw.swe_difcsn(p1, p2);
      return ret;
    },

    /** Difference in degrees (normalized) */
    differenceDegrees: (p1: number, p2: number): number => {
      const ret = raw.swe_difdegn(p1, p2);
      return ret;
    },

    /** Difference in centiseconds (-180..180) */
    differenceCentiseconds2: (p1: number, p2: number): number => {
      const ret = raw.swe_difcs2n(p1, p2);
      return ret;
    },

    /** Difference in degrees (-180..180) */
    differenceDegrees2: (p1: number, p2: number): number => {
      const ret = raw.swe_difdeg2n(p1, p2);
      return ret;
    },

    /** Difference in radians (-π..π) */
    differenceRadians2: (p1: number, p2: number): number => {
      const ret = raw.swe_difrad2n(p1, p2);
      return ret;
    },

    /** Round centiseconds to seconds */
    roundCentiseconds: (x: number): number => {
      const ret = raw.swe_csroundsec(x);
      return ret;
    },

    /** Convert double to long */
    doubleToLong: (x: number): number => {
      const ret = raw.swe_d2l(x);
      return ret;
    },

    /** Get day of week (0=Mon) */
    dayOfWeek: (jd: number): number => {
      const ret = raw.swe_day_of_week(jd);
      return ret;
    },

    /** Access raw WASM interface for advanced usage */
    raw,

    /** Memory helpers for advanced usage */
    mem,
  };
}

export type SwissEph = Awaited<ReturnType<typeof createSwissEph>>;
