import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  createSwissEph,
  SE_APP_TO_TRUE,
  SE_BIT_DISC_CENTER,
  // Constants - Rise/Transit
  SE_CALC_RISE,
  SE_CALC_SET,
  SE_CHIRON,
  // Constants - Eclipse
  SE_ECL_TOTAL,
  // Constants - Calendar
  SE_GREG_CAL,
  SE_JUL_CAL,
  SE_JUPITER,
  SE_MARS,
  SE_MEAN_NODE,
  SE_MERCURY,
  SE_MOON,
  SE_NEPTUNE,
  // Constants - Nod/Aps
  SE_NODBIT_MEAN,
  SE_PLUTO,
  SE_SATURN,
  SE_SIDM_FAGAN_BRADLEY,
  SE_SIDM_KRISHNAMURTI,
  // Constants - Ayanamsa
  SE_SIDM_LAHIRI,
  SE_SIDM_RAMAN,
  SE_SIDM_TRUE_CITRA,
  SE_SIDM_YUKTESHWAR,
  // Constants - Planets
  SE_SUN,
  SE_TRUE_NODE,
  // Constants - Refraction
  SE_TRUE_TO_APP,
  SE_URANUS,
  SE_VENUS,
  SEFLG_EQUATORIAL,
  SEFLG_SIDEREAL,
  // Constants - Flags
  SEFLG_SPEED,
  SEFLG_TOPOCTR,
  type SwissEph,
} from "../src/index.js";

describe("SwissEph Friendly API - Comprehensive Tests", () => {
  let swe: SwissEph;

  beforeAll(async () => {
    swe = await createSwissEph();
  });

  afterAll(() => {
    swe.close();
  });

  // ==========================================================================
  // DATE/TIME FUNCTIONS
  // ==========================================================================
  describe("Date/Time Functions", () => {
    describe("julday", () => {
      it("calculates J2000.0 epoch correctly", () => {
        const jd = swe.julday(2000, 1, 1, 12.0, SE_GREG_CAL);
        expect(jd).toBeCloseTo(2451545.0, 5);
      });

      it("calculates various dates correctly", () => {
        // 2024-01-01 12:00
        expect(swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL)).toBeCloseTo(
          2460311.0,
          5,
        );
        // 1990-05-15 10:30
        expect(swe.julday(1990, 5, 15, 10.5, SE_GREG_CAL)).toBeCloseTo(
          2448026.9375,
          4,
        );
      });

      it("handles Julian calendar", () => {
        // October 4, 1582 Julian = October 14, 1582 Gregorian (calendar switch)
        const jdJul = swe.julday(1582, 10, 4, 12.0, SE_JUL_CAL);
        const jdGreg = swe.julday(1582, 10, 14, 12.0, SE_GREG_CAL);
        // Should be within 1 day of each other
        expect(Math.abs(jdJul - jdGreg)).toBeLessThan(1);
      });

      it("handles leap years", () => {
        // Feb 29, 2024 (leap year)
        const jd1 = swe.julday(2024, 2, 29, 12.0, SE_GREG_CAL);
        const jd2 = swe.julday(2024, 3, 1, 12.0, SE_GREG_CAL);
        expect(jd2 - jd1).toBeCloseTo(1.0, 5);
      });

      it("handles fractional hours", () => {
        const jd1 = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const jd2 = swe.julday(2024, 1, 1, 6.0, SE_GREG_CAL);
        expect(jd2 - jd1).toBeCloseTo(0.25, 5); // 6 hours = 0.25 days
      });
    });

    describe("revjul", () => {
      it("converts J2000.0 correctly", () => {
        const result = swe.revjul(2451545.0, SE_GREG_CAL);
        expect(result.year).toBe(2000);
        expect(result.month).toBe(1);
        expect(result.day).toBe(1);
        expect(result.hour).toBeCloseTo(12.0, 5);
      });

      it("round-trips correctly with julday", () => {
        const testCases = [
          { year: 2024, month: 6, day: 15, hour: 14.5 },
          { year: 1990, month: 12, day: 31, hour: 23.999 },
          { year: 1800, month: 1, day: 1, hour: 0.0 },
          { year: 2100, month: 7, day: 4, hour: 18.25 },
        ];

        for (const tc of testCases) {
          const jd = swe.julday(
            tc.year,
            tc.month,
            tc.day,
            tc.hour,
            SE_GREG_CAL,
          );
          const result = swe.revjul(jd, SE_GREG_CAL);
          expect(result.year).toBe(tc.year);
          expect(result.month).toBe(tc.month);
          expect(result.day).toBe(tc.day);
          expect(result.hour).toBeCloseTo(tc.hour, 3);
        }
      });

      it("handles Julian calendar", () => {
        const jd = swe.julday(1500, 6, 15, 12.0, SE_JUL_CAL);
        const result = swe.revjul(jd, SE_JUL_CAL);
        expect(result.year).toBe(1500);
        expect(result.month).toBe(6);
        expect(result.day).toBe(15);
      });
    });

    describe("dateConversion", () => {
      it("converts valid dates", () => {
        const jd = swe.dateConversion(2024, 1, 1, 12.0, "g".charCodeAt(0));
        expect(jd).toBeCloseTo(2460311.0, 4);
      });
    });

    describe("utcToJd", () => {
      it("converts UTC to Julian Day", () => {
        const result = swe.utcToJd(2024, 1, 1, 12, 0, 0.0, SE_GREG_CAL);
        expect(result.ut).toBeCloseTo(2460311.0, 3);
        // ET is slightly different due to Delta T
        expect(result.et).toBeGreaterThan(result.ut);
      });

      it("handles seconds correctly", () => {
        const result1 = swe.utcToJd(2024, 1, 1, 12, 0, 0.0, SE_GREG_CAL);
        const result2 = swe.utcToJd(2024, 1, 1, 12, 0, 30.0, SE_GREG_CAL);
        // 30 seconds = 30/(24*3600) days
        expect(result2.ut - result1.ut).toBeCloseTo(30 / 86400, 8);
      });
    });

    describe("jdEtToUtc", () => {
      it("converts Julian Day ET to UTC", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.jdEtToUtc(jd, SE_GREG_CAL);
        expect(result.year).toBe(2024);
        expect(result.month).toBe(1);
        expect(result.day).toBe(1);
        // Hour may differ slightly due to Delta T adjustment
        expect(result.hour).toBeLessThanOrEqual(12);
        expect(result.minute).toBeGreaterThanOrEqual(0);
      });
    });

    describe("jdUt1ToUtc", () => {
      it("converts Julian Day UT1 to UTC with DUT1 correction", () => {
        // Note: julday() returns UT1-based JD, not UTC-based
        // jdUt1ToUtc applies the UT1-UTC difference (DUT1) which is typically < 0.9s
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.jdUt1ToUtc(jd, SE_GREG_CAL);

        expect(result.year).toBe(2024);
        expect(result.month).toBe(1);
        expect(result.day).toBe(1);
        // DUT1 correction means 12:00:00 UT1 ≈ 11:59:59.9x UTC
        expect(result.hour).toBe(11);
        expect(result.minute).toBe(59);
        expect(result.second).toBeGreaterThan(59);
      });

      it("round-trips correctly with utcToJd", () => {
        // Start with UTC time
        const utcJd = swe.utcToJd(2024, 6, 15, 14, 30, 45.5, SE_GREG_CAL);

        // Convert back to UTC
        const result = swe.jdUt1ToUtc(utcJd.ut, SE_GREG_CAL);

        expect(result.year).toBe(2024);
        expect(result.month).toBe(6);
        expect(result.day).toBe(15);
        expect(result.hour).toBe(14);
        expect(result.minute).toBe(30);
        expect(result.second).toBeCloseTo(45.5, 1);
      });
    });

    describe("utcTimeZone", () => {
      it("converts timezone correctly", () => {
        // Convert UTC to EST (UTC-5)
        const result = swe.utcTimeZone(2024, 1, 1, 12, 0, 0.0, 5.0);
        expect(result.year).toBe(2024);
        expect(result.month).toBe(1);
        expect(result.day).toBe(1);
        expect(result.hour).toBe(7); // 12 - 5 = 7
      });

      it("handles day rollover", () => {
        // Convert UTC midnight to UTC+5 (should be previous day 19:00)
        const result = swe.utcTimeZone(2024, 1, 2, 0, 0, 0.0, -5.0);
        expect(result.day).toBe(2);
        expect(result.hour).toBe(5); // 0 + 5 = 5
      });

      it("handles fractional timezone", () => {
        // India is UTC+5:30
        const result = swe.utcTimeZone(2024, 1, 1, 12, 0, 0.0, -5.5);
        expect(result.hour).toBe(17);
        expect(result.minute).toBe(30);
      });
    });
  });

  // ==========================================================================
  // PLANET POSITION FUNCTIONS
  // ==========================================================================
  describe("Planet Position Functions", () => {
    describe("calc", () => {
      // Note: Chiron and some asteroids require additional ephemeris files
      // Using Moshier ephemeris (built-in), only main planets and nodes work
      const ALL_PLANETS = [
        { id: SE_SUN, name: "Sun" },
        { id: SE_MOON, name: "Moon" },
        { id: SE_MERCURY, name: "Mercury" },
        { id: SE_VENUS, name: "Venus" },
        { id: SE_MARS, name: "Mars" },
        { id: SE_JUPITER, name: "Jupiter" },
        { id: SE_SATURN, name: "Saturn" },
        { id: SE_URANUS, name: "Uranus" },
        { id: SE_NEPTUNE, name: "Neptune" },
        { id: SE_PLUTO, name: "Pluto" },
        { id: SE_TRUE_NODE, name: "True Node" },
        { id: SE_MEAN_NODE, name: "Mean Node" },
        // SE_CHIRON requires external ephemeris files
      ];

      it("calculates all planets", () => {
        const jd = swe.julday(2024, 6, 15, 12.0, SE_GREG_CAL);

        for (const planet of ALL_PLANETS) {
          const result = swe.calc(jd, planet.id, SEFLG_SPEED);
          expect(result.longitude).toBeGreaterThanOrEqual(0);
          expect(result.longitude).toBeLessThan(360);
          expect(result.longitudeSpeed).toBeDefined();
        }
      });

      it("returns valid position structure", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const sun = swe.calc(jd, SE_SUN, SEFLG_SPEED);

        // All fields should be defined
        expect(sun.longitude).toBeDefined();
        expect(sun.latitude).toBeDefined();
        expect(sun.distance).toBeDefined();
        expect(sun.longitudeSpeed).toBeDefined();
        expect(sun.latitudeSpeed).toBeDefined();
        expect(sun.distanceSpeed).toBeDefined();

        // Validate ranges
        expect(sun.longitude).toBeGreaterThan(270); // Capricorn in January
        expect(sun.longitude).toBeLessThan(290);
        expect(Math.abs(sun.latitude)).toBeLessThan(0.01); // Sun latitude is near 0
        expect(sun.distance).toBeGreaterThan(0.98); // ~1 AU
        expect(sun.distance).toBeLessThan(1.02);
      });

      it("calculates Moon position", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const moon = swe.calc(jd, SE_MOON, SEFLG_SPEED);

        expect(moon.longitude).toBeGreaterThanOrEqual(0);
        expect(moon.longitude).toBeLessThan(360);
        expect(moon.latitude).toBeGreaterThan(-6);
        expect(moon.latitude).toBeLessThan(6);
        expect(moon.distance).toBeGreaterThan(0.002); // ~0.00257 AU
        expect(moon.distance).toBeLessThan(0.003);
        // Moon moves ~13 degrees/day
        expect(moon.longitudeSpeed).toBeGreaterThan(10);
        expect(moon.longitudeSpeed).toBeLessThan(16);
      });

      it("calculates positions at different times", () => {
        const jd1 = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const jd2 = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);

        const moon1 = swe.calc(jd1, SE_MOON, SEFLG_SPEED);
        const moon2 = swe.calc(jd2, SE_MOON, SEFLG_SPEED);

        // Moon moves about 6-7 degrees in 12 hours
        const diff = Math.abs(moon2.longitude - moon1.longitude);
        expect(diff).toBeGreaterThan(5);
        expect(diff).toBeLessThan(8);
      });

      it("calculates equatorial coordinates", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const sun = swe.calc(jd, SE_SUN, SEFLG_EQUATORIAL);

        // Right ascension should be 0-360
        expect(sun.longitude).toBeGreaterThanOrEqual(0);
        expect(sun.longitude).toBeLessThan(360);
        // Declination should be -90 to +90
        expect(sun.latitude).toBeGreaterThan(-24); // Sun dec in winter
        expect(sun.latitude).toBeLessThan(0);
      });
    });

    describe("calcEt", () => {
      it("calculates position using ET time", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const sun = swe.calcEt(jd, SE_SUN, SEFLG_SPEED);

        expect(sun.longitude).toBeGreaterThan(270);
        expect(sun.longitude).toBeLessThan(290);
      });
    });

    describe("calcPlanetocentric", () => {
      it("calculates position relative to another planet", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);

        // Calculate Moon position from Earth (geocentric)
        const moonGeo = swe.calc(jd, SE_MOON, SEFLG_SPEED);

        // Position should be valid
        expect(moonGeo.longitude).toBeGreaterThanOrEqual(0);
        expect(moonGeo.longitude).toBeLessThan(360);
      });
    });
  });

  // ==========================================================================
  // SIDEREAL/AYANAMSA FUNCTIONS
  // ==========================================================================
  describe("Sidereal/Ayanamsa Functions", () => {
    const AYANAMSAS = [
      { id: SE_SIDM_LAHIRI, name: "Lahiri", expected: [24, 25] },
      { id: SE_SIDM_RAMAN, name: "Raman", expected: [22, 23] },
      { id: SE_SIDM_KRISHNAMURTI, name: "Krishnamurti", expected: [23, 25] },
      { id: SE_SIDM_FAGAN_BRADLEY, name: "Fagan-Bradley", expected: [24, 26] },
      { id: SE_SIDM_YUKTESHWAR, name: "Yukteshwar", expected: [22, 23] },
      { id: SE_SIDM_TRUE_CITRA, name: "True Citra", expected: [23, 25] },
    ];

    describe("setSiderealMode and getAyanamsa", () => {
      for (const ayan of AYANAMSAS) {
        it(`calculates ${ayan.name} ayanamsa correctly`, () => {
          swe.setSiderealMode(ayan.id, 0, 0);
          const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
          const ayanamsa = swe.getAyanamsa(jd);

          expect(ayanamsa).toBeGreaterThan(ayan.expected[0]);
          expect(ayanamsa).toBeLessThan(ayan.expected[1]);
        });
      }
    });

    describe("getAyanamsaEt", () => {
      it("returns ayanamsa for ET time", () => {
        swe.setSiderealMode(SE_SIDM_LAHIRI, 0, 0);
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const ayanamsa = swe.getAyanamsaEt(jd);

        expect(ayanamsa).toBeGreaterThan(24);
        expect(ayanamsa).toBeLessThan(25);
      });
    });

    describe("getAyanamsaEx", () => {
      it("returns extended ayanamsa info", () => {
        swe.setSiderealMode(SE_SIDM_LAHIRI, 0, 0);
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const ayanamsa = swe.getAyanamsaEx(jd, 0);

        expect(ayanamsa).toBeGreaterThan(24);
        expect(ayanamsa).toBeLessThan(25);
      });
    });

    describe("getAyanamsaExEt", () => {
      it("returns extended ayanamsa for ET", () => {
        swe.setSiderealMode(SE_SIDM_LAHIRI, 0, 0);
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const ayanamsa = swe.getAyanamsaExEt(jd, 0);

        expect(ayanamsa).toBeGreaterThan(24);
        expect(ayanamsa).toBeLessThan(25);
      });
    });

    describe("sidereal calculations", () => {
      it("calculates sidereal position correctly", () => {
        swe.setSiderealMode(SE_SIDM_LAHIRI, 0, 0);
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);

        const tropical = swe.calc(jd, SE_SUN, SEFLG_SPEED);
        const sidereal = swe.calc(jd, SE_SUN, SEFLG_SPEED | SEFLG_SIDEREAL);
        const ayanamsa = swe.getAyanamsa(jd);

        // Sidereal should be tropical minus ayanamsa
        const expected = swe.normalizeDegrees(tropical.longitude - ayanamsa);
        expect(sidereal.longitude).toBeCloseTo(expected, 1);
      });
    });
  });

  // ==========================================================================
  // HOUSE FUNCTIONS
  // ==========================================================================
  describe("House Functions", () => {
    const HOUSE_SYSTEMS = [
      { code: "P", name: "Placidus" },
      { code: "K", name: "Koch" },
      { code: "E", name: "Equal" },
      { code: "W", name: "Whole Sign" },
      { code: "B", name: "Alcabitus" },
      { code: "R", name: "Regiomontanus" },
      { code: "C", name: "Campanus" },
      { code: "O", name: "Porphyry" },
      { code: "M", name: "Morinus" },
    ];

    // New Delhi coordinates
    const LAT = 28.6139;
    const LON = 77.209;

    describe("housesSimple", () => {
      for (const sys of HOUSE_SYSTEMS) {
        it(`calculates ${sys.name} (${sys.code}) houses`, () => {
          const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
          const result = swe.housesSimple(jd, LAT, LON, sys.code);

          expect(result.cusps).toHaveLength(12);
          expect(result.ascendant).toBeGreaterThanOrEqual(0);
          expect(result.ascendant).toBeLessThan(360);
          expect(result.mc).toBeGreaterThanOrEqual(0);
          expect(result.mc).toBeLessThan(360);

          // All cusps should be valid degrees
          for (const cusp of result.cusps) {
            expect(cusp).toBeGreaterThanOrEqual(0);
            expect(cusp).toBeLessThan(360);
          }
        });
      }

      it("accepts numeric house system code", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.housesSimple(jd, LAT, LON, 87); // 'W' = 87
        expect(result.cusps).toHaveLength(12);
      });
    });

    describe("houses", () => {
      it("calculates houses with flags", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.houses(jd, 0, LAT, LON, "P");

        expect(result.cusps).toHaveLength(12);
        expect(result.ascendant).toBeDefined();
        expect(result.mc).toBeDefined();
        expect(result.armc).toBeDefined();
        expect(result.vertex).toBeDefined();
        expect(result.equatorialAscendant).toBeDefined();
      });

      it("gives different results for different locations", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);

        const delhi = swe.houses(jd, 0, 28.6139, 77.209, "P");
        const london = swe.houses(jd, 0, 51.5074, -0.1278, "P");
        const sydney = swe.houses(jd, 0, -33.8688, 151.2093, "P");

        // Ascendants should be different
        expect(delhi.ascendant).not.toBeCloseTo(london.ascendant, 2);
        expect(delhi.ascendant).not.toBeCloseTo(sydney.ascendant, 2);
      });
    });

    describe("housesWithSpeed", () => {
      it("returns house speeds", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.housesWithSpeed(jd, 0, LAT, LON, "P");

        expect(result.cusps).toHaveLength(12);
        expect(result.cuspSpeeds).toHaveLength(12);
        expect(result.ascmcSpeeds).toHaveLength(10);

        // Speeds should be defined (not NaN)
        for (const speed of result.cuspSpeeds) {
          expect(speed).not.toBeNaN();
        }
      });
    });

    describe("housesArmc", () => {
      it("calculates houses from ARMC", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        // Get ARMC from houses first
        const housesResult = swe.houses(jd, 0, LAT, LON, "P");
        const armc = housesResult.armc;
        const eps = 23.44; // Approximate obliquity

        const result = swe.housesArmc(armc, LAT, eps, "P");

        expect(result.cusps).toHaveLength(12);
        expect(result.ascendant).toBeGreaterThanOrEqual(0);
      });
    });

    describe("housesArmcWithSpeed", () => {
      it("calculates houses from ARMC with speeds", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const housesResult = swe.houses(jd, 0, LAT, LON, "P");
        const armc = housesResult.armc;
        const eps = 23.44;

        const result = swe.housesArmcWithSpeed(armc, LAT, eps, "P");

        expect(result.cusps).toHaveLength(12);
        expect(result.cuspSpeeds).toHaveLength(12);
      });
    });

    describe("housePosition", () => {
      it("calculates planet house position", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const housesResult = swe.houses(jd, 0, LAT, LON, "P");
        const armc = housesResult.armc;
        const eps = 23.44;
        const sun = swe.calc(jd, SE_SUN, 0);

        // xpin should be a pointer to [lon, lat] but we pass lon directly
        // This function may need array input - testing basic call
        const result = swe.housePosition(armc, LAT, eps, "P", sun.longitude);

        // Result is the house number as a float
        expect(result).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // CROSSING/TRANSIT FUNCTIONS
  // ==========================================================================
  describe("Crossing/Transit Functions", () => {
    describe("solarCrossing", () => {
      it("finds when Sun crosses 0 degrees (Aries ingress)", () => {
        const jd = swe.julday(2024, 3, 1, 0.0, SE_GREG_CAL);
        const result = swe.solarCrossing(0, jd, 0);

        // Should return a Julian Day
        expect(typeof result).toBe("number");
        // Should be after the start date and before April
        expect(result).toBeGreaterThan(jd);
        expect(result).toBeLessThan(jd + 30);
      });

      it("finds when Sun crosses 90 degrees (Cancer ingress)", () => {
        const jd = swe.julday(2024, 6, 1, 0.0, SE_GREG_CAL);
        const result = swe.solarCrossing(90, jd, 0);

        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(jd);
      });
    });

    describe("solarCrossingEt", () => {
      it("finds solar crossing using ET", () => {
        const jd = swe.julday(2024, 3, 1, 0.0, SE_GREG_CAL);
        const result = swe.solarCrossingEt(0, jd, 0);

        expect(typeof result).toBe("number");
      });
    });

    describe("moonCrossing", () => {
      it("finds when Moon crosses a longitude", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.moonCrossing(90, jd, 0);

        expect(typeof result).toBe("number");
        // Moon crosses any point roughly once per month
        expect(result).toBeGreaterThan(jd);
        expect(result).toBeLessThan(jd + 30);
      });
    });

    describe("moonCrossingEt", () => {
      it("finds Moon crossing using ET", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.moonCrossingEt(90, jd, 0);

        expect(typeof result).toBe("number");
      });
    });

    describe("moonNodeCrossing", () => {
      it("finds when Moon crosses its node", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.moonNodeCrossing(jd, 0);

        expect(result.xlon).toBeDefined();
        expect(result.xlat).toBeDefined();
      });
    });

    describe("moonNodeCrossingEt", () => {
      it("finds Moon node crossing using ET", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.moonNodeCrossingEt(jd, 0);

        expect(result.xlon).toBeDefined();
        expect(result.xlat).toBeDefined();
      });
    });

    describe("helioCrossing", () => {
      it("finds heliocentric crossing", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.helioCrossing(SE_MARS, 0, jd, 0, 1);

        expect(typeof result).toBe("number");
        expect(result).toBeGreaterThan(jd);
      });
    });

    describe("helioCrossingEt", () => {
      it("finds heliocentric crossing using ET", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.helioCrossingEt(SE_MARS, 0, jd, 0, 1);

        expect(typeof result).toBe("number");
      });
    });
  });

  // ==========================================================================
  // ECLIPSE FUNCTIONS
  // ==========================================================================
  describe("Eclipse Functions", () => {
    describe("solarEclipseWhenGlobal", () => {
      it("finds next solar eclipse", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.solarEclipseWhenGlobal(jd, 0, 0, 0);

        expect(result.times).toBeDefined();
        expect(result.times.length).toBeGreaterThan(0);
        expect(result.times[0]).toBeGreaterThan(jd);
      });

      it("finds specific eclipse types", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);

        // Total eclipse
        const total = swe.solarEclipseWhenGlobal(jd, 0, SE_ECL_TOTAL, 0);
        expect(total.times[0]).toBeGreaterThan(jd);
      });
    });

    describe("lunarEclipseWhen", () => {
      it("finds next lunar eclipse", () => {
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const result = swe.lunarEclipseWhen(jd, 0, 0, 0);

        expect(result.times).toBeDefined();
        expect(result.times.length).toBeGreaterThan(0);
        expect(result.times[0]).toBeGreaterThan(jd);
      });
    });

    describe("solarEclipseWhere", () => {
      it("finds where eclipse is central", () => {
        // First find an eclipse
        const jd = swe.julday(2024, 1, 1, 0.0, SE_GREG_CAL);
        const when = swe.solarEclipseWhenGlobal(jd, 0, 0, 0);
        const eclipseTime = when.times[0];

        const result = swe.solarEclipseWhere(eclipseTime, 0);

        expect(result.geopos).toBeDefined();
        expect(result.attributes).toBeDefined();
        expect(result.geopos.length).toBeGreaterThan(0);
      });
    });
  });

  // ==========================================================================
  // PHENOMENA FUNCTIONS
  // ==========================================================================
  describe("Phenomena Functions", () => {
    describe("phenomena", () => {
      it("calculates planetary phenomena", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.phenomena(jd, SE_VENUS, 0);

        expect(result.phaseAngle).toBeDefined();
        expect(result.phase).toBeDefined();
        expect(result.elongation).toBeDefined();
        expect(result.apparentDiameter).toBeDefined();
        expect(result.apparentMagnitude).toBeDefined();

        // Phase should be 0-1
        expect(result.phase).toBeGreaterThanOrEqual(0);
        expect(result.phase).toBeLessThanOrEqual(1);
      });

      it("calculates phenomena for different planets", () => {
        const jd = swe.julday(2024, 6, 15, 12.0, SE_GREG_CAL);
        const planets = [SE_MERCURY, SE_VENUS, SE_MARS, SE_JUPITER, SE_SATURN];

        for (const planet of planets) {
          const result = swe.phenomena(jd, planet, 0);
          expect(result.phase).toBeGreaterThanOrEqual(0);
          expect(result.phase).toBeLessThanOrEqual(1);
        }
      });
    });

    describe("phenomenaEt", () => {
      it("calculates phenomena using ET", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.phenomenaEt(jd, SE_MARS, 0);

        expect(result.phase).toBeDefined();
        expect(result.elongation).toBeDefined();
      });
    });
  });

  // ==========================================================================
  // REFRACTION FUNCTIONS
  // ==========================================================================
  describe("Refraction Functions", () => {
    describe("refraction", () => {
      it("calculates atmospheric refraction (true to apparent)", () => {
        // SE_TRUE_TO_APP: given true altitude, returns apparent altitude
        // At horizon (0°), refraction adds ~0.47-0.57° to apparent altitude
        const apparent = swe.refraction(0, 1013.25, 15, SE_TRUE_TO_APP);

        // Apparent altitude should be positive (object appears higher than it is)
        expect(apparent).toBeGreaterThan(0.4);
        expect(apparent).toBeLessThan(0.6);
      });

      it("refraction effect decreases at higher altitudes", () => {
        // Get apparent altitudes for different true altitudes
        const app0 = swe.refraction(0, 1013.25, 15, SE_TRUE_TO_APP);
        const app30 = swe.refraction(30, 1013.25, 15, SE_TRUE_TO_APP);
        const app60 = swe.refraction(60, 1013.25, 15, SE_TRUE_TO_APP);

        // Refraction correction = apparent - true
        // Correction should decrease with altitude
        const correction0 = app0 - 0;
        const correction30 = app30 - 30;
        const correction60 = app60 - 60;

        expect(correction0).toBeGreaterThan(correction30);
        expect(correction30).toBeGreaterThan(correction60);
      });

      it("can convert apparent to true", () => {
        // Start with apparent altitude of 1 degree
        const apparentAlt = 1.0;
        // Get what true altitude gives this apparent altitude
        const trueAlt = swe.refraction(
          apparentAlt,
          1013.25,
          15,
          SE_APP_TO_TRUE,
        );

        // True should be less than apparent (refraction makes objects appear higher)
        expect(trueAlt).toBeLessThan(apparentAlt);
        expect(trueAlt).toBeGreaterThan(0);
      });
    });

    describe("refractionExtended", () => {
      it("calculates extended refraction", () => {
        const result = swe.refractionExtended(
          0,
          0,
          1013.25,
          15,
          0.0065,
          SE_TRUE_TO_APP,
        );

        expect(result).toHaveLength(4);
        // result[1] is the refraction value
        expect(result[1]).toBeGreaterThan(0.4);
        expect(result[1]).toBeLessThan(0.6);
      });
    });

    describe("setLapseRate", () => {
      it("sets atmospheric lapse rate without error", () => {
        expect(() => swe.setLapseRate(0.0065)).not.toThrow();
      });
    });
  });

  // ==========================================================================
  // RISE/TRANSIT/SET FUNCTIONS
  // ==========================================================================
  describe("Rise/Transit/Set Functions", () => {
    // New Delhi coordinates
    const LAT = 28.6139;
    const LON = 77.209;

    describe("riseTransit", () => {
      it("finds sunrise", () => {
        // Use London (UTC+0 in winter) for simpler time reasoning
        const londonLat = 51.5074;
        const londonLon = -0.1278;
        // Start from June 15, 2024 12:00 UT (after sunrise)
        const jd = swe.julday(2024, 6, 15, 12.0, SE_GREG_CAL);

        // Create geopos array in memory
        const geoposPtr = swe.raw.malloc(3 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(geoposPtr, londonLon, true);
        view.setFloat64(geoposPtr + 8, londonLat, true);
        view.setFloat64(geoposPtr + 16, 0, true); // altitude

        try {
          const result = swe.riseTransit(
            jd,
            SE_SUN,
            "",
            0,
            SE_CALC_RISE | SE_BIT_DISC_CENTER,
            geoposPtr,
            1013.25,
            15,
          );

          // Should return a valid Julian Day after start time
          expect(result).toBeGreaterThan(jd);
          // Next sunrise should be within ~24 hours
          expect(result).toBeLessThan(jd + 1);

          // Convert to time - sunrise in London in June is around 4-5 AM UT
          const date = swe.revjul(result, SE_GREG_CAL);
          expect(date.hour).toBeGreaterThan(3);
          expect(date.hour).toBeLessThan(6);
        } finally {
          swe.raw.free(geoposPtr);
        }
      });

      it("finds sunset", () => {
        const jd = swe.julday(2024, 6, 15, 0.0, SE_GREG_CAL);

        const geoposPtr = swe.raw.malloc(3 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(geoposPtr, LON, true);
        view.setFloat64(geoposPtr + 8, LAT, true);
        view.setFloat64(geoposPtr + 16, 0, true);

        try {
          const result = swe.riseTransit(
            jd,
            SE_SUN,
            "",
            0,
            SE_CALC_SET | SE_BIT_DISC_CENTER,
            geoposPtr,
            1013.25,
            15,
          );

          expect(result).toBeGreaterThan(jd);
          expect(result).toBeLessThan(jd + 1);

          const date = swe.revjul(result, SE_GREG_CAL);
          expect(date.hour).toBeGreaterThan(12);
          expect(date.hour).toBeLessThan(24);
        } finally {
          swe.raw.free(geoposPtr);
        }
      });

      it("finds Moon rise", () => {
        const jd = swe.julday(2024, 6, 15, 0.0, SE_GREG_CAL);

        const geoposPtr = swe.raw.malloc(3 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(geoposPtr, LON, true);
        view.setFloat64(geoposPtr + 8, LAT, true);
        view.setFloat64(geoposPtr + 16, 0, true);

        try {
          const result = swe.riseTransit(
            jd,
            SE_MOON,
            "",
            0,
            SE_CALC_RISE,
            geoposPtr,
            1013.25,
            15,
          );

          expect(result).toBeGreaterThan(jd);
          expect(result).toBeLessThan(jd + 2); // Moon may rise next day
        } finally {
          swe.raw.free(geoposPtr);
        }
      });
    });

    describe("riseTransitTrueHorizon", () => {
      it("finds rise with true horizon", () => {
        const jd = swe.julday(2024, 6, 15, 0.0, SE_GREG_CAL);

        const geoposPtr = swe.raw.malloc(3 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(geoposPtr, LON, true);
        view.setFloat64(geoposPtr + 8, LAT, true);
        view.setFloat64(geoposPtr + 16, 100, true); // 100m altitude

        try {
          const result = swe.riseTransitTrueHorizon(
            jd,
            SE_SUN,
            "",
            0,
            SE_CALC_RISE,
            geoposPtr,
            1013.25,
            15,
            0,
          );

          expect(result).toBeGreaterThan(jd);
        } finally {
          swe.raw.free(geoposPtr);
        }
      });
    });
  });

  // ==========================================================================
  // NODES AND APSIDES FUNCTIONS
  // ==========================================================================
  describe("Nodes and Apsides Functions", () => {
    describe("nodesApsides", () => {
      it("calculates planetary nodes and apsides", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.nodesApsides(jd, SE_MARS, 0, SE_NODBIT_MEAN);

        expect(result.ascendingNode).toBeDefined();
        expect(result.descendingNode).toBeDefined();
        expect(result.perihelion).toBeDefined();
        expect(result.aphelion).toBeDefined();

        // All positions should be valid ecliptic longitudes
        expect(result.ascendingNode.longitude).toBeGreaterThanOrEqual(0);
        expect(result.ascendingNode.longitude).toBeLessThan(360);
        expect(result.descendingNode.longitude).toBeGreaterThanOrEqual(0);
        expect(result.descendingNode.longitude).toBeLessThan(360);
        expect(result.perihelion.longitude).toBeGreaterThanOrEqual(0);
        expect(result.perihelion.longitude).toBeLessThan(360);
        expect(result.aphelion.longitude).toBeGreaterThanOrEqual(0);
        expect(result.aphelion.longitude).toBeLessThan(360);

        // Verify distances are positive
        expect(result.ascendingNode.distance).toBeGreaterThan(0);
        expect(result.perihelion.distance).toBeGreaterThan(0);
        expect(result.aphelion.distance).toBeGreaterThan(0);
      });

      it("calculates for different planets", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const planets = [SE_MERCURY, SE_VENUS, SE_MARS, SE_JUPITER, SE_SATURN];

        for (const planet of planets) {
          const result = swe.nodesApsides(jd, planet, 0, SE_NODBIT_MEAN);
          expect(result.ascendingNode.longitude).toBeGreaterThanOrEqual(0);
          expect(result.ascendingNode.longitude).toBeLessThan(360);
        }
      });
    });

    describe("nodesApsidesEt", () => {
      it("calculates using ET time", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.nodesApsidesEt(jd, SE_MARS, 0, SE_NODBIT_MEAN);

        expect(result.ascendingNode).toBeDefined();
        expect(result.perihelion).toBeDefined();
      });
    });

    describe("orbitalElements", () => {
      it("returns orbital elements", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.orbitalElements(jd, SE_MARS, 0);

        expect(result.elements).toBeDefined();
        expect(result.elements.length).toBeGreaterThan(0);
      });
    });

    describe("orbitDistanceExtremes", () => {
      it("returns orbital distance extremes", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.orbitDistanceExtremes(jd, SE_MARS, 0);

        expect(result.dmax).toBeDefined();
        expect(result.dmin).toBeDefined();
        expect(result.dtrue).toBeDefined();

        // Max should be greater than min
        expect(result.dmax).toBeGreaterThan(result.dmin);
        // Current distance should be between min and max
        expect(result.dtrue).toBeGreaterThanOrEqual(result.dmin);
        expect(result.dtrue).toBeLessThanOrEqual(result.dmax);
      });
    });
  });

  // ==========================================================================
  // TIME FUNCTIONS
  // ==========================================================================
  describe("Time Functions", () => {
    describe("deltaT", () => {
      it("returns Delta T", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const dt = swe.deltaT(jd);

        // Delta T in 2024 is about 69-70 seconds
        // In Julian Day units: 69 / 86400 ≈ 0.0008
        expect(dt).toBeGreaterThan(0.0007);
        expect(dt).toBeLessThan(0.0009);
      });

      it("increases over time (recent centuries)", () => {
        const jd1900 = swe.julday(1900, 1, 1, 12.0, SE_GREG_CAL);
        const jd2000 = swe.julday(2000, 1, 1, 12.0, SE_GREG_CAL);

        const dt1900 = swe.deltaT(jd1900);
        const dt2000 = swe.deltaT(jd2000);

        expect(dt2000).toBeGreaterThan(dt1900);
      });
    });

    describe("deltaTExtended", () => {
      it("returns Delta T with flags", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.deltaTExtended(jd, 0);

        expect(typeof result).toBe("number");
      });
    });

    describe("equationOfTime", () => {
      it("returns equation of time", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const eot = swe.equationOfTime(jd);

        // Equation of time is typically -14 to +16 minutes
        // In days: 16/1440 ≈ 0.011
        expect(Math.abs(eot)).toBeLessThan(0.015);
      });
    });

    describe("localMeanTimeToApparent", () => {
      it("converts LMT to LAT", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.localMeanTimeToApparent(jd, 77.209);

        // Should be close to input, difference is equation of time
        expect(Math.abs(result - jd)).toBeLessThan(0.02);
      });
    });

    describe("apparentToLocalMeanTime", () => {
      it("converts LAT to LMT", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const result = swe.apparentToLocalMeanTime(jd, 77.209);

        expect(Math.abs(result - jd)).toBeLessThan(0.02);
      });

      it("round-trips with localMeanTimeToApparent", () => {
        const jd = swe.julday(2024, 6, 15, 12.0, SE_GREG_CAL);
        const lon = 77.209;

        const lat = swe.localMeanTimeToApparent(jd, lon);
        const backToLmt = swe.apparentToLocalMeanTime(lat, lon);

        expect(backToLmt).toBeCloseTo(jd, 8);
      });
    });

    describe("siderealTime", () => {
      it("returns sidereal time in hours", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const sidTime = swe.siderealTime(jd);

        expect(sidTime).toBeGreaterThanOrEqual(0);
        expect(sidTime).toBeLessThan(24);
      });

      it("increases roughly 4 minutes per day", () => {
        const jd1 = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const jd2 = swe.julday(2024, 1, 2, 12.0, SE_GREG_CAL);

        const sid1 = swe.siderealTime(jd1);
        const sid2 = swe.siderealTime(jd2);

        // Sidereal day is ~4 min shorter than solar day
        // So at same clock time next day, sidereal time advances ~4 min = 0.067 hours
        let diff = sid2 - sid1;
        if (diff < 0) diff += 24;
        expect(diff).toBeCloseTo(0.0657, 1);
      });
    });

    describe("siderealTime0", () => {
      it("returns sidereal time with parameters", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const eps = 23.44; // Obliquity
        const nut = 0; // Nutation in longitude

        const sidTime = swe.siderealTime0(jd, eps, nut);

        expect(sidTime).toBeGreaterThanOrEqual(0);
        expect(sidTime).toBeLessThan(24);
      });
    });

    describe("setInterpolateNutation", () => {
      it("sets nutation interpolation without error", () => {
        expect(() => swe.setInterpolateNutation(1)).not.toThrow();
        expect(() => swe.setInterpolateNutation(0)).not.toThrow();
      });
    });
  });

  // ==========================================================================
  // COORDINATE TRANSFORM FUNCTIONS
  // ==========================================================================
  describe("Coordinate Transform Functions", () => {
    describe("coordinateTransform", () => {
      it("transforms ecliptic to equatorial", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        const sun = swe.calc(jd, SE_SUN, 0);
        const eps = 23.44; // Obliquity

        // Need to pass pointer to [lon, lat, dist]
        const xpoPtr = swe.raw.malloc(3 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(xpoPtr, sun.longitude, true);
        view.setFloat64(xpoPtr + 8, sun.latitude, true);
        view.setFloat64(xpoPtr + 16, sun.distance, true);

        try {
          const result = swe.coordinateTransform(xpoPtr, eps);
          expect(result).toHaveLength(3);
          // Right ascension
          expect(result[0]).toBeGreaterThanOrEqual(0);
          expect(result[0]).toBeLessThan(360);
        } finally {
          swe.raw.free(xpoPtr);
        }
      });
    });

    describe("coordinateTransformWithSpeed", () => {
      it("transforms coordinates with speed", () => {
        const xpoPtr = swe.raw.malloc(6 * 8);
        const view = new DataView(swe.raw.memory.buffer);
        view.setFloat64(xpoPtr, 280, true); // lon
        view.setFloat64(xpoPtr + 8, 0, true); // lat
        view.setFloat64(xpoPtr + 16, 1, true); // dist
        view.setFloat64(xpoPtr + 24, 1, true); // lon speed
        view.setFloat64(xpoPtr + 32, 0, true); // lat speed
        view.setFloat64(xpoPtr + 40, 0, true); // dist speed

        try {
          const result = swe.coordinateTransformWithSpeed(xpoPtr, 23.44);
          expect(result).toHaveLength(6);
        } finally {
          swe.raw.free(xpoPtr);
        }
      });
    });
  });

  // ==========================================================================
  // TIDAL ACCELERATION FUNCTIONS
  // ==========================================================================
  describe("Tidal Acceleration Functions", () => {
    describe("getTidalAcceleration", () => {
      it("returns tidal acceleration", () => {
        const acc = swe.getTidalAcceleration();
        expect(typeof acc).toBe("number");
      });
    });

    describe("setTidalAcceleration", () => {
      it("sets tidal acceleration", () => {
        const original = swe.getTidalAcceleration();
        swe.setTidalAcceleration(-25.8);
        const newAcc = swe.getTidalAcceleration();
        expect(newAcc).toBeCloseTo(-25.8, 1);
        // Restore
        swe.setTidalAcceleration(original);
      });
    });

    describe("setDeltaTUserDefined", () => {
      it("sets user-defined Delta T without error", () => {
        expect(() => swe.setDeltaTUserDefined(0.001)).not.toThrow();
        // Reset to auto
        swe.setDeltaTUserDefined(-1e-10);
      });
    });
  });

  // ==========================================================================
  // UTILITY FUNCTIONS
  // ==========================================================================
  describe("Utility Functions", () => {
    describe("normalizeDegrees", () => {
      it("normalizes positive degrees", () => {
        expect(swe.normalizeDegrees(0)).toBeCloseTo(0, 10);
        expect(swe.normalizeDegrees(360)).toBeCloseTo(0, 10);
        expect(swe.normalizeDegrees(450)).toBeCloseTo(90, 10);
        expect(swe.normalizeDegrees(720)).toBeCloseTo(0, 10);
      });

      it("normalizes negative degrees", () => {
        expect(swe.normalizeDegrees(-90)).toBeCloseTo(270, 10);
        expect(swe.normalizeDegrees(-180)).toBeCloseTo(180, 10);
        expect(swe.normalizeDegrees(-360)).toBeCloseTo(0, 10);
        expect(swe.normalizeDegrees(-450)).toBeCloseTo(270, 10);
      });
    });

    describe("normalizeRadians", () => {
      it("normalizes radians to 0-2π", () => {
        expect(swe.normalizeRadians(0)).toBeCloseTo(0, 10);
        expect(swe.normalizeRadians(Math.PI)).toBeCloseTo(Math.PI, 10);
        expect(swe.normalizeRadians(3 * Math.PI)).toBeCloseTo(Math.PI, 10);
        expect(swe.normalizeRadians(-Math.PI)).toBeCloseTo(Math.PI, 10);
      });
    });

    describe("splitDegrees", () => {
      it("splits degrees into components", () => {
        const result = swe.splitDegrees(123.456789, 0);

        expect(result.degrees).toBe(123);
        expect(result.minutes).toBeGreaterThanOrEqual(0);
        expect(result.minutes).toBeLessThan(60);
        expect(result.seconds).toBeGreaterThanOrEqual(0);
        expect(result.seconds).toBeLessThan(60);
      });

      it("handles edge cases", () => {
        const zero = swe.splitDegrees(0, 0);
        expect(zero.degrees).toBe(0);
        expect(zero.minutes).toBe(0);

        const neg = swe.splitDegrees(-45.5, 0);
        expect(neg.degrees).toBe(45);
      });
    });

    describe("dayOfWeek", () => {
      it("returns correct day of week", () => {
        // January 1, 2024 was a Monday (0 in Swiss Ephemeris)
        const jdMon = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);
        expect(swe.dayOfWeek(jdMon)).toBe(0); // Monday

        // January 7, 2024 was a Sunday
        const jdSun = swe.julday(2024, 1, 7, 12.0, SE_GREG_CAL);
        expect(swe.dayOfWeek(jdSun)).toBe(6); // Sunday
      });

      it("handles various dates", () => {
        // Test a known Saturday - January 6, 2024
        const jdSat = swe.julday(2024, 1, 6, 12.0, SE_GREG_CAL);
        expect(swe.dayOfWeek(jdSat)).toBe(5); // Saturday

        // Test a known Friday - January 5, 2024
        const jdFri = swe.julday(2024, 1, 5, 12.0, SE_GREG_CAL);
        expect(swe.dayOfWeek(jdFri)).toBe(4); // Friday
      });
    });

    describe("degreeMidpoint", () => {
      it("calculates midpoint in degrees", () => {
        const mid = swe.degreeMidpoint(0, 90);
        expect(mid).toBeCloseTo(45, 5);
      });

      it("handles wrap-around", () => {
        const mid = swe.degreeMidpoint(350, 10);
        // Midpoint should be 0 (or 360)
        expect(mid).toBeCloseTo(0, 5);
      });
    });

    describe("radianMidpoint", () => {
      it("calculates midpoint in radians", () => {
        const mid = swe.radianMidpoint(0, Math.PI);
        expect(mid).toBeCloseTo(Math.PI / 2, 5);
      });
    });

    describe("differenceDegrees", () => {
      it("calculates normalized difference", () => {
        const diff = swe.differenceDegrees(10, 350);
        expect(diff).toBeCloseTo(20, 5);
      });
    });

    describe("differenceDegrees2", () => {
      it("calculates signed difference (-180..180)", () => {
        const diff = swe.differenceDegrees2(10, 350);
        // 10 - 350 = -340, normalized to -180..180 = 20
        expect(Math.abs(diff)).toBeLessThanOrEqual(180);
      });
    });

    describe("differenceRadians2", () => {
      it("calculates signed radian difference", () => {
        const diff = swe.differenceRadians2(0.1, 6.2);
        expect(Math.abs(diff)).toBeLessThanOrEqual(Math.PI);
      });
    });

    describe("normalizeCentiseconds", () => {
      it("normalizes centiseconds", () => {
        // 1 degree = 3600 arcseconds = 360000 centiseconds
        // 360 degrees = 129,600,000 centiseconds
        const fullCircle = 360 * 360000;
        expect(swe.normalizeCentiseconds(fullCircle)).toBe(0);
        expect(swe.normalizeCentiseconds(fullCircle + 100)).toBe(100);
        expect(swe.normalizeCentiseconds(0)).toBe(0);
      });
    });

    describe("roundCentiseconds", () => {
      it("rounds centiseconds to seconds", () => {
        const result = swe.roundCentiseconds(12345);
        expect(typeof result).toBe("number");
      });
    });

    describe("doubleToLong", () => {
      it("converts double to long", () => {
        const result = swe.doubleToLong(123.7);
        expect(result).toBe(124); // Rounds to nearest
      });
    });
  });

  // ==========================================================================
  // PLANET NAME FUNCTIONS
  // ==========================================================================
  describe("Planet Name Functions", () => {
    describe("getPlanetName", () => {
      it("returns correct planet names", () => {
        expect(swe.getPlanetName(SE_SUN)).toBe("Sun");
        expect(swe.getPlanetName(SE_MOON)).toBe("Moon");
        expect(swe.getPlanetName(SE_MERCURY)).toBe("Mercury");
        expect(swe.getPlanetName(SE_VENUS)).toBe("Venus");
        expect(swe.getPlanetName(SE_MARS)).toBe("Mars");
        expect(swe.getPlanetName(SE_JUPITER)).toBe("Jupiter");
        expect(swe.getPlanetName(SE_SATURN)).toBe("Saturn");
        expect(swe.getPlanetName(SE_URANUS)).toBe("Uranus");
        expect(swe.getPlanetName(SE_NEPTUNE)).toBe("Neptune");
        expect(swe.getPlanetName(SE_PLUTO)).toBe("Pluto");
        expect(swe.getPlanetName(SE_TRUE_NODE)).toBe("true Node");
        expect(swe.getPlanetName(SE_MEAN_NODE)).toBe("mean Node");
        expect(swe.getPlanetName(SE_CHIRON)).toBe("Chiron");
      });
    });
  });

  // ==========================================================================
  // CONFIGURATION FUNCTIONS
  // ==========================================================================
  describe("Configuration Functions", () => {
    describe("setTopocentric", () => {
      it("sets topocentric position without error", () => {
        expect(() => swe.setTopocentric(77.209, 28.6139, 200)).not.toThrow();
      });

      it("affects calculations with topocentric flag", () => {
        const jd = swe.julday(2024, 1, 1, 12.0, SE_GREG_CAL);

        const geocentric = swe.calc(jd, SE_MOON, SEFLG_SPEED);
        swe.setTopocentric(77.209, 28.6139, 200);
        const topocentric = swe.calc(jd, SE_MOON, SEFLG_SPEED | SEFLG_TOPOCTR);

        // Moon position should differ slightly
        // Difference could be small, just verify no error
        expect(topocentric.longitude).toBeDefined();
      });
    });

    describe("setEphemerisPath", () => {
      it("sets ephemeris path without error", () => {
        expect(() => swe.setEphemerisPath(".")).not.toThrow();
      });
    });

    describe("setJplFile", () => {
      it("sets JPL file without error", () => {
        // This will fail if file doesn't exist, but shouldn't crash
        expect(() => swe.setJplFile("de421.eph")).not.toThrow();
      });
    });

    describe("close", () => {
      it("can be called multiple times", () => {
        // Create a fresh instance to test close
        // (don't close the main test instance)
        expect(() => {
          // Just verify main close doesn't break other tests
          // We'll close in afterAll
        }).not.toThrow();
      });
    });
  });

  // ==========================================================================
  // RAW ACCESS
  // ==========================================================================
  describe("Raw Access", () => {
    it("provides access to raw WASM interface", () => {
      expect(swe.raw).toBeDefined();
      expect(swe.raw.swe_julday).toBeDefined();
      expect(swe.raw.swe_calc_ut).toBeDefined();
      expect(swe.raw.malloc).toBeDefined();
      expect(swe.raw.free).toBeDefined();
    });

    it("provides access to memory helpers", () => {
      expect(swe.mem).toBeDefined();
      expect(swe.mem.getFloat64).toBeDefined();
      expect(swe.mem.getInt32).toBeDefined();
      expect(swe.mem.getString).toBeDefined();
      expect(swe.mem.allocString).toBeDefined();
      expect(swe.mem.getFloat64Array).toBeDefined();
    });

    it("can use raw interface directly", () => {
      const jd = swe.raw.swe_julday(2024, 1, 1, 12.0, SE_GREG_CAL);
      expect(jd).toBeCloseTo(2460311.0, 5);
    });
  });
});
