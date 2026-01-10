# Swiss Ephemeris WebAssembly Build

This module compiles Swiss Ephemeris to WebAssembly for use in Cloudflare Workers and other ESM JavaScript/TypeScript environments.

## Features

- Pure ESM module (no CommonJS)
- No filesystem dependencies - uses built-in Moshier ephemeris
- Cloudflare Workers compatible
- TypeScript types included
- ~1 arc second accuracy for Sun, Moon, and planets

## Prerequisites

### Install Emscripten SDK

```bash
# Clone the emsdk repository
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk

# Install and activate
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

Or on macOS with Homebrew:
```bash
brew install emscripten
```

## Building

```bash
npm run build
```

This will:
1. Compile C sources to WebAssembly
2. Compile TypeScript
3. Output everything to `lib/` (swisseph.mjs, swisseph.wasm, index.js, index.d.ts)

## Usage

### Basic Usage

```typescript
import { createSwissEph, Planet, Ayanamsa, HouseSystem } from '@jyoti/swisseph';

const swe = await createSwissEph();

// Set Lahiri ayanamsa for Vedic calculations
swe.setSiderealMode(Ayanamsa.LAHIRI);

// Calculate Julian Day for a date
const jd = swe.julday(1990, 5, 15, 12.5); // May 15, 1990, 12:30 PM

// Calculate Sun position (sidereal)
const sun = swe.calcSidereal(jd, Planet.SUN);
if (!('error' in sun)) {
  console.log(`Sun longitude: ${sun.longitude}°`);
}

// Calculate house cusps (Whole Sign for Jyotish)
const houses = swe.housesSidereal(jd, 28.6139, 77.2090, HouseSystem.WHOLE_SIGN);
console.log(`Ascendant: ${houses.ascendant}°`);

// Clean up
swe.close();
```

### Cloudflare Workers

```typescript
import { createSwissEph, Planet, Ayanamsa } from '@jyoti/swisseph';

export default {
  async fetch(request: Request): Promise<Response> {
    const swe = await createSwissEph();
    swe.setSiderealMode(Ayanamsa.LAHIRI);

    const jd = swe.julday(2024, 1, 1, 12);
    const sun = swe.calcSidereal(jd, Planet.SUN);

    swe.close();

    return new Response(JSON.stringify(sun), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

## API Reference

### SwissEph Class

#### Date/Time
- `julday(year, month, day, hour?, gregorian?)` - Convert to Julian Day
- `revjul(jd, gregorian?)` - Convert from Julian Day
- `siderealTime(jdUt)` - Get sidereal time

#### Calculations
- `calc(jdUt, planet, flags?)` - Calculate tropical position
- `calcSidereal(jdUt, planet, flags?)` - Calculate sidereal position
- `calcKetu(jdUt, useTrueNode?, flags?)` - Calculate Ketu (South Node)
- `calcKetuSidereal(jdUt, useTrueNode?, flags?)` - Calculate sidereal Ketu

#### Houses
- `houses(jdUt, lat, lon, system?, flags?)` - Calculate tropical houses
- `housesSidereal(jdUt, lat, lon, system?)` - Calculate sidereal houses

#### Configuration
- `setSiderealMode(ayanamsa, t0?, ayanT0?)` - Set ayanamsa
- `setTopo(lon, lat, altitude?)` - Set observer location
- `getAyanamsa(jdUt)` - Get current ayanamsa value
- `getPlanetName(planet)` - Get planet name string
- `normalizeDegrees(deg)` - Normalize to 0-360 range
- `close()` - Free resources

### Constants

#### Planets
```typescript
Planet.SUN, Planet.MOON, Planet.MERCURY, Planet.VENUS, Planet.MARS,
Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO,
Planet.MEAN_NODE, Planet.TRUE_NODE, // Rahu
Planet.CHIRON, Planet.CERES, Planet.PALLAS, Planet.JUNO, Planet.VESTA
```

#### Ayanamsas (for Jyotish)
```typescript
Ayanamsa.LAHIRI           // Most common in India
Ayanamsa.LAHIRI_ICRC      // Indian Calendar Reform Committee
Ayanamsa.TRUE_CITRA       // Chitrapaksha
Ayanamsa.KRISHNAMURTI     // KP system
Ayanamsa.RAMAN            // B.V. Raman
Ayanamsa.YUKTESHWAR       // Sri Yukteswar
```

#### House Systems
```typescript
HouseSystem.WHOLE_SIGN    // Common in Jyotish
HouseSystem.SRIPATI       // Sripati (Jyotish)
HouseSystem.EQUAL
HouseSystem.PLACIDUS
HouseSystem.KOCH
```

## Ephemeris Accuracy

This module uses the built-in Moshier ephemeris which provides:
- ~1 arc second accuracy for Sun, Moon, and planets
- Date range: -12999 to +16800 (Julian Day)
- No external ephemeris files required

For higher precision (sub-arcsecond), you would need to build with FILESYSTEM support and load external ephemeris files.

## License

Swiss Ephemeris is dual-licensed:
- AGPL-3.0 for open source use
- Commercial license available from Astrodienst
