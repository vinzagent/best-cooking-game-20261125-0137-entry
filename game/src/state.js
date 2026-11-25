// Golden Skillet — game state and rules. No drawing here, only the kitchen logic:
// orders arrive, ingredients stack on the plate, the grill cooks, serving pays.

import {
  CANVAS_W,
  DISHES,
  DISH_BY_ID,
  GRILL_BURN_SECONDS,
  GRILL_COOK_SECONDS,
  GRILL_SLOTS,
  INGREDIENT_BY_ID,
  MAX_HEARTS,
  MAX_ORDERS,
  SHIFT_SECONDS,
  COMBO_MAX_BONUS,
  COMBO_STEP,
  WRONG_SERVE_PENALTY_SECONDS,
  patienceFor,
  spawnGapFor,
} from './config.js';
import { makeRng, pick } from './random.js';
import * as sfx from './audio.js';

export const SCREENS = { TITLE: 'title', PLAY: 'play', END: 'end' };

let orderSeq = 0;

export function newGame(seed) {
  return {
    screen: SCREENS.TITLE,
    seed,
    rng: makeRng(seed),
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    orders: [],
    spawnIn: 1.2,
    plate: [],
    grill: [],
    cooked: [],
    floats: [],
    toast: '',
    toastUntil: 0,
    stats: { wrongServes: 0, burned: 0, trashed: 0 },
    endReason: '',
    muted: false,
  };
}

export function startShift(state) {
  state.screen = SCREENS.PLAY;
  state.elapsed = 0;
  state.timeLeft = SHIFT_SECONDS;
  state.coins = 0;
  state.served = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.hearts = MAX_HEARTS;
  state.orders = [];
  state.spawnIn = 0.6;
  state.plate = [];
  state.grill = [];
  state.cooked = [];
  state.floats = [];
  state.stats = { wrongServes: 0, burned: 0, trashed: 0 };
  state.endReason = '';
  spawnOrder(state);
  spawnOrder(state);
}

function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return;
  const dish = pick(state.rng, DISHES);
  const patience = patienceFor(state.elapsed);
  state.orders.push({
    id: ++orderSeq,
    dishId: dish.id,
    patience,
    maxPatience: patience,
    bornAt: state.elapsed,
  });
  sfx.sfxOrder();
}

function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, life: 1.4, max: 1.4 });
}

// --- Ingredients -----------------------------------------------------------

export function canAddIngredient(state, ingredientId) {
  if (state.screen !== SCREENS.PLAY) return false;
  const ing = INGREDIENT_BY_ID[ingredientId];
  if (!ing) return false;
  if (ing.cook) {
    // Cooked pieces come off the grill, never straight from the counter.
    return state.cooked.includes(ingredientId);
  }
  return true;
}

export function addIngredient(state, ingredientId) {
  if (!canAddIngredient(state, ingredientId)) {
    if (INGREDIENT_BY_ID[ingredientId]?.cook) {
      state.toast = `${INGREDIENT_BY_ID[ingredientId].name} needs the grill first!`;
      state.toastUntil = state.elapsed + 2;
      sfx.sfxWrong();
    }
    return false;
  }
  if (state.plate.length >= 8) return false;
  state.plate.push(ingredientId);
  if (INGREDIENT_BY_ID[ingredientId].cook) {
    state.cooked.splice(state.cooked.indexOf(ingredientId), 1);
  }
  sfx.sfxAdd();
  return true;
}

// --- Grill -----------------------------------------------------------------

export function grillHasRoom(state) {
  return state.grill.length < GRILL_SLOTS;
}

export function putOnGrill(state, ingredientId) {
  if (state.screen !== SCREENS.PLAY) return false;
  const ing = INGREDIENT_BY_ID[ingredientId];
  if (!ing || !ing.cook) return false;
  if (!grillHasRoom(state)) {
    state.toast = 'Grill is full!';
    state.toastUntil = state.elapsed + 2;
    return false;
  }
  state.grill.push({ id: ingredientId, t: 0 });
  sfx.sfxClick();
  sfx.startSizzle();
  return true;
}

export function takeFromGrill(state, index) {
  const slot = state.grill[index];
  if (!slot) return false;
  state.grill.splice(index, 1);
  if (slot.t >= GRILL_COOK_SECONDS) {
    state.cooked.push(slot.id);
    sfx.sfxAdd();
  } else {
    // Too early: the raw piece goes back, nothing is lost but time.
    state.toast = 'Not cooked yet — give it a few more seconds!';
    state.toastUntil = state.elapsed + 2;
    sfx.sfxWrong();
  }
  if (state.grill.length === 0) sfx.stopSizzle();
  return true;
}

// --- Serving ---------------------------------------------------------------

export function plateMatchesDish(plate, dish) {
  if (plate.length !== dish.build.length) return false;
  return plate.every((id, i) => id === dish.build[i]);
}

export function findMatchingOrder(state) {
  return state.orders.find((o) => plateMatchesDish(state.plate, DISH_BY_ID[o.dishId]));
}

export function servePlate(state) {
  if (state.screen !== SCREENS.PLAY || state.plate.length === 0) return false;
  const order = findMatchingOrder(state);
  if (!order) {
    state.stats.wrongServes += 1;
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_SERVE_PENALTY_SECONDS);
    state.toast = 'No ticket matches that plate — minus 4 seconds!';
    state.toastUntil = state.elapsed + 2.5;
    addFloat(state, CANVAS_W / 2, 430, 'WRONG ORDER!', '#e8483f');
    sfx.sfxWrong();
    return false;
  }
  const dish = DISH_BY_ID[order.dishId];
  const comboBonus = Math.min(COMBO_MAX_BONUS, Math.floor(state.combo / COMBO_STEP));
  const earned = dish.reward + comboBonus;
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.orders = state.orders.filter((o) => o.id !== order.id);
  state.plate = [];
  addFloat(state, CANVAS_W / 2, 430, `+${earned} COINS`, '#2e7f7a');
  if (state.combo > 0 && state.combo % COMBO_STEP === 0) {
    addFloat(state, CANVAS_W / 2, 392, `COMBO x${state.combo}!`, '#e8641f');
  }
  sfx.sfxServe();
  return true;
}

export function trashPlate(state) {
  if (state.plate.length === 0) return;
  state.plate = [];
  state.stats.trashed += 1;
  sfx.sfxClick();
}

// --- Clock -----------------------------------------------------------------

export function update(state, dt) {
  if (state.screen !== SCREENS.PLAY) {
    for (const f of state.floats) f.life -= dt;
    state.floats = state.floats.filter((f) => f.life > 0);
    return;
  }
  state.elapsed += dt;
  state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

  // Grill timers: cook, then burn.
  for (let i = state.grill.length - 1; i >= 0; i--) {
    const slot = state.grill[i];
    slot.t += dt;
    if (slot.t >= GRILL_BURN_SECONDS) {
      state.grill.splice(i, 1);
      state.stats.burned += 1;
      state.toast = `${INGREDIENT_BY_ID[slot.id].name} burned on the grill!`;
      state.toastUntil = state.elapsed + 2;
      addFloat(state, CANVAS_W / 2, 470, 'BURNED!', '#e8483f');
      sfx.sfxBurn();
    }
  }
  if (state.grill.length === 0) sfx.stopSizzle();

  // Orders lose patience; an expired ticket costs a heart.
  for (let i = state.orders.length - 1; i >= 0; i--) {
    const order = state.orders[i];
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(i, 1);
      state.hearts -= 1;
      state.combo = 0;
      addFloat(state, CANVAS_W / 2, 430, 'ORDER WALKED OUT!', '#e8483f');
      sfx.sfxWrong();
    }
  }

  // New orders arrive on a quickening schedule.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
    spawnOrder(state);
    state.spawnIn = spawnGapFor(state.elapsed) * (0.8 + state.rng() * 0.4);
  }

  for (const f of state.floats) f.life -= dt;
  state.floats = state.floats.filter((f) => f.life > 0);

  if (state.timeLeft <= 0) {
    endShift(state, 'Shift over!');
  } else if (state.hearts <= 0) {
    endShift(state, 'Too many walk-outs!');
  }
}

function endShift(state, reason) {
  state.screen = SCREENS.END;
  state.endReason = reason;
  sfx.stopSizzle();
  if (state.served >= 12) sfx.sfxServe();
}

export function starsEarned(state) {
  if (state.served >= 16) return 3;
  if (state.served >= 11) return 2;
  if (state.served >= 6) return 1;
  return 0;
}
