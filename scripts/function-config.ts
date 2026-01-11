/**
 * Function configuration for generating friendly wrappers
 *
 * Defines input/output semantics for each Swiss Ephemeris function
 */

export type OutputType =
  | { type: "float64"; name?: string }
  | { type: "float64[]"; count: number; name?: string }
  | { type: "int32"; name?: string }
  | { type: "int32[]"; count: number; name?: string }
  | { type: "string"; size: number }
  | { type: "error"; size: number }; // Like string but used for error checking

export interface FunctionConfig {
  /** Friendly function name (without swe_ prefix, camelCase) */
  friendlyName?: string;
  /** Parameters that are output pointers */
  outputs?: Record<string, OutputType>;
  /** Parameters that are input strings (need to be allocated and freed) */
  inputStrings?: string[];
  /** How to handle the return value */
  returnType?: "void" | "number" | "check-error" | "check-negative";
  /** Skip generating wrapper (needs manual implementation or not useful) */
  skip?: boolean;
  /** JSDoc description */
  description?: string;
  /** Custom result type name for the return object */
  resultType?: string;
}

export const functionConfig: Record<string, FunctionConfig> = {
  // ===========================================================================
  // Core Calculations
  // ===========================================================================

  swe_calc: {
    friendlyName: "calcEt",
    description: "Calculate planet position (ET time)",
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_calc_ut: {
    friendlyName: "calc",
    description: "Calculate planet position (UT time)",
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_calc_pctr: {
    friendlyName: "calcPlanetocentric",
    description: "Calculate position relative to another planet",
    outputs: {
      xxret: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_solcross: {
    friendlyName: "solarCrossingEt",
    description: "Find when Sun crosses a longitude (ET)",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_solcross_ut: {
    friendlyName: "solarCrossing",
    description: "Find when Sun crosses a longitude (UT)",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_mooncross: {
    friendlyName: "moonCrossingEt",
    description: "Find when Moon crosses a longitude (ET)",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_mooncross_ut: {
    friendlyName: "moonCrossing",
    description: "Find when Moon crosses a longitude (UT)",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_mooncross_node: {
    friendlyName: "moonNodeCrossingEt",
    description: "Find when Moon crosses its node (ET)",
    outputs: {
      xlon: { type: "float64" },
      xlat: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_mooncross_node_ut: {
    friendlyName: "moonNodeCrossing",
    description: "Find when Moon crosses its node (UT)",
    outputs: {
      xlon: { type: "float64" },
      xlat: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_helio_cross: {
    friendlyName: "helioCrossingEt",
    description: "Find heliocentric crossing (ET)",
    outputs: {
      jd_cross: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_helio_cross_ut: {
    friendlyName: "helioCrossing",
    description: "Find heliocentric crossing (UT)",
    outputs: {
      jd_cross: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_pheno: {
    friendlyName: "phenomenaEt",
    description: "Calculate planetary phenomena (ET)",
    outputs: {
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PhenomenaResult",
  },

  swe_pheno_ut: {
    friendlyName: "phenomena",
    description: "Calculate planetary phenomena (UT)",
    outputs: {
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PhenomenaResult",
  },

  swe_nod_aps: {
    friendlyName: "nodesApsidesEt",
    description: "Calculate nodes and apsides (ET)",
    outputs: {
      xnasc: { type: "float64[]", count: 6 },
      xndsc: { type: "float64[]", count: 6 },
      xperi: { type: "float64[]", count: 6 },
      xaphe: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "NodesApsidesResult",
  },

  swe_nod_aps_ut: {
    friendlyName: "nodesApsides",
    description: "Calculate nodes and apsides (UT)",
    outputs: {
      xnasc: { type: "float64[]", count: 6 },
      xndsc: { type: "float64[]", count: 6 },
      xperi: { type: "float64[]", count: 6 },
      xaphe: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "NodesApsidesResult",
  },

  swe_get_orbital_elements: {
    friendlyName: "orbitalElements",
    description: "Get orbital elements of a planet",
    outputs: {
      dret: { type: "float64[]", count: 50 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "OrbitalElements",
  },

  swe_orbit_max_min_true_distance: {
    friendlyName: "orbitDistanceExtremes",
    description: "Get max/min true distance of orbit",
    outputs: {
      dmax: { type: "float64" },
      dmin: { type: "float64" },
      dtrue: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_heliacal_pheno_ut: {
    friendlyName: "heliacalPhenomena",
    description: "Calculate heliacal phenomena",
    inputStrings: ["ObjectName"],
    outputs: {
      darr: { type: "float64[]", count: 50 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  // ===========================================================================
  // Fixed Stars
  // ===========================================================================

  swe_fixstar: {
    friendlyName: "fixedStarEt",
    description: "Calculate fixed star position (ET)",
    inputStrings: ["star"],
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_fixstar_ut: {
    friendlyName: "fixedStar",
    description: "Calculate fixed star position (UT)",
    inputStrings: ["star"],
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_fixstar_mag: {
    friendlyName: "fixedStarMagnitude",
    description: "Get fixed star magnitude",
    inputStrings: ["star"],
    outputs: {
      mag: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_fixstar2: {
    friendlyName: "fixedStar2Et",
    description: "Calculate fixed star position v2 (ET)",
    inputStrings: ["star"],
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_fixstar2_ut: {
    friendlyName: "fixedStar2",
    description: "Calculate fixed star position v2 (UT)",
    inputStrings: ["star"],
    outputs: {
      xx: { type: "float64[]", count: 6 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "PlanetPosition",
  },

  swe_fixstar2_mag: {
    friendlyName: "fixedStar2Magnitude",
    description: "Get fixed star magnitude v2",
    inputStrings: ["star"],
    outputs: {
      mag: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  // ===========================================================================
  // Date/Time
  // ===========================================================================

  swe_julday: {
    friendlyName: "julday",
    description: "Convert date to Julian Day",
    returnType: "number",
  },

  swe_revjul: {
    friendlyName: "revjul",
    description: "Convert Julian Day to date components",
    outputs: {
      jyear: { type: "int32", name: "year" },
      jmon: { type: "int32", name: "month" },
      jday: { type: "int32", name: "day" },
      jut: { type: "float64", name: "hour" },
    },
    returnType: "void",
    resultType: "DateComponents",
  },

  swe_date_conversion: {
    friendlyName: "dateConversion",
    description: "Convert date with calendar check",
    outputs: {
      tjd: { type: "float64" },
    },
    returnType: "check-negative",
  },

  swe_utc_to_jd: {
    friendlyName: "utcToJd",
    description: "Convert UTC to Julian Day",
    outputs: {
      dret: { type: "float64[]", count: 2 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "JulianDayResult",
  },

  swe_jdet_to_utc: {
    friendlyName: "jdEtToUtc",
    description: "Convert Julian Day ET to UTC",
    outputs: {
      iyear: { type: "int32", name: "year" },
      imonth: { type: "int32", name: "month" },
      iday: { type: "int32", name: "day" },
      ihour: { type: "int32", name: "hour" },
      imin: { type: "int32", name: "minute" },
      dsec: { type: "float64", name: "second" },
    },
    returnType: "void",
    resultType: "UtcComponents",
  },

  swe_jdut1_to_utc: {
    friendlyName: "jdUt1ToUtc",
    description: "Convert Julian Day UT1 to UTC",
    outputs: {
      iyear: { type: "int32", name: "year" },
      imonth: { type: "int32", name: "month" },
      iday: { type: "int32", name: "day" },
      ihour: { type: "int32", name: "hour" },
      imin: { type: "int32", name: "minute" },
      dsec: { type: "float64", name: "second" },
    },
    returnType: "void",
    resultType: "UtcComponents",
  },

  swe_utc_time_zone: {
    friendlyName: "utcTimeZone",
    description: "Convert between timezones",
    outputs: {
      iyear_out: { type: "int32", name: "year" },
      imonth_out: { type: "int32", name: "month" },
      iday_out: { type: "int32", name: "day" },
      ihour_out: { type: "int32", name: "hour" },
      imin_out: { type: "int32", name: "minute" },
      dsec_out: { type: "float64", name: "second" },
    },
    returnType: "void",
    resultType: "UtcComponents",
  },

  // ===========================================================================
  // Houses
  // ===========================================================================

  swe_houses: {
    friendlyName: "housesSimple",
    description: "Calculate house cusps (simple)",
    outputs: {
      cusps: { type: "float64[]", count: 13 },
      ascmc: { type: "float64[]", count: 10 },
    },
    returnType: "number",
    resultType: "HouseResult",
  },

  swe_houses_ex: {
    friendlyName: "houses",
    description: "Calculate house cusps (extended)",
    outputs: {
      cusps: { type: "float64[]", count: 13 },
      ascmc: { type: "float64[]", count: 10 },
    },
    returnType: "number",
    resultType: "HouseResult",
  },

  swe_houses_ex2: {
    friendlyName: "housesWithSpeed",
    description: "Calculate house cusps with speeds",
    outputs: {
      cusps: { type: "float64[]", count: 13 },
      ascmc: { type: "float64[]", count: 10 },
      cusp_speed: { type: "float64[]", count: 13 },
      ascmc_speed: { type: "float64[]", count: 10 },
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
    resultType: "HouseResultWithSpeed",
  },

  swe_houses_armc: {
    friendlyName: "housesArmc",
    description: "Calculate houses from ARMC",
    outputs: {
      cusps: { type: "float64[]", count: 13 },
      ascmc: { type: "float64[]", count: 10 },
    },
    returnType: "number",
    resultType: "HouseResult",
  },

  swe_houses_armc_ex2: {
    friendlyName: "housesArmcWithSpeed",
    description: "Calculate houses from ARMC with speeds",
    outputs: {
      cusps: { type: "float64[]", count: 13 },
      ascmc: { type: "float64[]", count: 10 },
      cusp_speed: { type: "float64[]", count: 13 },
      ascmc_speed: { type: "float64[]", count: 10 },
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
    resultType: "HouseResultWithSpeed",
  },

  swe_house_pos: {
    friendlyName: "housePosition",
    description: "Calculate house position of a planet",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_gauquelin_sector: {
    friendlyName: "gauquelinSector",
    description: "Calculate Gauquelin sector",
    inputStrings: ["starname"],
    outputs: {
      dgsect: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  // ===========================================================================
  // Eclipses
  // ===========================================================================

  swe_sol_eclipse_where: {
    friendlyName: "solarEclipseWhere",
    description: "Find where solar eclipse is central",
    outputs: {
      geopos: { type: "float64[]", count: 10 },
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseWhereResult",
  },

  swe_sol_eclipse_how: {
    friendlyName: "solarEclipseHow",
    description: "Calculate solar eclipse attributes",
    outputs: {
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseAttributes",
  },

  swe_sol_eclipse_when_loc: {
    friendlyName: "solarEclipseWhenLocal",
    description: "Find next solar eclipse at location",
    outputs: {
      tret: { type: "float64[]", count: 10 },
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  swe_sol_eclipse_when_glob: {
    friendlyName: "solarEclipseWhenGlobal",
    description: "Find next solar eclipse globally",
    outputs: {
      tret: { type: "float64[]", count: 10 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  swe_lun_occult_where: {
    friendlyName: "lunarOccultationWhere",
    description: "Find where lunar occultation is central",
    inputStrings: ["starname"],
    outputs: {
      geopos: { type: "float64[]", count: 10 },
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseWhereResult",
  },

  swe_lun_occult_when_loc: {
    friendlyName: "lunarOccultationWhenLocal",
    description: "Find next lunar occultation at location",
    inputStrings: ["starname"],
    outputs: {
      tret: { type: "float64[]", count: 10 },
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  swe_lun_occult_when_glob: {
    friendlyName: "lunarOccultationWhenGlobal",
    description: "Find next lunar occultation globally",
    inputStrings: ["starname"],
    outputs: {
      tret: { type: "float64[]", count: 10 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  swe_lun_eclipse_how: {
    friendlyName: "lunarEclipseHow",
    description: "Calculate lunar eclipse attributes",
    outputs: {
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseAttributes",
  },

  swe_lun_eclipse_when: {
    friendlyName: "lunarEclipseWhen",
    description: "Find next lunar eclipse",
    outputs: {
      tret: { type: "float64[]", count: 10 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  swe_lun_eclipse_when_loc: {
    friendlyName: "lunarEclipseWhenLocal",
    description: "Find next lunar eclipse at location",
    outputs: {
      tret: { type: "float64[]", count: 10 },
      attr: { type: "float64[]", count: 20 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
    resultType: "EclipseTimeResult",
  },

  // ===========================================================================
  // Rise/Transit
  // ===========================================================================

  swe_rise_trans: {
    friendlyName: "riseTransit",
    description: "Calculate rise, transit, set times",
    inputStrings: ["starname"],
    outputs: {
      tret: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_rise_trans_true_hor: {
    friendlyName: "riseTransitTrueHorizon",
    description: "Calculate rise/transit with true horizon",
    inputStrings: ["starname"],
    outputs: {
      tret: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_azalt: {
    friendlyName: "azimuthAltitude",
    description: "Convert ecliptic to horizontal coordinates",
    outputs: {
      xaz: { type: "float64[]", count: 3 },
    },
    returnType: "void",
    resultType: "AzimuthAltitude",
  },

  swe_azalt_rev: {
    friendlyName: "azimuthAltitudeReverse",
    description: "Convert horizontal to ecliptic coordinates",
    outputs: {
      xout: { type: "float64[]", count: 3 },
    },
    returnType: "void",
  },

  // ===========================================================================
  // Heliacal
  // ===========================================================================

  swe_heliacal_ut: {
    friendlyName: "heliacalRising",
    description: "Calculate heliacal rising/setting",
    inputStrings: ["ObjectName"],
    outputs: {
      dret: { type: "float64[]", count: 50 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_vis_limit_mag: {
    friendlyName: "visibilityLimitMagnitude",
    description: "Calculate limiting magnitude for visibility",
    inputStrings: ["ObjectName"],
    outputs: {
      dret: { type: "float64[]", count: 8 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_heliacal_angle: {
    friendlyName: "heliacalAngle",
    description: "Calculate heliacal angle",
    outputs: {
      dret: { type: "float64[]", count: 3 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_topo_arcus_visionis: {
    friendlyName: "topoArcusVisionis",
    description: "Calculate topocentric arcus visionis",
    outputs: {
      dret: { type: "float64[]", count: 3 },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  // ===========================================================================
  // Coordinate Transforms
  // ===========================================================================

  swe_refrac: {
    friendlyName: "refraction",
    description: "Calculate atmospheric refraction",
    returnType: "number",
  },

  swe_refrac_extended: {
    friendlyName: "refractionExtended",
    description: "Calculate extended atmospheric refraction",
    outputs: {
      dret: { type: "float64[]", count: 4 },
    },
    returnType: "number",
  },

  swe_cotrans: {
    friendlyName: "coordinateTransform",
    description: "Transform ecliptic/equatorial coordinates",
    outputs: {
      xpn: { type: "float64[]", count: 3 },
    },
    returnType: "void",
  },

  swe_cotrans_sp: {
    friendlyName: "coordinateTransformWithSpeed",
    description: "Transform coordinates with speed",
    outputs: {
      xpn: { type: "float64[]", count: 6 },
    },
    returnType: "void",
  },

  // ===========================================================================
  // Delta T
  // ===========================================================================

  swe_deltat: {
    friendlyName: "deltaT",
    description: "Get Delta T (TT - UT)",
    returnType: "number",
  },

  swe_deltat_ex: {
    friendlyName: "deltaTExtended",
    description: "Get Delta T with flags",
    outputs: {
      serr: { type: "error", size: 256 },
    },
    returnType: "number",
  },

  swe_time_equ: {
    friendlyName: "equationOfTime",
    description: "Get equation of time",
    outputs: {
      te: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_lmt_to_lat: {
    friendlyName: "localMeanTimeToApparent",
    description: "Convert LMT to LAT",
    outputs: {
      tjd_lat: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_lat_to_lmt: {
    friendlyName: "apparentToLocalMeanTime",
    description: "Convert LAT to LMT",
    outputs: {
      tjd_lmt: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  // ===========================================================================
  // Sidereal
  // ===========================================================================

  swe_set_sid_mode: {
    friendlyName: "setSiderealMode",
    description: "Set sidereal calculation mode",
    returnType: "void",
  },

  swe_get_ayanamsa: {
    friendlyName: "getAyanamsaEt",
    description: "Get ayanamsa (ET)",
    returnType: "number",
  },

  swe_get_ayanamsa_ut: {
    friendlyName: "getAyanamsa",
    description: "Get ayanamsa (UT)",
    returnType: "number",
  },

  swe_get_ayanamsa_ex: {
    friendlyName: "getAyanamsaExEt",
    description: "Get ayanamsa extended (ET)",
    outputs: {
      daya: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_get_ayanamsa_ex_ut: {
    friendlyName: "getAyanamsaEx",
    description: "Get ayanamsa extended (UT)",
    outputs: {
      daya: { type: "float64" },
      serr: { type: "error", size: 256 },
    },
    returnType: "check-negative",
  },

  swe_sidtime: {
    friendlyName: "siderealTime",
    description: "Get sidereal time",
    returnType: "number",
  },

  swe_sidtime0: {
    friendlyName: "siderealTime0",
    description: "Get sidereal time with parameters",
    returnType: "number",
  },

  // ===========================================================================
  // Utility
  // ===========================================================================

  swe_degnorm: {
    friendlyName: "normalizeDegrees",
    description: "Normalize degrees to 0-360",
    returnType: "number",
  },

  swe_radnorm: {
    friendlyName: "normalizeRadians",
    description: "Normalize radians to 0-2π",
    returnType: "number",
  },

  swe_rad_midp: {
    friendlyName: "radianMidpoint",
    description: "Calculate midpoint in radians",
    returnType: "number",
  },

  swe_deg_midp: {
    friendlyName: "degreeMidpoint",
    description: "Calculate midpoint in degrees",
    returnType: "number",
  },

  swe_split_deg: {
    friendlyName: "splitDegrees",
    description: "Split degrees into components",
    outputs: {
      ideg: { type: "int32", name: "degrees" },
      imin: { type: "int32", name: "minutes" },
      isec: { type: "int32", name: "seconds" },
      dsecfr: { type: "float64", name: "secondFraction" },
      isgn: { type: "int32", name: "sign" },
    },
    returnType: "void",
    resultType: "SplitDegrees",
  },

  swe_csnorm: {
    friendlyName: "normalizeCentiseconds",
    description: "Normalize centiseconds",
    returnType: "number",
  },

  swe_difcsn: {
    friendlyName: "differenceCentiseconds",
    description: "Difference in centiseconds (normalized)",
    returnType: "number",
  },

  swe_difdegn: {
    friendlyName: "differenceDegrees",
    description: "Difference in degrees (normalized)",
    returnType: "number",
  },

  swe_difcs2n: {
    friendlyName: "differenceCentiseconds2",
    description: "Difference in centiseconds (-180..180)",
    returnType: "number",
  },

  swe_difdeg2n: {
    friendlyName: "differenceDegrees2",
    description: "Difference in degrees (-180..180)",
    returnType: "number",
  },

  swe_difrad2n: {
    friendlyName: "differenceRadians2",
    description: "Difference in radians (-π..π)",
    returnType: "number",
  },

  swe_csroundsec: {
    friendlyName: "roundCentiseconds",
    description: "Round centiseconds to seconds",
    returnType: "number",
  },

  swe_d2l: {
    friendlyName: "doubleToLong",
    description: "Convert double to long",
    returnType: "number",
  },

  swe_day_of_week: {
    friendlyName: "dayOfWeek",
    description: "Get day of week (0=Mon)",
    returnType: "number",
  },

  // ===========================================================================
  // Other / Configuration
  // ===========================================================================

  swe_close: {
    friendlyName: "close",
    description: "Close Swiss Ephemeris and free resources",
    returnType: "void",
  },

  swe_set_ephe_path: {
    friendlyName: "setEphemerisPath",
    description: "Set path to ephemeris files",
    inputStrings: ["path"],
    returnType: "void",
  },

  swe_set_jpl_file: {
    friendlyName: "setJplFile",
    description: "Set JPL ephemeris file",
    inputStrings: ["fname"],
    returnType: "void",
  },

  swe_get_planet_name: {
    friendlyName: "getPlanetName",
    description: "Get name of a planet",
    outputs: {
      spname: { type: "string", size: 64 },
    },
    returnType: "number",
  },

  swe_set_topo: {
    friendlyName: "setTopocentric",
    description: "Set topocentric observer location",
    returnType: "void",
  },

  swe_set_lapse_rate: {
    friendlyName: "setLapseRate",
    description: "Set atmospheric lapse rate",
    returnType: "void",
  },

  swe_set_interpolate_nut: {
    friendlyName: "setInterpolateNutation",
    description: "Set nutation interpolation",
    returnType: "void",
  },

  swe_get_tid_acc: {
    friendlyName: "getTidalAcceleration",
    description: "Get tidal acceleration",
    returnType: "number",
  },

  swe_set_tid_acc: {
    friendlyName: "setTidalAcceleration",
    description: "Set tidal acceleration",
    returnType: "void",
  },

  swe_set_delta_t_userdef: {
    friendlyName: "setDeltaTUserDefined",
    description: "Set user-defined delta T",
    returnType: "void",
  },

  swe_set_astro_models: {
    friendlyName: "setAstroModels",
    description: "Set astronomical models",
    skip: true, // Complex array handling needed
  },

  swe_get_astro_models: {
    friendlyName: "getAstroModels",
    description: "Get astronomical models",
    skip: true, // Complex array handling needed
  },
};

/**
 * Get configuration for a function, with defaults
 */
export function getFunctionConfig(funcName: string): FunctionConfig {
  return (
    functionConfig[funcName] || {
      friendlyName: funcName.replace("swe_", ""),
      returnType: "number",
    }
  );
}
