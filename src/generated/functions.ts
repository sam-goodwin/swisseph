/**
 * Swiss Ephemeris WASM Interface
 * Auto-generated from swephexp.h - DO NOT EDIT
 */

/**
 * Raw exports from the Swiss Ephemeris WASM module.
 * All pointer parameters (double*, int*, char*) are memory addresses (number).
 * Use the memory utilities to read/write values at these addresses.
 */
export interface SwissEphWasm {
  /** WebAssembly linear memory */
  memory: WebAssembly.Memory;

  /** Allocate memory */
  malloc(size: number): number;

  /** Free memory */
  free(ptr: number): void;

  // Core Calculations
  swe_heliacal_pheno_ut(tjd_ut: number, geopos: number, datm: number, dobs: number, ObjectName: number, TypeEvent: number, helflag: number, darr: number, serr: number): number;
  swe_calc(tjd: number, ipl: number, iflag: number, xx: number, serr: number): number;
  swe_calc_ut(tjd_ut: number, ipl: number, iflag: number, xx: number, serr: number): number;
  swe_calc_pctr(tjd: number, ipl: number, iplctr: number, iflag: number, xxret: number, serr: number): number;
  swe_solcross(x2cross: number, jd_et: number, flag: number, serr: number): number;
  swe_solcross_ut(x2cross: number, jd_ut: number, flag: number, serr: number): number;
  swe_mooncross(x2cross: number, jd_et: number, flag: number, serr: number): number;
  swe_mooncross_ut(x2cross: number, jd_ut: number, flag: number, serr: number): number;
  swe_mooncross_node(jd_et: number, flag: number, xlon: number, xlat: number, serr: number): number;
  swe_mooncross_node_ut(jd_ut: number, flag: number, xlon: number, xlat: number, serr: number): number;
  swe_helio_cross(ipl: number, x2cross: number, jd_et: number, iflag: number, dir: number, jd_cross: number, serr: number): number;
  swe_helio_cross_ut(ipl: number, x2cross: number, jd_ut: number, iflag: number, dir: number, jd_cross: number, serr: number): number;
  swe_pheno(tjd: number, ipl: number, iflag: number, attr: number, serr: number): number;
  swe_pheno_ut(tjd_ut: number, ipl: number, iflag: number, attr: number, serr: number): number;
  swe_nod_aps(tjd_et: number, ipl: number, iflag: number, method: number, xnasc: number, xndsc: number, xperi: number, xaphe: number, serr: number): number;
  swe_nod_aps_ut(tjd_ut: number, ipl: number, iflag: number, method: number, xnasc: number, xndsc: number, xperi: number, xaphe: number, serr: number): number;
  swe_get_orbital_elements(tjd_et: number, ipl: number, iflag: number, dret: number, serr: number): number;

  // Fixed Stars
  swe_fixstar(star: number, tjd: number, iflag: number, xx: number, serr: number): number;
  swe_fixstar_ut(star: number, tjd_ut: number, iflag: number, xx: number, serr: number): number;
  swe_fixstar_mag(star: number, mag: number, serr: number): number;
  swe_fixstar2(star: number, tjd: number, iflag: number, xx: number, serr: number): number;
  swe_fixstar2_ut(star: number, tjd_ut: number, iflag: number, xx: number, serr: number): number;
  swe_fixstar2_mag(star: number, mag: number, serr: number): number;

  // Date/Time
  swe_date_conversion(y: number, m: number, d: number, utime: number, c: number, tjd: number): number;
  swe_julday(year: number, month: number, day: number, hour: number, gregflag: number): number;
  swe_revjul(jd: number, gregflag: number, jyear: number, jmon: number, jday: number, jut: number): void;
  swe_utc_to_jd(iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number, gregflag: number, dret: number, serr: number): number;
  swe_jdet_to_utc(tjd_et: number, gregflag: number, iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number): void;
  swe_jdut1_to_utc(tjd_ut: number, gregflag: number, iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number): void;
  swe_utc_time_zone(iyear: number, imonth: number, iday: number, ihour: number, imin: number, dsec: number, d_timezone: number, iyear_out: number, imonth_out: number, iday_out: number, ihour_out: number, imin_out: number, dsec_out: number): void;

  // Houses
  swe_houses(tjd_ut: number, geolat: number, geolon: number, hsys: number, cusps: number, ascmc: number): number;
  swe_houses_ex(tjd_ut: number, iflag: number, geolat: number, geolon: number, hsys: number, cusps: number, ascmc: number): number;
  swe_houses_ex2(tjd_ut: number, iflag: number, geolat: number, geolon: number, hsys: number, cusps: number, ascmc: number, cusp_speed: number, ascmc_speed: number, serr: number): number;
  swe_houses_armc(armc: number, geolat: number, eps: number, hsys: number, cusps: number, ascmc: number): number;
  swe_houses_armc_ex2(armc: number, geolat: number, eps: number, hsys: number, cusps: number, ascmc: number, cusp_speed: number, ascmc_speed: number, serr: number): number;
  swe_house_pos(armc: number, geolat: number, eps: number, hsys: number, xpin: number, serr: number): number;

  // Eclipses
  swe_sol_eclipse_where(tjd: number, ifl: number, geopos: number, attr: number, serr: number): number;
  swe_lun_occult_where(tjd: number, ipl: number, starname: number, ifl: number, geopos: number, attr: number, serr: number): number;
  swe_sol_eclipse_how(tjd: number, ifl: number, geopos: number, attr: number, serr: number): number;
  swe_sol_eclipse_when_loc(tjd_start: number, ifl: number, geopos: number, tret: number, attr: number, backward: number, serr: number): number;
  swe_lun_occult_when_loc(tjd_start: number, ipl: number, starname: number, ifl: number, geopos: number, tret: number, attr: number, backward: number, serr: number): number;
  swe_sol_eclipse_when_glob(tjd_start: number, ifl: number, ifltype: number, tret: number, backward: number, serr: number): number;
  swe_lun_occult_when_glob(tjd_start: number, ipl: number, starname: number, ifl: number, ifltype: number, tret: number, backward: number, serr: number): number;
  swe_lun_eclipse_how(tjd_ut: number, ifl: number, geopos: number, attr: number, serr: number): number;
  swe_lun_eclipse_when(tjd_start: number, ifl: number, ifltype: number, tret: number, backward: number, serr: number): number;
  swe_lun_eclipse_when_loc(tjd_start: number, ifl: number, geopos: number, tret: number, attr: number, backward: number, serr: number): number;

  // Rise/Transit
  swe_azalt(tjd_ut: number, calc_flag: number, geopos: number, atpress: number, attemp: number, xin: number, xaz: number): void;
  swe_azalt_rev(tjd_ut: number, calc_flag: number, geopos: number, xin: number, xout: number): void;
  swe_rise_trans_true_hor(tjd_ut: number, ipl: number, starname: number, epheflag: number, rsmi: number, geopos: number, atpress: number, attemp: number, horhgt: number, tret: number, serr: number): number;
  swe_rise_trans(tjd_ut: number, ipl: number, starname: number, epheflag: number, rsmi: number, geopos: number, atpress: number, attemp: number, tret: number, serr: number): number;

  // Heliacal
  swe_heliacal_ut(tjdstart_ut: number, geopos: number, datm: number, dobs: number, ObjectName: number, TypeEvent: number, iflag: number, dret: number, serr: number): number;
  swe_vis_limit_mag(tjdut: number, geopos: number, datm: number, dobs: number, ObjectName: number, helflag: number, dret: number, serr: number): number;
  swe_heliacal_angle(tjdut: number, dgeo: number, datm: number, dobs: number, helflag: number, mag: number, azi_obj: number, azi_sun: number, azi_moon: number, alt_moon: number, dret: number, serr: number): number;

  // Coordinate Transforms
  swe_refrac(inalt: number, atpress: number, attemp: number, calc_flag: number): number;
  swe_refrac_extended(inalt: number, geoalt: number, atpress: number, attemp: number, lapse_rate: number, calc_flag: number, dret: number): number;
  swe_cotrans(xpo: number, xpn: number, eps: number): void;
  swe_cotrans_sp(xpo: number, xpn: number, eps: number): void;

  // Delta T
  swe_deltat(tjd: number): number;
  swe_deltat_ex(tjd: number, iflag: number, serr: number): number;
  swe_time_equ(tjd: number, te: number, serr: number): number;
  swe_lmt_to_lat(tjd_lmt: number, geolon: number, tjd_lat: number, serr: number): number;
  swe_lat_to_lmt(tjd_lat: number, geolon: number, tjd_lmt: number, serr: number): number;

  // Sidereal
  swe_set_sid_mode(sid_mode: number, t0: number, ayan_t0: number): void;
  swe_get_ayanamsa_ex(tjd_et: number, iflag: number, daya: number, serr: number): number;
  swe_get_ayanamsa_ex_ut(tjd_ut: number, iflag: number, daya: number, serr: number): number;
  swe_get_ayanamsa(tjd_et: number): number;
  swe_get_ayanamsa_ut(tjd_ut: number): number;
  swe_sidtime0(tjd_ut: number, eps: number, nut: number): number;
  swe_sidtime(tjd_ut: number): number;

  // Utility
  swe_degnorm(x: number): number;
  swe_radnorm(x: number): number;
  swe_rad_midp(x1: number, x0: number): number;
  swe_deg_midp(x1: number, x0: number): number;
  swe_split_deg(ddeg: number, roundflag: number, ideg: number, imin: number, isec: number, dsecfr: number, isgn: number): void;
  swe_csnorm(p: number): number;
  swe_difcsn(p1: number, p2: number): number;
  swe_difdegn(p1: number, p2: number): number;
  swe_difcs2n(p1: number, p2: number): number;
  swe_difdeg2n(p1: number, p2: number): number;
  swe_difrad2n(p1: number, p2: number): number;
  swe_csroundsec(x: number): number;
  swe_d2l(x: number): number;
  swe_day_of_week(jd: number): number;

  // Other
  swe_topo_arcus_visionis(tjdut: number, dgeo: number, datm: number, dobs: number, helflag: number, mag: number, azi_obj: number, alt_obj: number, azi_sun: number, azi_moon: number, alt_moon: number, dret: number, serr: number): number;
  swe_set_astro_models(samod: number, iflag: number): void;
  swe_get_astro_models(samod: number, sdet: number, iflag: number): void;
  swe_close(): void;
  swe_set_ephe_path(path: number): void;
  swe_set_jpl_file(fname: number): void;
  swe_get_planet_name(ipl: number, spname: number): number;
  swe_set_topo(geolon: number, geolat: number, geoalt: number): void;
  swe_gauquelin_sector(t_ut: number, ipl: number, starname: number, iflag: number, imeth: number, geopos: number, atpress: number, attemp: number, dgsect: number, serr: number): number;
  swe_set_lapse_rate(lapse_rate: number): void;
  swe_orbit_max_min_true_distance(tjd_et: number, ipl: number, iflag: number, dmax: number, dmin: number, dtrue: number, serr: number): number;
  swe_set_interpolate_nut(do_interpolate: number): void;
  swe_get_tid_acc(): number;
  swe_set_tid_acc(t_acc: number): void;
  swe_set_delta_t_userdef(dt: number): void;

}
