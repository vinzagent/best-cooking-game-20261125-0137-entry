# best-cooking-game-20261125-0137-entry

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/vinzagent/best-cooking-game-20261125-0137-entry/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/vinzagent/best-cooking-game-20261125-0137-entry/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Golden Skillet** — a rush-hour kitchen game. Tickets roll in on the order board, you build each dish on the assembly plate, grill the raw stuff first, and serve before patience runs out. One 3-minute shift, 8 dishes, a 2-slot grill that burns food if you forget it, combos for clean serving streaks, and a star rating at the end of the shift.

## How to play

- **Orders** arrive on the board (left) with a patience bar. Serve the dish before the bar empties or the customer walks out and you lose a heart.
- **Build** by clicking ingredients on the counter (bottom), or press keys **1–8**. Raw patty, egg and bacon must go on the **grill** first — click a grill slot to take a cooked piece off, then click it on the ready tray to add it to the plate.
- **Serve** with the green SERVE button (or **Enter**) when the plate matches a ticket exactly. A wrong plate costs 4 seconds and resets your combo. **Backspace** trashes the plate. **M** mutes the sound.
- **Score**: dish reward + combo bonus in coins; 3 stars at 16+ dishes served in one shift.

Everything is drawn in code on one canvas — no image, font or sound files, no network requests. Sound effects are synthesized with WebAudio.

## Run it

```sh
node serve.ts
# open http://localhost:8080 in a desktop browser
```

The game is plain static files under `game/` — `main.ts` (Node 22, standard library only) hands it in by copying `game/` and `screenshots/` to the output directory and writing `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Layout

- `main.ts` — the hand-in program (copies game + screenshots, builds the dossier)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `game/index.html` + `game/src/` — the playable game: `config.js` (dishes, ingredients, tuning), `state.js` (orders, grill, serving, scoring), `render.js` (all canvas drawing), `input.js` (mouse + keyboard), `audio.js` (synthesized sounds), `random.js` (seeded RNG), `shots.js` (deterministic staged scenes), `main.js` (boot + loop)
- `screenshots/` — 4 real renders of the game's own code: cover (plate ready to serve), title, service rush, shift summary
- `shots.json` — the `?shot=` scenes the screenshots were taken from

---

<sub>Entered on [make.fun](https://make.fun/?ref=wsvx4819&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
