import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  createMemoryHelpers,
  loadSwissEph,
  type MemoryHelpers,
  SE_GREG_CAL,
  SE_JUPITER,
  SE_MARS,
  SE_MERCURY,
  SE_MOON,
  SE_SATURN,
  SE_SIDM_LAHIRI,
  // Constants
  SE_SUN,
  SE_TRUE_NODE,
  SE_VENUS,
  SEFLG_SIDEREAL,
  SEFLG_SPEED,
  type SwissEphWasm,
} from "../src/raw.js";

describe("SwissEph WASM", () => {
  let swe: SwissEphWasm;
  let mem: MemoryHelpers;

  beforeAll(async () => {
    swe = await loadSwissEph();
    mem = createMemoryHelpers(swe);
  });

  afterAll(() => {
    swe.swe_close();
  });

  describe("swe_julday", () => {
    it("calculates Julian Day for known date", () => {
      // J2000.0 epoch: 2000-01-01 12:00 UTC = JD 2451545.0
      const jd = swe.swe_julday(2000, 1, 1, 12.0, SE_GREG_CAL);
      expect(jd).toBeCloseTo(2451545.0, 5);
    });

    it("calculates Julian Day for 2024-01-01", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);
      expect(jd).toBeCloseTo(2460311.0, 5);
    });
  });

  describe("swe_revjul", () => {
    it("converts Julian Day back to date components", () => {
      const jd = 2451545.0; // J2000.0

      const yearPtr = swe.malloc(4);
      const monthPtr = swe.malloc(4);
      const dayPtr = swe.malloc(4);
      const hourPtr = swe.malloc(8);

      try {
        swe.swe_revjul(jd, SE_GREG_CAL, yearPtr, monthPtr, dayPtr, hourPtr);

        expect(mem.getInt32(yearPtr)).toBe(2000);
        expect(mem.getInt32(monthPtr)).toBe(1);
        expect(mem.getInt32(dayPtr)).toBe(1);
        expect(mem.getFloat64(hourPtr)).toBeCloseTo(12.0, 5);
      } finally {
        swe.free(yearPtr);
        swe.free(monthPtr);
        swe.free(dayPtr);
        swe.free(hourPtr);
      }
    });

    it("round-trips correctly", () => {
      const original = { year: 1990, month: 5, day: 15, hour: 10.5 };
      const jd = swe.swe_julday(
        original.year,
        original.month,
        original.day,
        original.hour,
        SE_GREG_CAL,
      );

      const yearPtr = swe.malloc(4);
      const monthPtr = swe.malloc(4);
      const dayPtr = swe.malloc(4);
      const hourPtr = swe.malloc(8);

      try {
        swe.swe_revjul(jd, SE_GREG_CAL, yearPtr, monthPtr, dayPtr, hourPtr);

        expect(mem.getInt32(yearPtr)).toBe(original.year);
        expect(mem.getInt32(monthPtr)).toBe(original.month);
        expect(mem.getInt32(dayPtr)).toBe(original.day);
        expect(mem.getFloat64(hourPtr)).toBeCloseTo(original.hour, 5);
      } finally {
        swe.free(yearPtr);
        swe.free(monthPtr);
        swe.free(dayPtr);
        swe.free(hourPtr);
      }
    });
  });

  describe("swe_calc_ut", () => {
    it("calculates Sun position", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);

      const xxPtr = swe.malloc(6 * 8); // 6 doubles
      const serrPtr = swe.malloc(256);

      try {
        const result = swe.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxPtr, serrPtr);

        expect(result).toBeGreaterThanOrEqual(0);

        const [longitude, latitude, distance] = mem.getFloat64Array(xxPtr, 3);

        // Sun should be around 280 degrees (Capricorn) on Jan 1
        expect(longitude).toBeGreaterThan(270);
        expect(longitude).toBeLessThan(290);
        // Sun latitude should be very close to 0
        expect(Math.abs(latitude)).toBeLessThan(0.01);
        // Earth-Sun distance should be around 0.983 AU (perihelion is early Jan)
        expect(distance).toBeGreaterThan(0.98);
        expect(distance).toBeLessThan(0.99);
      } finally {
        swe.free(xxPtr);
        swe.free(serrPtr);
      }
    });

    it("calculates Moon position", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);

      const xxPtr = swe.malloc(6 * 8);
      const serrPtr = swe.malloc(256);

      try {
        const result = swe.swe_calc_ut(
          jd,
          SE_MOON,
          SEFLG_SPEED,
          xxPtr,
          serrPtr,
        );

        expect(result).toBeGreaterThanOrEqual(0);

        const [longitude, latitude, distance] = mem.getFloat64Array(xxPtr, 3);

        // Longitude should be between 0 and 360
        expect(longitude).toBeGreaterThanOrEqual(0);
        expect(longitude).toBeLessThan(360);
        // Moon latitude is typically within +/- 5.3 degrees
        expect(latitude).toBeGreaterThan(-6);
        expect(latitude).toBeLessThan(6);
        // Moon distance in AU (average ~0.00257 AU)
        expect(distance).toBeGreaterThan(0.002);
        expect(distance).toBeLessThan(0.003);
      } finally {
        swe.free(xxPtr);
        swe.free(serrPtr);
      }
    });

    it("calculates all traditional planets", () => {
      const jd = swe.swe_julday(2024, 6, 15, 12.0, SE_GREG_CAL);
      const planets = [
        SE_SUN,
        SE_MOON,
        SE_MERCURY,
        SE_VENUS,
        SE_MARS,
        SE_JUPITER,
        SE_SATURN,
      ];

      const xxPtr = swe.malloc(6 * 8);
      const serrPtr = swe.malloc(256);

      try {
        for (const planet of planets) {
          const result = swe.swe_calc_ut(
            jd,
            planet,
            SEFLG_SPEED,
            xxPtr,
            serrPtr,
          );
          expect(result).toBeGreaterThanOrEqual(0);

          const longitude = mem.getFloat64(xxPtr);
          expect(longitude).toBeGreaterThanOrEqual(0);
          expect(longitude).toBeLessThan(360);
        }
      } finally {
        swe.free(xxPtr);
        swe.free(serrPtr);
      }
    });

    it("calculates Rahu (True Node)", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);

      const xxPtr = swe.malloc(6 * 8);
      const serrPtr = swe.malloc(256);

      try {
        const result = swe.swe_calc_ut(
          jd,
          SE_TRUE_NODE,
          SEFLG_SPEED,
          xxPtr,
          serrPtr,
        );

        expect(result).toBeGreaterThanOrEqual(0);

        const longitude = mem.getFloat64(xxPtr);
        expect(longitude).toBeGreaterThanOrEqual(0);
        expect(longitude).toBeLessThan(360);
      } finally {
        swe.free(xxPtr);
        swe.free(serrPtr);
      }
    });
  });

  describe("sidereal calculations", () => {
    it("calculates sidereal positions with Lahiri ayanamsa", () => {
      swe.swe_set_sid_mode(SE_SIDM_LAHIRI, 0, 0);
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);

      const xxTropicalPtr = swe.malloc(6 * 8);
      const xxSiderealPtr = swe.malloc(6 * 8);
      const serrPtr = swe.malloc(256);

      try {
        // Tropical
        swe.swe_calc_ut(jd, SE_SUN, SEFLG_SPEED, xxTropicalPtr, serrPtr);
        const tropicalLon = mem.getFloat64(xxTropicalPtr);

        // Sidereal
        swe.swe_calc_ut(
          jd,
          SE_SUN,
          SEFLG_SPEED | SEFLG_SIDEREAL,
          xxSiderealPtr,
          serrPtr,
        );
        const siderealLon = mem.getFloat64(xxSiderealPtr);

        // Get ayanamsa
        const ayanamsa = swe.swe_get_ayanamsa_ut(jd);

        // Lahiri ayanamsa is around 24 degrees in 2024
        expect(ayanamsa).toBeGreaterThan(24);
        expect(ayanamsa).toBeLessThan(25);

        // Sidereal longitude should be tropical minus ayanamsa (within 0.01 degree)
        const expectedSidereal = swe.swe_degnorm(tropicalLon - ayanamsa);
        expect(siderealLon).toBeCloseTo(expectedSidereal, 2);
      } finally {
        swe.free(xxTropicalPtr);
        swe.free(xxSiderealPtr);
        swe.free(serrPtr);
      }
    });
  });

  describe("swe_houses_ex", () => {
    it("calculates house cusps", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);
      // New Delhi coordinates
      const lat = 28.6139;
      const lon = 77.209;
      const hsys = 87; // 'W' = Whole Sign

      const cuspsPtr = swe.malloc(13 * 8); // 13 doubles
      const ascmcPtr = swe.malloc(10 * 8); // 10 doubles

      try {
        const result = swe.swe_houses_ex(
          jd,
          0, // flags
          lat,
          lon,
          hsys,
          cuspsPtr,
          ascmcPtr,
        );

        expect(result).toBeGreaterThanOrEqual(0);

        // Ascendant is first element of ascmc
        const ascendant = mem.getFloat64(ascmcPtr);
        expect(ascendant).toBeGreaterThanOrEqual(0);
        expect(ascendant).toBeLessThan(360);

        // MC is second element
        const mc = mem.getFloat64(ascmcPtr + 8);
        expect(mc).toBeGreaterThanOrEqual(0);
        expect(mc).toBeLessThan(360);
      } finally {
        swe.free(cuspsPtr);
        swe.free(ascmcPtr);
      }
    });
  });

  describe("swe_sidtime", () => {
    it("returns sidereal time in hours", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);
      const sidTime = swe.swe_sidtime(jd);

      // Sidereal time should be between 0 and 24 hours
      expect(sidTime).toBeGreaterThanOrEqual(0);
      expect(sidTime).toBeLessThan(24);
    });
  });

  describe("swe_degnorm", () => {
    it("normalizes degrees to 0-360 range", () => {
      expect(swe.swe_degnorm(0)).toBeCloseTo(0, 10);
      expect(swe.swe_degnorm(360)).toBeCloseTo(0, 10);
      expect(swe.swe_degnorm(450)).toBeCloseTo(90, 10);
      expect(swe.swe_degnorm(-90)).toBeCloseTo(270, 10);
      expect(swe.swe_degnorm(-360)).toBeCloseTo(0, 10);
    });
  });

  describe("swe_get_planet_name", () => {
    it("returns planet names", () => {
      const namePtr = swe.malloc(64);

      try {
        swe.swe_get_planet_name(SE_SUN, namePtr);
        expect(mem.getString(namePtr)).toBe("Sun");

        swe.swe_get_planet_name(SE_MOON, namePtr);
        expect(mem.getString(namePtr)).toBe("Moon");

        swe.swe_get_planet_name(SE_MARS, namePtr);
        expect(mem.getString(namePtr)).toBe("Mars");

        swe.swe_get_planet_name(SE_JUPITER, namePtr);
        expect(mem.getString(namePtr)).toBe("Jupiter");

        swe.swe_get_planet_name(SE_SATURN, namePtr);
        expect(mem.getString(namePtr)).toBe("Saturn");

        swe.swe_get_planet_name(SE_TRUE_NODE, namePtr);
        expect(mem.getString(namePtr)).toBe("true Node");
      } finally {
        swe.free(namePtr);
      }
    });
  });

  describe("Ketu calculation (manual)", () => {
    it("calculates Ketu as 180 degrees opposite to Rahu", () => {
      const jd = swe.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);

      const xxPtr = swe.malloc(6 * 8);
      const serrPtr = swe.malloc(256);

      try {
        // Get Rahu (True Node)
        swe.swe_calc_ut(jd, SE_TRUE_NODE, SEFLG_SPEED, xxPtr, serrPtr);
        const rahuLon = mem.getFloat64(xxPtr);

        // Ketu is 180 degrees opposite
        const ketuLon = swe.swe_degnorm(rahuLon + 180);

        // Verify the calculation
        const diff = Math.abs(ketuLon - rahuLon);
        expect(diff).toBeCloseTo(180, 4);
      } finally {
        swe.free(xxPtr);
        swe.free(serrPtr);
      }
    });
  });
});
