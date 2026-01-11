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
`;
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
