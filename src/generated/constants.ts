/**
 * Swiss Ephemeris Constants
 * Auto-generated from swephexp.h - DO NOT EDIT
 */

// CALENDAR
export const SE_JUL_CAL = 0;
export const SE_GREG_CAL = 1;

// PLANETS
export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;
export const SE_MEAN_APOG = 12;
export const SE_OSCU_APOG = 13;
export const SE_EARTH = 14;
export const SE_CHIRON = 15;
export const SE_PHOLUS = 16;
export const SE_CERES = 17;
export const SE_PALLAS = 18;
export const SE_JUNO = 19;
export const SE_VESTA = 20;
export const SE_NPLANETS = 23;

// FICTITIOUS PLANETS
export const SE_CUPIDO = 40;
export const SE_HADES = 41;
export const SE_ZEUS = 42;
export const SE_KRONOS = 43;
export const SE_APOLLON = 44;
export const SE_ADMETOS = 45;
export const SE_VULKANUS = 46;
export const SE_POSEIDON = 47;
export const SE_ISIS = 48;
export const SE_NIBIRU = 49;
export const SE_HARRINGTON = 50;
export const SE_NEPTUNE_LEVERRIER = 51;
export const SE_NEPTUNE_ADAMS = 52;
export const SE_PLUTO_LOWELL = 53;
export const SE_PLUTO_PICKERING = 54;
export const SE_VULCAN = 55;
export const SE_WHITE_MOON = 56;
export const SE_PROSERPINA = 57;
export const SE_WALDEMATH = 58;

// OFFSETS
export const SE_PLMOON_OFFSET = 9000;
export const SE_AST_OFFSET = 10000;
export const SE_VARUNA = (SE_AST_OFFSET + 20000);
export const SE_FICT_OFFSET = 40;
export const SE_FICT_OFFSET_1 = 39;
export const SE_FICT_MAX = 999;
export const SE_NFICT_ELEM = 15;
export const SE_COMET_OFFSET = 1000;
export const SE_NALL_NAT_POINTS = (SE_NPLANETS + SE_NFICT_ELEM);

// HOUSE POINTS
export const SE_ASC = 0;
export const SE_MC = 1;
export const SE_ARMC = 2;
export const SE_VERTEX = 3;
export const SE_EQUASC = 4; // "equatorial ascendant" */
export const SE_COASC1 = 5; // "co-ascendant" (W. Koch) */
export const SE_COASC2 = 6; // "co-ascendant" (M. Munkasey) */
export const SE_POLASC = 7; // "polar ascendant" (M. Munkasey) */
export const SE_NASCMC = 8;

// CALC FLAGS
export const SEFLG_JPLEPH = 1; // use JPL ephemeris */
export const SEFLG_SWIEPH = 2; // use SWISSEPH ephemeris */
export const SEFLG_MOSEPH = 4; // use Moshier ephemeris */
export const SEFLG_HELCTR = 8; // heliocentric position */
export const SEFLG_TRUEPOS = 16; // true/geometric position, not apparent position */
export const SEFLG_J2000 = 32; // no precession, i.e. give J2000 equinox */
export const SEFLG_NONUT = 64; // no nutation, i.e. mean equinox of date */
export const SEFLG_SPEED3 = 128; // speed from 3 positions (do not use it,
export const SEFLG_SPEED = 256; // high precision speed  */
export const SEFLG_NOGDEFL = 512; // turn off gravitational deflection */
export const SEFLG_NOABERR = 1024; // turn off 'annual' aberration of light */
export const SEFLG_ASTROMETRIC = (SEFLG_NOABERR|SEFLG_NOGDEFL); // astrometric position,
export const SEFLG_EQUATORIAL = (2*1024); // equatorial positions are wanted */
export const SEFLG_XYZ = (4*1024); // cartesian, not polar, coordinates */
export const SEFLG_RADIANS = (8*1024); // coordinates in radians, not degrees */
export const SEFLG_BARYCTR = (16*1024); // barycentric position */
export const SEFLG_TOPOCTR = (32*1024); // topocentric position */
export const SEFLG_ORBEL_AA = SEFLG_TOPOCTR; // used for Astronomical Almanac mode in
export const SEFLG_TROPICAL = (0); // tropical position (default) */
export const SEFLG_SIDEREAL = (64*1024); // sidereal position */
export const SEFLG_ICRS = (128*1024); // ICRS (DE406 reference frame) */
export const SEFLG_DPSIDEPS_1980 = (256*1024); // reproduce JPL Horizons
export const SEFLG_JPLHOR = SEFLG_DPSIDEPS_1980;
export const SEFLG_JPLHOR_APPROX = (512*1024); // approximate JPL Horizons 1962 - today */
export const SEFLG_CENTER_BODY = (1024*1024); // calculate position of center of body (COB)
export const SEFLG_TEST_PLMOON = (2*1024*1024 | SEFLG_J2000 | SEFLG_ICRS | SEFLG_HELCTR | SEFLG_TRUEPOS); // test raw data in files sepm9* */
export const SEFLG_DEFAULTEPH = SEFLG_SWIEPH;

// SIDEREAL BITS
export const SE_SIDBITS = 256;
export const SE_SIDBIT_ECL_T0 = 256;
export const SE_SIDBIT_SSY_PLANE = 512;
export const SE_SIDBIT_USER_UT = 1024;
export const SE_SIDBIT_ECL_DATE = 2048;
export const SE_SIDBIT_NO_PREC_OFFSET = 4096;
export const SE_SIDBIT_PREC_ORIG = 8192;

// AYANAMSA
export const SE_SIDM_FAGAN_BRADLEY = 0;
export const SE_SIDM_LAHIRI = 1;
export const SE_SIDM_DELUCE = 2;
export const SE_SIDM_RAMAN = 3;
export const SE_SIDM_USHASHASHI = 4;
export const SE_SIDM_KRISHNAMURTI = 5;
export const SE_SIDM_DJWHAL_KHUL = 6;
export const SE_SIDM_YUKTESHWAR = 7;
export const SE_SIDM_JN_BHASIN = 8;
export const SE_SIDM_BABYL_KUGLER1 = 9;
export const SE_SIDM_BABYL_KUGLER2 = 10;
export const SE_SIDM_BABYL_KUGLER3 = 11;
export const SE_SIDM_BABYL_HUBER = 12;
export const SE_SIDM_BABYL_ETPSC = 13;
export const SE_SIDM_ALDEBARAN_15TAU = 14;
export const SE_SIDM_HIPPARCHOS = 15;
export const SE_SIDM_SASSANIAN = 16;
export const SE_SIDM_GALCENT_0SAG = 17;
export const SE_SIDM_J2000 = 18;
export const SE_SIDM_J1900 = 19;
export const SE_SIDM_B1950 = 20;
export const SE_SIDM_SURYASIDDHANTA = 21;
export const SE_SIDM_SURYASIDDHANTA_MSUN = 22;
export const SE_SIDM_ARYABHATA = 23;
export const SE_SIDM_ARYABHATA_MSUN = 24;
export const SE_SIDM_SS_REVATI = 25;
export const SE_SIDM_SS_CITRA = 26;
export const SE_SIDM_TRUE_CITRA = 27;
export const SE_SIDM_TRUE_REVATI = 28;
export const SE_SIDM_TRUE_PUSHYA = 29;
export const SE_SIDM_GALCENT_RGILBRAND = 30;
export const SE_SIDM_GALEQU_IAU1958 = 31;
export const SE_SIDM_GALEQU_TRUE = 32;
export const SE_SIDM_GALEQU_MULA = 33;
export const SE_SIDM_GALALIGN_MARDYKS = 34;
export const SE_SIDM_TRUE_MULA = 35;
export const SE_SIDM_GALCENT_MULA_WILHELM = 36;
export const SE_SIDM_ARYABHATA_522 = 37;
export const SE_SIDM_BABYL_BRITTON = 38;
export const SE_SIDM_TRUE_SHEORAN = 39;
export const SE_SIDM_GALCENT_COCHRANE = 40;
export const SE_SIDM_GALEQU_FIORENZA = 41;
export const SE_SIDM_VALENS_MOON = 42;
export const SE_SIDM_LAHIRI_1940 = 43;
export const SE_SIDM_LAHIRI_VP285 = 44;
export const SE_SIDM_KRISHNAMURTI_VP291 = 45;
export const SE_SIDM_LAHIRI_ICRC = 46;
export const SE_SIDM_USER = 255; // user-defined ayanamsha, t0 is TT */

// NODE APSIDES
export const SE_NODBIT_MEAN = 1; // mean nodes/apsides */
export const SE_NODBIT_OSCU = 2; // osculating nodes/apsides */
export const SE_NODBIT_OSCU_BAR = 4; // same, but motion about solar system barycenter is considered */
export const SE_NODBIT_FOPOINT = 256; // focal point of orbit instead of aphelion */

// ECLIPSE
export const SE_ECL_NUT = -1;
export const SE_ECL_CENTRAL = 1;
export const SE_ECL_NONCENTRAL = 2;
export const SE_ECL_TOTAL = 4;
export const SE_ECL_ANNULAR = 8;
export const SE_ECL_PARTIAL = 16;
export const SE_ECL_ANNULAR_TOTAL = 32;
export const SE_ECL_HYBRID = 32;
export const SE_ECL_PENUMBRAL = 64;
export const SE_ECL_ALLTYPES_SOLAR = (SE_ECL_CENTRAL|SE_ECL_NONCENTRAL|SE_ECL_TOTAL|SE_ECL_ANNULAR|SE_ECL_PARTIAL|SE_ECL_ANNULAR_TOTAL);
export const SE_ECL_ALLTYPES_LUNAR = (SE_ECL_TOTAL|SE_ECL_PARTIAL|SE_ECL_PENUMBRAL);
export const SE_ECL_VISIBLE = 128;
export const SE_ECL_MAX_VISIBLE = 256;
export const SE_ECL_1ST_VISIBLE = 512; // begin of partial eclipse */
export const SE_ECL_PARTBEG_VISIBLE = 512; // begin of partial eclipse */
export const SE_ECL_2ND_VISIBLE = 1024; // begin of total eclipse */
export const SE_ECL_TOTBEG_VISIBLE = 1024; // begin of total eclipse */
export const SE_ECL_3RD_VISIBLE = 2048; // end of total eclipse */
export const SE_ECL_TOTEND_VISIBLE = 2048; // end of total eclipse */
export const SE_ECL_4TH_VISIBLE = 4096; // end of partial eclipse */
export const SE_ECL_PARTEND_VISIBLE = 4096; // end of partial eclipse */
export const SE_ECL_PENUMBBEG_VISIBLE = 8192; // begin of penumbral eclipse */
export const SE_ECL_PENUMBEND_VISIBLE = 16384; // end of penumbral eclipse */
export const SE_ECL_OCC_BEG_DAYLIGHT = 8192; // occultation begins during the day */
export const SE_ECL_OCC_END_DAYLIGHT = 16384; // occultation ends during the day */
export const SE_ECL_ONE_TRY = (32*1024);

// RISE TRANSIT
export const SE_CALC_RISE = 1;
export const SE_CALC_SET = 2;
export const SE_CALC_MTRANSIT = 4;
export const SE_CALC_ITRANSIT = 8;
export const SE_BIT_DISC_CENTER = 256; // to be or'ed to SE_CALC_RISE/SET,
export const SE_BIT_DISC_BOTTOM = 8192; // to be or'ed to SE_CALC_RISE/SET,
export const SE_BIT_GEOCTR_NO_ECL_LAT = 128; // use geocentric rather than topocentric
export const SE_BIT_NO_REFRACTION = 512; // to be or'ed to SE_CALC_RISE/SET,
export const SE_BIT_CIVIL_TWILIGHT = 1024; // to be or'ed to SE_CALC_RISE/SET */
export const SE_BIT_NAUTIC_TWILIGHT = 2048; // to be or'ed to SE_CALC_RISE/SET */
export const SE_BIT_ASTRO_TWILIGHT = 4096; // to be or'ed to SE_CALC_RISE/SET */
export const SE_BIT_FIXED_DISC_SIZE = 16384; // or'ed to SE_CALC_RISE/SET:
export const SE_BIT_FORCE_SLOW_METHOD = 32768; // This is only an Astrodienst in-house
export const SE_BIT_HINDU_RISING = (SE_BIT_DISC_CENTER|SE_BIT_NO_REFRACTION|SE_BIT_GEOCTR_NO_ECL_LAT);

// COORDINATE TRANSFORM
export const SE_ECL2HOR = 0;
export const SE_EQU2HOR = 1;
export const SE_HOR2ECL = 0;
export const SE_HOR2EQU = 1;

// REFRACTION
export const SE_TRUE_TO_APP = 0;
export const SE_APP_TO_TRUE = 1;

// HELIACAL
export const SE_HELIACAL_RISING = 1;
export const SE_HELIACAL_SETTING = 2;
export const SE_MORNING_FIRST = SE_HELIACAL_RISING;
export const SE_EVENING_LAST = SE_HELIACAL_SETTING;
export const SE_EVENING_FIRST = 3;
export const SE_MORNING_LAST = 4;
export const SE_ACRONYCHAL_RISING = 5; // still not implemented */
export const SE_ACRONYCHAL_SETTING = 6; // still not implemented */
export const SE_COSMICAL_SETTING = SE_ACRONYCHAL_SETTING;
export const SE_HELFLAG_LONG_SEARCH = 128;
export const SE_HELFLAG_HIGH_PRECISION = 256;
export const SE_HELFLAG_OPTICAL_PARAMS = 512;
export const SE_HELFLAG_NO_DETAILS = 1024;
export const SE_HELFLAG_SEARCH_1_PERIOD = (1 << 11); // 2048 */
export const SE_HELFLAG_VISLIM_DARK = (1 << 12); // 4096 */
export const SE_HELFLAG_VISLIM_NOMOON = (1 << 13); // 8192 */
export const SE_HELFLAG_VISLIM_PHOTOPIC = (1 << 14); // 16384 */
export const SE_HELFLAG_VISLIM_SCOTOPIC = (1 << 15); // 32768 */
export const SE_HELFLAG_AV = (1 << 16); // 65536 */
export const SE_HELFLAG_AVKIND_VR = (1 << 16); // 65536 */
export const SE_HELFLAG_AVKIND_PTO = (1 << 17);
export const SE_HELFLAG_AVKIND_MIN7 = (1 << 18);
export const SE_HELFLAG_AVKIND_MIN9 = (1 << 19);
export const SE_HELFLAG_AVKIND = (SE_HELFLAG_AVKIND_VR|SE_HELFLAG_AVKIND_PTO|SE_HELFLAG_AVKIND_MIN7|SE_HELFLAG_AVKIND_MIN9);
export const SE_HELIACAL_LONG_SEARCH = 128;
export const SE_HELIACAL_HIGH_PRECISION = 256;
export const SE_HELIACAL_OPTICAL_PARAMS = 512;
export const SE_HELIACAL_NO_DETAILS = 1024;
export const SE_HELIACAL_SEARCH_1_PERIOD = (1 << 11); // 2048 */
export const SE_HELIACAL_VISLIM_DARK = (1 << 12); // 4096 */
export const SE_HELIACAL_VISLIM_NOMOON = (1 << 13); // 8192 */
export const SE_HELIACAL_VISLIM_PHOTOPIC = (1 << 14); // 16384 */
export const SE_HELIACAL_AVKIND_VR = (1 << 15); // 32768 */
export const SE_HELIACAL_AVKIND_PTO = (1 << 16);
export const SE_HELIACAL_AVKIND_MIN7 = (1 << 17);
export const SE_HELIACAL_AVKIND_MIN9 = (1 << 18);
export const SE_HELIACAL_AVKIND = (SE_HELFLAG_AVKIND_VR|SE_HELFLAG_AVKIND_PTO|SE_HELFLAG_AVKIND_MIN7|SE_HELFLAG_AVKIND_MIN9);

// OPTIC
export const SE_PHOTOPIC_FLAG = 0;
export const SE_SCOTOPIC_FLAG = 1;
export const SE_MIXEDOPIC_FLAG = 2;

// SPLIT DEG
export const SE_SPLIT_DEG_ROUND_SEC = 1;
export const SE_SPLIT_DEG_ROUND_MIN = 2;
export const SE_SPLIT_DEG_ROUND_DEG = 4;
export const SE_SPLIT_DEG_ZODIACAL = 8;
export const SE_SPLIT_DEG_NAKSHATRA = 1024;
export const SE_SPLIT_DEG_KEEP_SIGN = 16; // don't round to next sign,
export const SE_SPLIT_DEG_KEEP_DEG = 32; // don't round to next degree

// TIDAL
export const SE_TIDAL_DE200 = (-23.8946);
export const SE_TIDAL_DE403 = (-25.580); // was (-25.8) until V. 1.76.2 */
export const SE_TIDAL_DE404 = (-25.580); // was (-25.8) until V. 1.76.2 */
export const SE_TIDAL_DE405 = (-25.826); // was (-25.7376) until V. 1.76.2 */
export const SE_TIDAL_DE406 = (-25.826); // was (-25.7376) until V. 1.76.2 */
export const SE_TIDAL_DE421 = (-25.85); // JPL Interoffice Memorandum 14-mar-2008 on DE421 Lunar Orbit */
export const SE_TIDAL_DE422 = (-25.85); // JPL Interoffice Memorandum 14-mar-2008 on DE421 (sic!) Lunar Orbit */
export const SE_TIDAL_DE430 = (-25.82); // JPL Interoffice Memorandum 9-jul-2013 on DE430 Lunar Orbit */
export const SE_TIDAL_DE431 = (-25.80);
export const SE_TIDAL_DE441 = (-25.936); // unpublished value, from email by Jon Giorgini to DK on 11 Apr 2021 */
export const SE_TIDAL_26 = (-26.0);
export const SE_TIDAL_STEPHENSON_2016 = (-25.85);
export const SE_TIDAL_DEFAULT = SE_TIDAL_DE431;
export const SE_TIDAL_AUTOMATIC = 999999;
export const SE_TIDAL_MOSEPH = SE_TIDAL_DE404;
export const SE_TIDAL_SWIEPH = SE_TIDAL_DEFAULT;
export const SE_TIDAL_JPLEPH = SE_TIDAL_DEFAULT;

// DELTAT
export const SE_DELTAT_AUTOMATIC = (-1E-10);

// MODELS
export const SE_MODEL_DELTAT = 0;
export const SE_MODEL_PREC_LONGTERM = 1;
export const SE_MODEL_PREC_SHORTTERM = 2;
export const SE_MODEL_NUT = 3;
export const SE_MODEL_BIAS = 4;
export const SE_MODEL_JPLHOR_MODE = 5;
export const SE_MODEL_JPLHORA_MODE = 6;
export const SE_MODEL_SIDT = 7;
export const NSE_MODELS = 8;

// MODEL VALUES
export const SEMOD_NPREC = 11;
export const SEMOD_PREC_IAU_1976 = 1;
export const SEMOD_PREC_LASKAR_1986 = 2;
export const SEMOD_PREC_WILL_EPS_LASK = 3;
export const SEMOD_PREC_WILLIAMS_1994 = 4;
export const SEMOD_PREC_SIMON_1994 = 5;
export const SEMOD_PREC_IAU_2000 = 6;
export const SEMOD_PREC_BRETAGNON_2003 = 7;
export const SEMOD_PREC_IAU_2006 = 8;
export const SEMOD_PREC_VONDRAK_2011 = 9;
export const SEMOD_PREC_OWEN_1990 = 10;
export const SEMOD_PREC_NEWCOMB = 11;
export const SEMOD_PREC_DEFAULT = SEMOD_PREC_VONDRAK_2011;
export const SEMOD_PREC_DEFAULT_SHORT = SEMOD_PREC_VONDRAK_2011;
export const SEMOD_NNUT = 5;
export const SEMOD_NUT_IAU_1980 = 1;
export const SEMOD_NUT_IAU_CORR_1987 = 2; // Herring's (1987) corrections to IAU 1980
export const SEMOD_NUT_IAU_2000A = 3; // very time consuming ! */
export const SEMOD_NUT_IAU_2000B = 4; // fast, but precision of milli-arcsec */
export const SEMOD_NUT_WOOLARD = 5;
export const SEMOD_NUT_DEFAULT = SEMOD_NUT_IAU_2000B; // fast, but precision of milli-arcsec */
export const SEMOD_NSIDT = 4;
export const SEMOD_SIDT_IAU_1976 = 1;
export const SEMOD_SIDT_IAU_2006 = 2;
export const SEMOD_SIDT_IERS_CONV_2010 = 3;
export const SEMOD_SIDT_LONGTERM = 4;
export const SEMOD_SIDT_DEFAULT = SEMOD_SIDT_LONGTERM;
export const SEMOD_NBIAS = 3;
export const SEMOD_BIAS_NONE = 1; // ignore frame bias */
export const SEMOD_BIAS_IAU2000 = 2; // use frame bias matrix IAU 2000 */
export const SEMOD_BIAS_IAU2006 = 3; // use frame bias matrix IAU 2006 */
export const SEMOD_BIAS_DEFAULT = SEMOD_BIAS_IAU2006;
export const SEMOD_NJPLHOR = 2;
export const SEMOD_JPLHOR_LONG_AGREEMENT = 1; // daily dpsi and deps from file are
export const SEMOD_JPLHOR_DEFAULT = SEMOD_JPLHOR_LONG_AGREEMENT;
export const SEMOD_NJPLHORA = 3;
export const SEMOD_JPLHORA_1 = 1;
export const SEMOD_JPLHORA_2 = 2;
export const SEMOD_JPLHORA_3 = 3;
export const SEMOD_JPLHORA_DEFAULT = SEMOD_JPLHORA_3;
export const SEMOD_NDELTAT = 5;
export const SEMOD_DELTAT_STEPHENSON_MORRISON_1984 = 1;
export const SEMOD_DELTAT_STEPHENSON_1997 = 2;
export const SEMOD_DELTAT_STEPHENSON_MORRISON_2004 = 3;
export const SEMOD_DELTAT_ESPENAK_MEEUS_2006 = 4;
export const SEMOD_DELTAT_STEPHENSON_ETC_2016 = 5;
export const SEMOD_DELTAT_DEFAULT = SEMOD_DELTAT_STEPHENSON_ETC_2016;

// FIXSTAR
export const SE_FIXSTAR = -10;
export const SE_MAX_STNAME = 256; // maximum size of fixstar name;

// OTHER
export const SE_INTP_APOG = 21;
export const SE_INTP_PERG = 22;
export const SE_NSIDM_PREDEF = 47;
export const SE_DE_NUMBER = 431;
