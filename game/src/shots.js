// Golden Skillet — deterministic staged scenes for the screenshots.
// Each stage builds a real game state through the same state module the live
// game uses, then freezes it, so every screenshot is a true render of the
// game's own code: `?shot=start|play|rush|end` (seed fixed per shot).

import { SCREENS, newGame, startShift } from './state.js';

function ticket(state, id, dishId, patience, maxPatience) {
  return { id, dishId, patience, maxPatience, bornAt: 0 };
}

function demoKitchen(state) {
  // A busy kitchen behind the title card: tickets, a grill at work, a plate
  // mid-assembly, so the title shot already shows the whole game.
  state.orders = [
    ticket(state, 1, 'classic', 38, 46),
    ticket(state, 2, 'cheesy', 24, 46),
    ticket(state, 3, 'breakfast', 31, 46),
  ];
  state.grill = [{ id: 'patty', t: 3.5 }];
  state.cooked = ['bacon'];
  state.plate = ['bun', 'patty', 'cheese'];
  state.coins = 86;
  state.combo = 3;
  state.elapsed = 55;
  state.timeLeft = 125;
}

export function stageShot(state, shot) {
  if (shot === 'start') {
    state.screen = SCREENS.TITLE;
    demoKitchen(state);
    return state;
  }
  if (shot === 'play') {
    startShift(state);
    state.elapsed = 55;
    state.timeLeft = 125;
    state.coins = 86;
    state.combo = 3;
    state.bestCombo = 4;
    state.orders = [
      ticket(state, 4, 'classic', 34, 46),
      ticket(state, 5, 'double', 21, 46),
      ticket(state, 6, 'garden', 28, 46),
    ];
    state.grill = [
      { id: 'patty', t: 3.5 },
      { id: 'egg', t: 7.5 },
    ];
    state.cooked = ['bacon'];
    // A finished Classic Burger on the plate, matching ticket 4: the cover
    // shows a plate ready to serve, with SERVE lit green.
    state.plate = ['bun', 'patty', 'lettuce', 'tomato', 'bun'];
    return state;
  }
  if (shot === 'rush') {
    startShift(state);
    state.elapsed = 148;
    state.timeLeft = 32;
    state.coins = 214;
    state.combo = 5;
    state.bestCombo = 6;
    state.served = 11;
    state.orders = [
      ticket(state, 7, 'baconator', 9, 40),
      ticket(state, 8, 'double', 14, 40),
      ticket(state, 9, 'cheesy', 6, 40),
      ticket(state, 10, 'breakfast', 18, 40),
    ];
    state.grill = [
      { id: 'patty', t: 8.2 },
      { id: 'bacon', t: 11.4 },
    ];
    state.cooked = ['egg'];
    state.plate = ['bun', 'bacon', 'patty', 'cheese'];
    state.floats = [{ x: 640, y: 430, text: '+24 COINS', color: '#2e7f7a', life: 1.1, max: 1.4 }];
    return state;
  }
  if (shot === 'end') {
    startShift(state);
    state.screen = SCREENS.END;
    state.elapsed = 180;
    state.timeLeft = 0;
    state.coins = 262;
    state.served = 14;
    state.combo = 0;
    state.bestCombo = 6;
    state.hearts = 2;
    state.endReason = 'Shift over!';
    state.stats = { wrongServes: 1, burned: 1, trashed: 2 };
    state.orders = [ticket(state, 11, 'classic', 20, 46)];
    state.plate = ['bun', 'patty'];
    return state;
  }
  return state;
}

export function freshShotState(shot) {
  const seeds = { start: 11, play: 22, rush: 33, end: 44 };
  const state = newGame(seeds[shot] || 7);
  return stageShot(state, shot);
}
