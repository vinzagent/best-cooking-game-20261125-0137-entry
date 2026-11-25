// Golden Skillet — the hand-in program (Node 22, standard library only).
// It copies the playable game (game/) and its screenshots (screenshots/)
// from beside this file into the output directory and writes
// dossier.json there with the vendored make.fun library, so the sealed
// gate can check the files and the judge can read them.
//
// Run locally to check it:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output; outside it,
// MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so two runs write identical bytes.
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier is built with the same library and the same limits the sealed
// gate uses, so the dossier.json this program writes is byte for byte the
// one the gate rebuilds from game/ and screenshots/. Nothing here depends
// on the clock, the network or the environment, so running it twice writes
// the same bytes twice.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
