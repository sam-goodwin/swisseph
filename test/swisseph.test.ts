import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  Ayanamsa,
  CalcFlag,
  createSwissEph,
  HouseSystem,
  isCalcError,
  Planet,
  SwissEph,
} from "../src/index.js";

describe("SwissEph", () => {
  let swe: SwissEph;

  beforeAll(async () => {
    swe = await createSwissEph();
  });

  afterAll(() => {
    swe.close();
  });

  describe("julday", () => {
    it("calculates Julian Day for known date", () => {
      // J2000.0 epoch: 2000-01-01 12:00 UTC = JD 2451545.0
      const jd = swe.julday(2000, 1, 1, 12.0);
      expect(jd).toBeCloseTo(2451545.0, 5);
    });

    it("calculates Julian Day for 2024-01-01", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      expect(jd).toBeCloseTo(2460311.0, 5);
    });
  });

  describe("revjul", () => {
    it("converts Julian Day back to date components", () => {
      const jd = 2451545.0; // J2000.0
      const date = swe.revjul(jd);
      expect(date.year).toBe(2000);
      expect(date.month).toBe(1);
      expect(date.day).toBe(1);
      expect(date.hour).toBeCloseTo(12.0, 5);
    });

    it("round-trips correctly", () => {
      const original = { year: 1990, month: 5, day: 15, hour: 10.5 };
      const jd = swe.julday(
        original.year,
        original.month,
        original.day,
        original.hour,
      );
      const result = swe.revjul(jd);
      expect(result.year).toBe(original.year);
      expect(result.month).toBe(original.month);
      expect(result.day).toBe(original.day);
      expect(result.hour).toBeCloseTo(original.hour, 5);
    });
  });

  describe("calc", () => {
    it("calculates Sun position", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      const result = swe.calc(jd, Planet.SUN, CalcFlag.SPEED);

      expect(isCalcError(result)).toBe(false);
      if (!isCalcError(result)) {
        // Sun should be around 280 degrees (Capricorn) on Jan 1
        expect(result.longitude).toBeGreaterThan(270);
        expect(result.longitude).toBeLessThan(290);
        // Sun latitude should be very close to 0
        expect(Math.abs(result.latitude)).toBeLessThan(0.01);
        // Earth-Sun distance should be around 0.983 AU (perihelion is early Jan)
        expect(result.distance).toBeGreaterThan(0.98);
        expect(result.distance).toBeLessThan(0.99);
      }
    });

    it("calculates Moon position", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      const result = swe.calc(jd, Planet.MOON, CalcFlag.SPEED);

      expect(isCalcError(result)).toBe(false);
      if (!isCalcError(result)) {
        // Longitude should be between 0 and 360
        expect(result.longitude).toBeGreaterThanOrEqual(0);
        expect(result.longitude).toBeLessThan(360);
        // Moon latitude is typically within +/- 5.3 degrees
        expect(result.latitude).toBeGreaterThan(-6);
        expect(result.latitude).toBeLessThan(6);
        // Moon distance in AU (average ~0.00257 AU)
        expect(result.distance).toBeGreaterThan(0.002);
        expect(result.distance).toBeLessThan(0.003);
      }
    });

    it("calculates all traditional planets", () => {
      const jd = swe.julday(2024, 6, 15, 12.0);
      const planets = [
        Planet.SUN,
        Planet.MOON,
        Planet.MERCURY,
        Planet.VENUS,
        Planet.MARS,
        Planet.JUPITER,
        Planet.SATURN,
      ];

      for (const planet of planets) {
        const result = swe.calc(jd, planet, CalcFlag.SPEED);
        expect(isCalcError(result)).toBe(false);
        if (!isCalcError(result)) {
          expect(result.longitude).toBeGreaterThanOrEqual(0);
          expect(result.longitude).toBeLessThan(360);
        }
      }
    });

    it("calculates Rahu (True Node)", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      const result = swe.calc(jd, Planet.TRUE_NODE, CalcFlag.SPEED);

      expect(isCalcError(result)).toBe(false);
      if (!isCalcError(result)) {
        expect(result.longitude).toBeGreaterThanOrEqual(0);
        expect(result.longitude).toBeLessThan(360);
      }
    });
  });

  describe("calcKetu", () => {
    it("calculates Ketu as 180 degrees opposite to Rahu", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      const rahu = swe.calc(jd, Planet.TRUE_NODE, CalcFlag.SPEED);
      const ketu = swe.calcKetu(jd);

      expect(isCalcError(rahu)).toBe(false);
      expect(isCalcError(ketu)).toBe(false);

      if (!isCalcError(rahu) && !isCalcError(ketu)) {
        const diff = Math.abs(ketu.longitude - rahu.longitude);
        // Should be exactly 180 degrees apart (normalized)
        expect(diff).toBeCloseTo(180, 4);
      }
    });
  });

  describe("sidereal calculations", () => {
    it("calculates sidereal positions with Lahiri ayanamsa", () => {
      swe.setSiderealMode(Ayanamsa.LAHIRI);
      const jd = swe.julday(2024, 1, 1, 12.0);

      const tropical = swe.calc(jd, Planet.SUN, CalcFlag.SPEED);
      const sidereal = swe.calcSidereal(jd, Planet.SUN);
      const ayanamsa = swe.getAyanamsa(jd);

      expect(isCalcError(tropical)).toBe(false);
      expect(isCalcError(sidereal)).toBe(false);

      if (!isCalcError(tropical) && !isCalcError(sidereal)) {
        // Lahiri ayanamsa is around 24 degrees in 2024
        expect(ayanamsa).toBeGreaterThan(24);
        expect(ayanamsa).toBeLessThan(25);

        // Sidereal longitude should be tropical minus ayanamsa
        const expectedSidereal = swe.normalizeDegrees(
          tropical.longitude - ayanamsa,
        );
        expect(sidereal.longitude).toBeCloseTo(expectedSidereal, 4);
      }
    });
  });

  describe("houses", () => {
    it("calculates house cusps for whole sign system", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      // New Delhi coordinates
      const lat = 28.6139;
      const lon = 77.209;

      const houses = swe.houses(jd, lat, lon, HouseSystem.WHOLE_SIGN);

      // Should have 13 cusps (index 0 unused, 1-12 are houses)
      expect(houses.cusps).toHaveLength(13);
      // Ascendant should be a valid degree
      expect(houses.ascendant).toBeGreaterThanOrEqual(0);
      expect(houses.ascendant).toBeLessThan(360);
      // MC should be a valid degree
      expect(houses.mc).toBeGreaterThanOrEqual(0);
      expect(houses.mc).toBeLessThan(360);
    });

    it("calculates sidereal house cusps", () => {
      swe.setSiderealMode(Ayanamsa.LAHIRI);
      const jd = swe.julday(2024, 1, 1, 12.0);
      const lat = 28.6139;
      const lon = 77.209;

      const tropical = swe.houses(jd, lat, lon, HouseSystem.WHOLE_SIGN);
      const sidereal = swe.housesSidereal(jd, lat, lon, HouseSystem.WHOLE_SIGN);

      // Sidereal ascendant should be less than tropical (shifted back by ayanamsa)
      const ayanamsa = swe.getAyanamsa(jd);
      const expectedAsc = swe.normalizeDegrees(tropical.ascendant - ayanamsa);
      expect(sidereal.ascendant).toBeCloseTo(expectedAsc, 2);
    });
  });

  describe("siderealTime", () => {
    it("returns sidereal time in hours", () => {
      const jd = swe.julday(2024, 1, 1, 12.0);
      const sidTime = swe.siderealTime(jd);

      // Sidereal time should be between 0 and 24 hours
      expect(sidTime).toBeGreaterThanOrEqual(0);
      expect(sidTime).toBeLessThan(24);
    });
  });

  describe("normalizeDegrees", () => {
    it("normalizes degrees to 0-360 range", () => {
      expect(swe.normalizeDegrees(0)).toBeCloseTo(0, 10);
      expect(swe.normalizeDegrees(360)).toBeCloseTo(0, 10);
      expect(swe.normalizeDegrees(450)).toBeCloseTo(90, 10);
      expect(swe.normalizeDegrees(-90)).toBeCloseTo(270, 10);
      expect(swe.normalizeDegrees(-360)).toBeCloseTo(0, 10);
    });
  });

  describe("getPlanetName", () => {
    it("returns planet names", () => {
      expect(swe.getPlanetName(Planet.SUN)).toBe("Sun");
      expect(swe.getPlanetName(Planet.MOON)).toBe("Moon");
      expect(swe.getPlanetName(Planet.MARS)).toBe("Mars");
      expect(swe.getPlanetName(Planet.JUPITER)).toBe("Jupiter");
      expect(swe.getPlanetName(Planet.SATURN)).toBe("Saturn");
      expect(swe.getPlanetName(Planet.TRUE_NODE)).toBe("true Node");
    });
  });
});
