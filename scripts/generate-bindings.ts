#!/usr/bin/env bun
/**
 * Swiss Ephemeris TypeScript Bindings Generator
 *
 * Parses swephexp.h to generate:
 * - src/generated/constants.ts - All #define constants
 * - src/generated/functions.ts - SwissEphWasm interface
 * - src/generated/index.ts - Re-exports
 *
 * Also outputs the list of functions for Makefile.wasm EXPORTED_FUNCTIONS
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { functionConfig, type FunctionConfig, type OutputType } from "./function-config.js";

const HEADER_PATH = join(dirname(import.meta.dir), "swephexp.h");
const OUTPUT_DIR = join(dirname(import.meta.dir), "src", "generated");

// ============================================================================
// TYPES
// ============================================================================

interface Constant {
  name: string;
  value: string;
  comment?: string;
  dependencies: string[]; // Other constants this references
}

interface FunctionParam {
  type: string;
  name: string;
  isPointer: boolean;
}

interface FunctionDecl {
  returnType: string;
  name: string;
  params: FunctionParam[];
}

// ============================================================================
// PARSE #define CONSTANTS
// ============================================================================

function parseConstants(headerContent: string): Constant[] {
  const constants: Constant[] = [];

  // Remove multi-line comments but keep single-line context
  let processed = headerContent.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    const firstLine = match.split("\n")[0].replace(/\/\*\s*/, "").trim();
    return firstLine.length > 0 && firstLine.length < 80
      ? `/* ${firstLine} */`
      : "";
  });

  // Process line by line for better accuracy
  const lines = processed.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match #define NAME value [/* comment */]
    const match = line.match(
      /^#\s*define\s+([A-Z][A-Z0-9_]*)\s+(.+?)(?:\s*\/\*(.+?)\*\/)?$/
    );
    if (!match) continue;

    const name = match[1];
    let value = match[2].trim();
    const comment = match[3]?.trim();

    // Skip certain defines
    const skipNames = [
      "_SWEPHEXP_INCLUDED",
      "MY_TRUE",
      "MY_FALSE",
      "MALLOC",
      "CALLOC",
      "FREE",
      "CALL_CONV",
      "EXP32",
      "SIMULATE_VICTORVB",
      "TJD_INVALID",
      "ext_def",
    ];
    if (skipNames.includes(name)) continue;

    // Skip string literals
    if (value.startsWith('"') || value.startsWith("'")) continue;

    // Skip function-like macros
    if (name.match(/\(/)) continue;

    // Clean value
    value = value.replace(/\/\*.*?\*\//g, "").trim();
    value = value.replace(/\/\/.*$/, "").trim();

    // Skip empty values
    if (!value) continue;

    // Parse and validate value
    const parsedValue = parseConstantValue(value);
    if (!parsedValue) continue;

    // Find dependencies (other constants referenced)
    const deps = findDependencies(parsedValue.value);

    constants.push({
      name,
      value: parsedValue.value,
      comment,
      dependencies: deps,
    });
  }

  return constants;
}

function parseConstantValue(
  value: string
): { value: string; isNumeric: boolean } | null {
  // Simple numeric value
  if (value.match(/^-?[\d.]+$/)) {
    return { value, isNumeric: true };
  }

  // Negative number in parentheses
  if (value.match(/^\(-[\d.]+\)$/)) {
    return { value, isNumeric: true };
  }

  // Simple multiplication/shift without parens: 2*1024
  if (value.match(/^\d+\s*[\*\+\-\/]\s*\d+$/)) {
    return { value: `(${value})`, isNumeric: true };
  }

  // Bit shift: 1 << 11
  if (value.match(/^\d+\s*<<\s*\d+$/)) {
    return { value: `(${value})`, isNumeric: true };
  }

  // Parenthesized numeric expression
  if (value.match(/^\([^)]*\d[^)]*\)$/)) {
    // Verify it's a valid numeric expression (numbers, operators)
    const inner = value.slice(1, -1);
    if (inner.match(/^[\d\s*+\-/<>|&^()]+$/)) {
      return { value, isNumeric: true };
    }
    // Mixed with constants
    if (inner.match(/^[A-Z0-9_\s*+\-/<>|&^()]+$/)) {
      return { value, isNumeric: false };
    }
  }

  // Reference to another constant
  if (value.match(/^[A-Z][A-Z0-9_]*$/)) {
    return { value, isNumeric: false };
  }

  // Expression with constants: (CONST1 | CONST2)
  if (value.match(/^\([A-Z0-9_\s|&+\-*]+\)$/)) {
    return { value, isNumeric: false };
  }

  // Bare expression with constants
  if (value.match(/^[A-Z0-9_]+(\s*[|&+\-*]\s*[A-Z0-9_]+)+$/)) {
    return { value: `(${value})`, isNumeric: false };
  }

  return null;
}

function findDependencies(value: string): string[] {
  const deps: string[] = [];
  const matches = value.matchAll(/\b([A-Z][A-Z0-9_]+)\b/g);
  for (const match of matches) {
    deps.push(match[1]);
  }
  return deps;
}

function topologicalSort(constants: Constant[]): Constant[] {
  const byName = new Map(constants.map((c) => [c.name, c]));
  const sorted: Constant[] = [];
  const visited = new Set<string>();
  const inProgress = new Set<string>();
  const skipped = new Set<string>();

  // First pass: find constants with missing dependencies
  for (const c of constants) {
    for (const dep of c.dependencies) {
      if (!byName.has(dep)) {
        skipped.add(c.name);
        break;
      }
    }
  }

  // Also skip constants that depend on skipped constants
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of constants) {
      if (skipped.has(c.name)) continue;
      for (const dep of c.dependencies) {
        if (skipped.has(dep)) {
          skipped.add(c.name);
          changed = true;
          break;
        }
      }
    }
  }

  function visit(name: string) {
    if (visited.has(name)) return;
    if (inProgress.has(name)) return; // Circular
    if (skipped.has(name)) return;

    const c = byName.get(name);
    if (!c) return;

    inProgress.add(name);

    for (const dep of c.dependencies) {
      if (byName.has(dep)) {
        visit(dep);
      }
    }

    inProgress.delete(name);
    visited.add(name);
    sorted.push(c);
  }

  for (const c of constants) {
    if (!skipped.has(c.name)) {
      visit(c.name);
    }
  }

  return sorted;
}

// ============================================================================
// PARSE FUNCTION DECLARATIONS
// ============================================================================

function parseFunctions(headerContent: string): FunctionDecl[] {
  const functions: FunctionDecl[] = [];

  // ext_def(return_type) function_name(params);
  const funcRegex =
    /ext_def\s*\(\s*([^)]+)\s*\)\s+(\w+)\s*\(([\s\S]*?)\)\s*;/g;

  let match;
  while ((match = funcRegex.exec(headerContent)) !== null) {
    const returnType = match[1].trim();
    const name = match[2].trim();
    let paramsStr = match[3].trim();

    // Skip functions that return strings or are commented out in the header
    const skipFunctions = [
      "swe_version",
      "swe_get_library_path",
      "swe_cs2timestr",
      "swe_cs2lonlatstr",
      "swe_cs2degstr",
      "swe_get_ayanamsa_name",
      "swe_get_current_file_data",
      "swe_house_name",
      "swe_set_timeout", // commented out in header
    ];

    if (skipFunctions.includes(name)) continue;

    // Clean up params
    paramsStr = paramsStr.replace(/\/\*[\s\S]*?\*\//g, "");
    paramsStr = paramsStr.replace(/\s+/g, " ").trim();

    const params = parseParams(paramsStr);
    functions.push({ returnType, name, params });
  }

  return functions;
}

function parseParams(paramsStr: string): FunctionParam[] {
  if (paramsStr === "void" || paramsStr === "") {
    return [];
  }

  const params: FunctionParam[] = [];
  const paramList = paramsStr.split(",").map((p) => p.trim());

  for (const param of paramList) {
    if (!param) continue;

    let cleaned = param.replace(/^const\s+/, "");
    const isPointer = cleaned.includes("*");
    cleaned = cleaned.replace(/\s*\*\s*/g, " ");

    const parts = cleaned.split(/\s+/).filter((p) => p);
    if (parts.length >= 2) {
      const type = parts.slice(0, -1).join(" ");
      const name = parts[parts.length - 1];
      params.push({ type, name, isPointer });
    } else if (parts.length === 1) {
      params.push({ type: parts[0], name: `arg${params.length}`, isPointer });
    }
  }

  return params;
}

// ============================================================================
// CODE GENERATION
// ============================================================================

function categorizeConstant(name: string): string {
  if (name.startsWith("SE_SIDM_")) return "AYANAMSA";
  if (name.startsWith("SEFLG_")) return "CALC_FLAGS";
  if (name.startsWith("SE_SIDBIT_") || name === "SE_SIDBITS")
    return "SIDEREAL_BITS";
  if (name.startsWith("SE_ECL_")) return "ECLIPSE";
  if (name.startsWith("SE_CALC_") || name.startsWith("SE_BIT_"))
    return "RISE_TRANSIT";
  if (
    name.startsWith("SE_HELFLAG_") ||
    name.startsWith("SE_HELIACAL") ||
    name.startsWith("SE_MORNING_") ||
    name.startsWith("SE_EVENING_") ||
    name.startsWith("SE_ACRONYCHAL") ||
    name.startsWith("SE_COSMICAL")
  )
    return "HELIACAL";
  if (name.startsWith("SE_NODBIT_")) return "NODE_APSIDES";
  if (name.startsWith("SE_SPLIT_DEG_")) return "SPLIT_DEG";
  if (name.startsWith("SE_TIDAL_")) return "TIDAL";
  if (name.startsWith("SE_MODEL_") || name.startsWith("NSE_MODEL"))
    return "MODELS";
  if (name.startsWith("SEMOD_")) return "MODEL_VALUES";
  if (name.startsWith("SE_AUNIT_")) return "UNITS";
  if (
    name.match(
      /^SE_(SUN|MOON|MERCURY|VENUS|MARS|JUPITER|SATURN|URANUS|NEPTUNE|PLUTO|MEAN_NODE|TRUE_NODE|MEAN_APOG|OSCU_APOG|EARTH|CHIRON|PHOLUS|CERES|PALLAS|JUNO|VESTA|INTP_|NPLANETS|ECL_NUT)$/
    )
  )
    return "PLANETS";
  if (
    name.match(
      /^SE_(CUPIDO|HADES|ZEUS|KRONOS|APOLLON|ADMETOS|VULKANUS|POSEIDON|ISIS|NIBIRU|HARRINGTON|NEPTUNE_LEVERRIER|NEPTUNE_ADAMS|PLUTO_LOWELL|PLUTO_PICKERING|VULCAN|WHITE_MOON|PROSERPINA|WALDEMATH)$/
    )
  )
    return "FICTITIOUS_PLANETS";
  if (name.match(/^SE_(ASC|MC|ARMC|VERTEX|EQUASC|COASC1|COASC2|POLASC|NASCMC)$/))
    return "HOUSE_POINTS";
  if (name.match(/^SE_(JUL_CAL|GREG_CAL)$/)) return "CALENDAR";
  if (
    name.match(
      /^SE_(FICT_OFFSET|FICT_OFFSET_1|FICT_MAX|AST_OFFSET|PLMOON_OFFSET|COMET_OFFSET|NALL_NAT_POINTS|NFICT_ELEM|VARUNA)$/
    )
  )
    return "OFFSETS";
  if (name.match(/^SE_(TRUE_TO_APP|APP_TO_TRUE)$/)) return "REFRACTION";
  if (name.match(/^SE_(ECL2HOR|EQU2HOR|HOR2ECL|HOR2EQU)$/))
    return "COORDINATE_TRANSFORM";
  if (name.match(/^SE_(PHOTOPIC_FLAG|SCOTOPIC_FLAG|MIXEDOPIC_FLAG)$/))
    return "OPTIC";
  if (name === "SE_FIXSTAR" || name === "SE_MAX_STNAME") return "FIXSTAR";
  if (name === "SE_DELTAT_AUTOMATIC") return "DELTAT";

  return "OTHER";
}

function generateConstants(constants: Constant[]): string {
  // Topologically sort to ensure dependencies come first
  const sorted = topologicalSort(constants);

  const lines: string[] = [
    "/**",
    " * Swiss Ephemeris Constants",
    " * Auto-generated from swephexp.h - DO NOT EDIT",
    " */",
    "",
  ];

  // Group constants
  const groups: Record<string, Constant[]> = {};

  for (const c of sorted) {
    const prefix = categorizeConstant(c.name);
    if (!groups[prefix]) {
      groups[prefix] = [];
    }
    groups[prefix].push(c);
  }

  // Output groups in logical order
  const groupOrder = [
    "CALENDAR",
    "PLANETS",
    "FICTITIOUS_PLANETS",
    "OFFSETS",
    "HOUSE_POINTS",
    "CALC_FLAGS",
    "SIDEREAL_BITS",
    "AYANAMSA",
    "NODE_APSIDES",
    "ECLIPSE",
    "RISE_TRANSIT",
    "COORDINATE_TRANSFORM",
    "REFRACTION",
    "HELIACAL",
    "OPTIC",
    "SPLIT_DEG",
    "TIDAL",
    "DELTAT",
    "MODELS",
    "MODEL_VALUES",
    "UNITS",
    "FIXSTAR",
    "OTHER",
  ];

  for (const group of groupOrder) {
    if (!groups[group] || groups[group].length === 0) continue;

    lines.push(`// ${group.replace(/_/g, " ")}`);

    for (const c of groups[group]) {
      const comment = c.comment ? ` // ${c.comment}` : "";
      lines.push(`export const ${c.name} = ${c.value};${comment}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function cTypeToTs(cType: string, isPointer: boolean): string {
  if (isPointer) {
    return "number";
  }

  const typeMap: Record<string, string> = {
    double: "number",
    int: "number",
    int32: "number",
    int64: "number",
    centisec: "number",
    CSEC: "number",
    AS_BOOL: "number",
    char: "number",
    void: "void",
  };

  return typeMap[cType] || "number";
}

function categorizeFunctions(
  functions: FunctionDecl[]
): Record<string, FunctionDecl[]> {
  const categories: Record<string, FunctionDecl[]> = {
    "Core Calculations": [],
    "Fixed Stars": [],
    "Date/Time": [],
    Houses: [],
    Eclipses: [],
    "Rise/Transit": [],
    Heliacal: [],
    "Coordinate Transforms": [],
    "Delta T": [],
    Sidereal: [],
    Utility: [],
    Other: [],
  };

  for (const fn of functions) {
    if (fn.name.includes("fixstar")) {
      categories["Fixed Stars"].push(fn);
    } else if (
      fn.name.match(
        /calc|calc_ut|calc_pctr|solcross|mooncross|helio_cross|pheno|nod_aps|orbital/
      )
    ) {
      categories["Core Calculations"].push(fn);
    } else if (fn.name.match(/julday|revjul|utc|jdet|jdut|date_conversion/)) {
      categories["Date/Time"].push(fn);
    } else if (fn.name.match(/house/)) {
      categories["Houses"].push(fn);
    } else if (fn.name.match(/eclipse|occult/)) {
      categories["Eclipses"].push(fn);
    } else if (fn.name.match(/rise_trans|azalt/)) {
      categories["Rise/Transit"].push(fn);
    } else if (fn.name.match(/heliacal|vis_limit/)) {
      categories["Heliacal"].push(fn);
    } else if (fn.name.match(/cotrans|refrac/)) {
      categories["Coordinate Transforms"].push(fn);
    } else if (fn.name.match(/deltat|time_equ|lmt_to_lat|lat_to_lmt/)) {
      categories["Delta T"].push(fn);
    } else if (fn.name.match(/sid|ayanamsa/)) {
      categories["Sidereal"].push(fn);
    } else if (
      fn.name.match(
        /degnorm|radnorm|split_deg|day_of_week|d2l|csnorm|difcs|difdeg|difrad|csround|midp/
      )
    ) {
      categories["Utility"].push(fn);
    } else {
      categories["Other"].push(fn);
    }
  }

  return categories;
}

function generateFunctions(functions: FunctionDecl[]): string {
  const lines: string[] = [
    "/**",
    " * Swiss Ephemeris WASM Interface",
    " * Auto-generated from swephexp.h - DO NOT EDIT",
    " */",
    "",
    "/**",
    " * Raw exports from the Swiss Ephemeris WASM module.",
    " * All pointer parameters (double*, int*, char*) are memory addresses (number).",
    " * Use the memory utilities to read/write values at these addresses.",
    " */",
    "export interface SwissEphWasm {",
    "  /** WebAssembly linear memory */",
    "  memory: WebAssembly.Memory;",
    "",
    "  /** Allocate memory */",
    "  malloc(size: number): number;",
    "",
    "  /** Free memory */",
    "  free(ptr: number): void;",
    "",
  ];

  const categories = categorizeFunctions(functions);

  for (const [category, fns] of Object.entries(categories)) {
    if (fns.length === 0) continue;

    lines.push(`  // ${category}`);

    for (const fn of fns) {
      const params = fn.params
        .map((p) => `${p.name}: ${cTypeToTs(p.type, p.isPointer)}`)
        .join(", ");
      const returnType = cTypeToTs(fn.returnType, false);
      lines.push(`  ${fn.name}(${params}): ${returnType};`);
    }
    lines.push("");
  }

  lines.push("}");
  lines.push("");

  return lines.join("\n");
}

function generateIndex(): string {
  return `/**
 * Swiss Ephemeris Generated Bindings
 * Auto-generated - DO NOT EDIT
 */

export * from "./constants.js";
export * from "./functions.js";
export * from "./friendly.js";
`;
}

// ============================================================================
// FRIENDLY WRAPPER GENERATION
// ============================================================================

function generateFriendlyWrappers(functions: FunctionDecl[]): string {
  const lines: string[] = [
    "/**",
    " * Swiss Ephemeris Friendly API",
    " * Auto-generated - DO NOT EDIT",
    " *",
    " * Provides TypeScript-friendly wrappers around the raw WASM interface.",
    " * Handles memory allocation/deallocation automatically.",
    " */",
    "",
    'import type { SwissEphWasm } from "./functions.js";',
    'import { loadSwissEph } from "../loader.js";',
    'import { createMemoryHelpers, type MemoryHelpers } from "../helpers.js";',
    "",
  ];

  // Generate result type interfaces
  lines.push(...generateResultTypes());
  lines.push("");

  // Generate the factory function
  lines.push("/**");
  lines.push(" * Create a Swiss Ephemeris instance with friendly API.");
  lines.push(" *");
  lines.push(" * All functions handle memory management automatically.");
  lines.push(" * Call close() when done to free resources.");
  lines.push(" *");
  lines.push(" * @example");
  lines.push(" * ```ts");
  lines.push(' * const swe = await createSwissEph();');
  lines.push(" * const jd = swe.julday(2024, 1, 1, 12.0);");
  lines.push(" * const sun = swe.calc(jd, SE_SUN, SEFLG_SPEED);");
  lines.push(" * console.log(sun.longitude);");
  lines.push(" * swe.close();");
  lines.push(" * ```");
  lines.push(" */");
  lines.push("export async function createSwissEph() {");
  lines.push("  const raw = await loadSwissEph();");
  lines.push("  const mem = createMemoryHelpers(raw);");
  lines.push("");
  lines.push("  return {");

  // Generate each wrapper function
  for (const fn of functions) {
    const config = functionConfig[fn.name] || { friendlyName: fn.name.replace("swe_", "") };
    if (config.skip) continue;

    const wrapperCode = generateWrapperFunction(fn, config);
    lines.push(...wrapperCode.map(l => "    " + l));
    lines.push("");
  }

  // Add raw access
  lines.push("    /** Access raw WASM interface for advanced usage */");
  lines.push("    raw,");
  lines.push("");
  lines.push("    /** Memory helpers for advanced usage */");
  lines.push("    mem,");

  lines.push("  };");
  lines.push("}");
  lines.push("");
  lines.push("export type SwissEph = Awaited<ReturnType<typeof createSwissEph>>;");
  lines.push("");

  return lines.join("\n");
}

function generateResultTypes(): string[] {
  return [
    "// Result Types",
    "",
    "export interface PlanetPosition {",
    "  longitude: number;",
    "  latitude: number;",
    "  distance: number;",
    "  longitudeSpeed: number;",
    "  latitudeSpeed: number;",
    "  distanceSpeed: number;",
    "}",
    "",
    "export interface DateComponents {",
    "  year: number;",
    "  month: number;",
    "  day: number;",
    "  hour: number;",
    "}",
    "",
    "export interface UtcComponents {",
    "  year: number;",
    "  month: number;",
    "  day: number;",
    "  hour: number;",
    "  minute: number;",
    "  second: number;",
    "}",
    "",
    "export interface HouseResult {",
    "  cusps: number[];",
    "  ascendant: number;",
    "  mc: number;",
    "  armc: number;",
    "  vertex: number;",
    "  equatorialAscendant: number;",
    "  coAscendantKoch: number;",
    "  coAscendantMunkasey: number;",
    "  polarAscendant: number;",
    "}",
    "",
    "export interface HouseResultWithSpeed extends HouseResult {",
    "  cuspSpeeds: number[];",
    "  ascmcSpeeds: number[];",
    "}",
    "",
    "export interface SplitDegrees {",
    "  degrees: number;",
    "  minutes: number;",
    "  seconds: number;",
    "  secondFraction: number;",
    "  sign: number;",
    "}",
    "",
    "export interface JulianDayResult {",
    "  et: number;",
    "  ut: number;",
    "}",
    "",
    "export interface AzimuthAltitude {",
    "  azimuth: number;",
    "  trueAltitude: number;",
    "  apparentAltitude: number;",
    "}",
    "",
    "export interface PhenomenaResult {",
    "  phaseAngle: number;",
    "  phase: number;",
    "  elongation: number;",
    "  apparentDiameter: number;",
    "  apparentMagnitude: number;",
    "}",
    "",
    "export interface NodesApsidesResult {",
    "  ascendingNode: PlanetPosition;",
    "  descendingNode: PlanetPosition;",
    "  perihelion: PlanetPosition;",
    "  aphelion: PlanetPosition;",
    "}",
    "",
    "export interface EclipseTimeResult {",
    "  times: number[];",
    "  attributes?: number[];",
    "}",
    "",
    "export interface EclipseWhereResult {",
    "  geopos: number[];",
    "  attributes: number[];",
    "}",
    "",
    "export interface EclipseAttributes {",
    "  attributes: number[];",
    "}",
    "",
    "export interface OrbitalElements {",
    "  elements: number[];",
    "}",
  ];
}

function generateWrapperFunction(fn: FunctionDecl, config: FunctionConfig): string[] {
  const lines: string[] = [];
  const friendlyName = config.friendlyName || fn.name.replace("swe_", "");
  const outputs = config.outputs || {};
  const inputStrings = config.inputStrings || [];
  const returnType = config.returnType || "number";

  // Build the function signature
  const inputParams = fn.params.filter(p => !outputs[p.name]);
  const signature = buildSignature(inputParams, inputStrings, config, returnType, outputs);
  
  // JSDoc comment
  if (config.description) {
    lines.push(`/** ${config.description} */`);
  }

  lines.push(`${friendlyName}: ${signature} => {`);

  // Generate memory allocations for outputs
  const allocations: string[] = [];
  const frees: string[] = [];
  const outputReads: { param: string; type: OutputType; varName: string }[] = [];

  for (const [paramName, outputType] of Object.entries(outputs)) {
    const varName = `${paramName}Ptr`;
    const size = getOutputSize(outputType);
    allocations.push(`const ${varName} = raw.malloc(${size});`);
    frees.push(`raw.free(${varName});`);
    outputReads.push({ param: paramName, type: outputType, varName });
  }

  // Allocate input strings
  for (const paramName of inputStrings) {
    const varName = `${paramName}Ptr`;
    allocations.push(`const ${varName} = mem.allocString(${paramName});`);
    frees.push(`raw.free(${varName});`);
  }

  // Add allocations
  for (const alloc of allocations) {
    lines.push(`  ${alloc}`);
  }

  if (allocations.length > 0) {
    lines.push("  try {");
  }

  // Call the raw function
  const callArgs = fn.params.map(p => {
    if (outputs[p.name]) return `${p.name}Ptr`;
    if (inputStrings.includes(p.name)) return `${p.name}Ptr`;
    // Convert hsys from string to char code if needed
    if (p.name === "hsys") return `(typeof hsys === "string" ? hsys.charCodeAt(0) : hsys)`;
    return p.name;
  }).join(", ");

  const indent = allocations.length > 0 ? "    " : "  ";

  if (returnType === "void") {
    lines.push(`${indent}raw.${fn.name}(${callArgs});`);
  } else {
    lines.push(`${indent}const ret = raw.${fn.name}(${callArgs});`);
  }

  // Check for errors
  if (returnType === "check-negative" || returnType === "check-error") {
    const errorRead = outputReads.find(o => o.type.type === "error");
    if (errorRead) {
      lines.push(`${indent}if (ret < 0) {`);
      lines.push(`${indent}  const errMsg = mem.getString(${errorRead.varName});`);
      lines.push(`${indent}  throw new Error(errMsg || "Swiss Ephemeris error");`);
      lines.push(`${indent}}`);
    }
  }

  // Build the return value
  const returnCode = buildReturnValue(outputReads, config, returnType, indent);
  lines.push(...returnCode);

  // Add finally block if we have allocations
  if (allocations.length > 0) {
    lines.push("  } finally {");
    for (const free of frees) {
      lines.push(`    ${free}`);
    }
    lines.push("  }");
  }

  lines.push("},");

  return lines;
}

function buildSignature(
  inputParams: FunctionParam[],
  inputStrings: string[],
  config: FunctionConfig,
  returnType: string,
  outputs: Record<string, OutputType>
): string {
  const params = inputParams.map(p => {
    if (inputStrings.includes(p.name)) {
      return `${p.name}: string`;
    }
    // Special case for hsys - it can be a number or single char
    if (p.name === "hsys") {
      return `${p.name}: number | string`;
    }
    return `${p.name}: number`;
  });

  let resultType = "void";
  if (returnType === "number") {
    if (Object.keys(outputs).length === 0) {
      resultType = "number";
    } else {
      resultType = inferResultType(config, outputs);
    }
  } else if (returnType === "check-negative" || returnType === "check-error") {
    resultType = inferResultType(config, outputs);
  } else if (returnType === "void") {
    if (Object.keys(outputs).length > 0) {
      resultType = inferResultType(config, outputs);
    }
  }

  return `(${params.join(", ")}): ${resultType}`;
}

function inferResultType(config: FunctionConfig, outputs: Record<string, OutputType>): string {
  if (config.resultType) return config.resultType;
  
  // Single output
  const outputEntries = Object.entries(outputs).filter(([_, t]) => t.type !== "error");
  if (outputEntries.length === 1) {
    const [_, type] = outputEntries[0];
    if (type.type === "float64" || type.type === "int32") return "number";
    if (type.type === "string") return "string";
    if (type.type === "float64[]" || type.type === "int32[]") return "number[]";
  }

  // Multiple outputs - return an object
  return "{ " + outputEntries.map(([name, type]) => {
    const tsType = type.type.includes("[]") ? "number[]" : 
                   type.type === "string" ? "string" : "number";
    const propName = (type as any).name || name;
    return `${propName}: ${tsType}`;
  }).join("; ") + " }";
}

function getOutputSize(type: OutputType): string {
  switch (type.type) {
    case "float64":
      return "8";
    case "float64[]":
      return `${type.count} * 8`;
    case "int32":
      return "4";
    case "int32[]":
      return `${type.count} * 4`;
    case "string":
    case "error":
      return `${type.size}`;
    default:
      return "8";
  }
}

function buildReturnValue(
  outputReads: { param: string; type: OutputType; varName: string }[],
  config: FunctionConfig,
  returnType: string,
  indent: string
): string[] {
  const lines: string[] = [];
  const nonErrorOutputs = outputReads.filter(o => o.type.type !== "error");

  // Simple return of the function result
  if (nonErrorOutputs.length === 0) {
    if (returnType !== "void") {
      lines.push(`${indent}return ret;`);
    }
    return lines;
  }

  // Special handling for known result types
  if (config.resultType === "PlanetPosition") {
    const xxOutput = outputReads.find(o => o.param === "xx" || o.param === "xxret");
    if (xxOutput) {
      lines.push(`${indent}const xx = mem.getFloat64Array(${xxOutput.varName}, 6);`);
      lines.push(`${indent}return {`);
      lines.push(`${indent}  longitude: xx[0],`);
      lines.push(`${indent}  latitude: xx[1],`);
      lines.push(`${indent}  distance: xx[2],`);
      lines.push(`${indent}  longitudeSpeed: xx[3],`);
      lines.push(`${indent}  latitudeSpeed: xx[4],`);
      lines.push(`${indent}  distanceSpeed: xx[5],`);
      lines.push(`${indent}};`);
      return lines;
    }
  }

  if (config.resultType === "DateComponents") {
    lines.push(`${indent}return {`);
    for (const o of nonErrorOutputs) {
      const propName = (o.type as any).name || o.param;
      const readFn = o.type.type === "int32" ? "getInt32" : "getFloat64";
      lines.push(`${indent}  ${propName}: mem.${readFn}(${o.varName}),`);
    }
    lines.push(`${indent}};`);
    return lines;
  }

  if (config.resultType === "UtcComponents") {
    lines.push(`${indent}return {`);
    for (const o of nonErrorOutputs) {
      const propName = (o.type as any).name || o.param;
      const readFn = o.type.type === "int32" ? "getInt32" : "getFloat64";
      lines.push(`${indent}  ${propName}: mem.${readFn}(${o.varName}),`);
    }
    lines.push(`${indent}};`);
    return lines;
  }

  if (config.resultType === "SplitDegrees") {
    lines.push(`${indent}return {`);
    for (const o of nonErrorOutputs) {
      const propName = (o.type as any).name || o.param;
      const readFn = o.type.type === "int32" ? "getInt32" : "getFloat64";
      lines.push(`${indent}  ${propName}: mem.${readFn}(${o.varName}),`);
    }
    lines.push(`${indent}};`);
    return lines;
  }

  if (config.resultType === "HouseResult") {
    const cuspsOutput = outputReads.find(o => o.param === "cusps");
    const ascmcOutput = outputReads.find(o => o.param === "ascmc");
    if (cuspsOutput && ascmcOutput) {
      lines.push(`${indent}const cusps = mem.getFloat64Array(${cuspsOutput.varName}, 13);`);
      lines.push(`${indent}const ascmc = mem.getFloat64Array(${ascmcOutput.varName}, 10);`);
      lines.push(`${indent}return {`);
      lines.push(`${indent}  cusps: cusps.slice(1), // cusps[0] is unused`);
      lines.push(`${indent}  ascendant: ascmc[0],`);
      lines.push(`${indent}  mc: ascmc[1],`);
      lines.push(`${indent}  armc: ascmc[2],`);
      lines.push(`${indent}  vertex: ascmc[3],`);
      lines.push(`${indent}  equatorialAscendant: ascmc[4],`);
      lines.push(`${indent}  coAscendantKoch: ascmc[5],`);
      lines.push(`${indent}  coAscendantMunkasey: ascmc[6],`);
      lines.push(`${indent}  polarAscendant: ascmc[7],`);
      lines.push(`${indent}};`);
      return lines;
    }
  }

  if (config.resultType === "HouseResultWithSpeed") {
    const cuspsOutput = outputReads.find(o => o.param === "cusps");
    const ascmcOutput = outputReads.find(o => o.param === "ascmc");
    const cuspSpeedOutput = outputReads.find(o => o.param === "cusp_speed");
    const ascmcSpeedOutput = outputReads.find(o => o.param === "ascmc_speed");
    if (cuspsOutput && ascmcOutput) {
      lines.push(`${indent}const cusps = mem.getFloat64Array(${cuspsOutput.varName}, 13);`);
      lines.push(`${indent}const ascmc = mem.getFloat64Array(${ascmcOutput.varName}, 10);`);
      if (cuspSpeedOutput) {
        lines.push(`${indent}const cuspSpeeds = mem.getFloat64Array(${cuspSpeedOutput.varName}, 13);`);
      }
      if (ascmcSpeedOutput) {
        lines.push(`${indent}const ascmcSpeeds = mem.getFloat64Array(${ascmcSpeedOutput.varName}, 10);`);
      }
      lines.push(`${indent}return {`);
      lines.push(`${indent}  cusps: cusps.slice(1),`);
      lines.push(`${indent}  ascendant: ascmc[0],`);
      lines.push(`${indent}  mc: ascmc[1],`);
      lines.push(`${indent}  armc: ascmc[2],`);
      lines.push(`${indent}  vertex: ascmc[3],`);
      lines.push(`${indent}  equatorialAscendant: ascmc[4],`);
      lines.push(`${indent}  coAscendantKoch: ascmc[5],`);
      lines.push(`${indent}  coAscendantMunkasey: ascmc[6],`);
      lines.push(`${indent}  polarAscendant: ascmc[7],`);
      if (cuspSpeedOutput) {
        lines.push(`${indent}  cuspSpeeds: cuspSpeeds.slice(1),`);
      }
      if (ascmcSpeedOutput) {
        lines.push(`${indent}  ascmcSpeeds: Array.from(ascmcSpeeds),`);
      }
      lines.push(`${indent}};`);
      return lines;
    }
  }

  if (config.resultType === "JulianDayResult") {
    const dretOutput = outputReads.find(o => o.param === "dret");
    if (dretOutput) {
      lines.push(`${indent}const dret = mem.getFloat64Array(${dretOutput.varName}, 2);`);
      lines.push(`${indent}return { et: dret[0], ut: dret[1] };`);
      return lines;
    }
  }

  if (config.resultType === "AzimuthAltitude") {
    const xazOutput = outputReads.find(o => o.param === "xaz");
    if (xazOutput) {
      lines.push(`${indent}const xaz = mem.getFloat64Array(${xazOutput.varName}, 3);`);
      lines.push(`${indent}return { azimuth: xaz[0], trueAltitude: xaz[1], apparentAltitude: xaz[2] };`);
      return lines;
    }
  }

  if (config.resultType === "PhenomenaResult") {
    const attrOutput = outputReads.find(o => o.param === "attr");
    if (attrOutput) {
      lines.push(`${indent}const attr = mem.getFloat64Array(${attrOutput.varName}, 20);`);
      lines.push(`${indent}return {`);
      lines.push(`${indent}  phaseAngle: attr[0],`);
      lines.push(`${indent}  phase: attr[1],`);
      lines.push(`${indent}  elongation: attr[2],`);
      lines.push(`${indent}  apparentDiameter: attr[3],`);
      lines.push(`${indent}  apparentMagnitude: attr[4],`);
      lines.push(`${indent}};`);
      return lines;
    }
  }

  if (config.resultType === "NodesApsidesResult") {
    lines.push(`${indent}const xnasc = mem.getFloat64Array(xnascPtr, 6);`);
    lines.push(`${indent}const xndsc = mem.getFloat64Array(xndscPtr, 6);`);
    lines.push(`${indent}const xperi = mem.getFloat64Array(xperiPtr, 6);`);
    lines.push(`${indent}const xaphe = mem.getFloat64Array(xaphePtr, 6);`);
    lines.push(`${indent}const toPos = (arr: number[]): PlanetPosition => ({`);
    lines.push(`${indent}  longitude: arr[0], latitude: arr[1], distance: arr[2],`);
    lines.push(`${indent}  longitudeSpeed: arr[3], latitudeSpeed: arr[4], distanceSpeed: arr[5],`);
    lines.push(`${indent}});`);
    lines.push(`${indent}return {`);
    lines.push(`${indent}  ascendingNode: toPos(Array.from(xnasc)),`);
    lines.push(`${indent}  descendingNode: toPos(Array.from(xndsc)),`);
    lines.push(`${indent}  perihelion: toPos(Array.from(xperi)),`);
    lines.push(`${indent}  aphelion: toPos(Array.from(xaphe)),`);
    lines.push(`${indent}};`);
    return lines;
  }

  if (config.resultType === "OrbitalElements") {
    const dretOutput = outputReads.find(o => o.param === "dret");
    if (dretOutput) {
      lines.push(`${indent}return { elements: mem.getFloat64Array(${dretOutput.varName}, 50) };`);
      return lines;
    }
  }

  if (config.resultType === "EclipseTimeResult") {
    const tretOutput = outputReads.find(o => o.param === "tret");
    const attrOutput = outputReads.find(o => o.param === "attr");
    if (tretOutput) {
      lines.push(`${indent}const times = mem.getFloat64Array(${tretOutput.varName}, 10);`);
      if (attrOutput) {
        lines.push(`${indent}const attributes = mem.getFloat64Array(${attrOutput.varName}, 20);`);
        lines.push(`${indent}return { times: Array.from(times), attributes: Array.from(attributes) };`);
      } else {
        lines.push(`${indent}return { times: Array.from(times) };`);
      }
      return lines;
    }
  }

  if (config.resultType === "EclipseWhereResult") {
    const geoposOutput = outputReads.find(o => o.param === "geopos");
    const attrOutput = outputReads.find(o => o.param === "attr");
    if (geoposOutput && attrOutput) {
      lines.push(`${indent}return {`);
      lines.push(`${indent}  geopos: mem.getFloat64Array(${geoposOutput.varName}, 10),`);
      lines.push(`${indent}  attributes: mem.getFloat64Array(${attrOutput.varName}, 20),`);
      lines.push(`${indent}};`);
      return lines;
    }
  }

  if (config.resultType === "EclipseAttributes") {
    const attrOutput = outputReads.find(o => o.param === "attr");
    if (attrOutput) {
      lines.push(`${indent}return { attributes: mem.getFloat64Array(${attrOutput.varName}, 20) };`);
      return lines;
    }
  }

  // Generic handling for single output
  if (nonErrorOutputs.length === 1) {
    const o = nonErrorOutputs[0];
    if (o.type.type === "float64") {
      lines.push(`${indent}return mem.getFloat64(${o.varName});`);
    } else if (o.type.type === "int32") {
      lines.push(`${indent}return mem.getInt32(${o.varName});`);
    } else if (o.type.type === "string") {
      lines.push(`${indent}return mem.getString(${o.varName});`);
    } else if (o.type.type === "float64[]") {
      lines.push(`${indent}return mem.getFloat64Array(${o.varName}, ${o.type.count});`);
    } else if (o.type.type === "int32[]") {
      const result: string[] = [];
      lines.push(`${indent}const arr: number[] = [];`);
      lines.push(`${indent}for (let i = 0; i < ${o.type.count}; i++) arr.push(mem.getInt32(${o.varName} + i * 4));`);
      lines.push(`${indent}return arr;`);
    }
    return lines;
  }

  // Generic handling for multiple outputs - return object
  lines.push(`${indent}return {`);
  for (const o of nonErrorOutputs) {
    const propName = (o.type as any).name || o.param;
    if (o.type.type === "float64") {
      lines.push(`${indent}  ${propName}: mem.getFloat64(${o.varName}),`);
    } else if (o.type.type === "int32") {
      lines.push(`${indent}  ${propName}: mem.getInt32(${o.varName}),`);
    } else if (o.type.type === "string") {
      lines.push(`${indent}  ${propName}: mem.getString(${o.varName}),`);
    } else if (o.type.type === "float64[]") {
      lines.push(`${indent}  ${propName}: mem.getFloat64Array(${o.varName}, ${o.type.count}),`);
    }
  }
  lines.push(`${indent}};`);

  return lines;
}

function generateExportedFunctions(functions: FunctionDecl[]): string {
  const exports = ["_malloc", "_free"];

  for (const fn of functions) {
    exports.push(`_${fn.name}`);
  }

  return `# Add this to Makefile.wasm EXPORTED_FUNCTIONS
EXPORTED_FUNCTIONS='[${exports.map((e) => `"${e}"`).join(", ")}]'

# Function count: ${functions.length}
`;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("Reading swephexp.h...");
  const headerContent = readFileSync(HEADER_PATH, "utf-8");

  console.log("Extracting constants...");
  const constants = parseConstants(headerContent);
  console.log(`Found ${constants.length} constants`);

  console.log("Extracting functions...");
  const functions = parseFunctions(headerContent);
  console.log(`Found ${functions.length} functions`);

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate constants
  const constantsContent = generateConstants(constants);
  writeFileSync(join(OUTPUT_DIR, "constants.ts"), constantsContent);
  console.log(`Generated ${join(OUTPUT_DIR, "constants.ts")}`);

  // Generate functions
  const functionsContent = generateFunctions(functions);
  writeFileSync(join(OUTPUT_DIR, "functions.ts"), functionsContent);
  console.log(`Generated ${join(OUTPUT_DIR, "functions.ts")}`);

  // Generate friendly wrappers
  console.log("Generating friendly wrappers...");
  const friendlyContent = generateFriendlyWrappers(functions);
  writeFileSync(join(OUTPUT_DIR, "friendly.ts"), friendlyContent);
  console.log(`Generated ${join(OUTPUT_DIR, "friendly.ts")}`);

  // Generate index
  const indexContent = generateIndex();
  writeFileSync(join(OUTPUT_DIR, "index.ts"), indexContent);
  console.log(`Generated ${join(OUTPUT_DIR, "index.ts")}`);

  // Generate Makefile exports (in scripts folder, not src/generated)
  const exportsContent = generateExportedFunctions(functions);
  const exportsPath = join(dirname(import.meta.dir), "scripts", "makefile-exports.txt");
  writeFileSync(exportsPath, exportsContent);
  console.log(`Generated ${exportsPath}`);

  console.log("\nDone!");
}

main();
