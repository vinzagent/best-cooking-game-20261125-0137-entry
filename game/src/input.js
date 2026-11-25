// Golden Skillet — mouse and keyboard input. Every clickable thing on the
// canvas has a hit box here that mirrors the layout render.js draws.

import { CANVAS_W, INGREDIENTS, INGREDIENT_BY_ID } from './config.js';
import {
  COUNTER_H,
  COUNTER_Y,
  GRILL_BOX,
  SERVE_BTN,
  TRASH_BTN,
  TRAY_BOX,
} from './render.js';
import { SCREENS, addIngredient, putOnGrill, servePlate, startShift, takeFromGrill, trashPlate } from './state.js';
import { setMuted, isMuted, sfxClick } from './audio.js';

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function inCircle(x, y, cx, cy, r) {
  return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r;
}

function counterSlotRect(i) {
  const x0 = 24;
  const w = CANVAS_W - 48;
  const slotW = (w - 24) / INGREDIENTS.length;
  const cx = x0 + 12 + slotW * i + slotW / 2;
  return { x: cx - slotW / 2 + 6, y: COUNTER_Y + 46, w: slotW - 12, h: COUNTER_H - 46, cx, cy: COUNTER_Y + 92 };
}

export function handleClick(state, x, y) {
  if (state.screen === SCREENS.TITLE) {
    // Start button on the title card.
    if (inRect(x, y, { x: 470, y: 536, w: 340, h: 56 })) {
      sfxClick();
      startShift(state);
    }
    return;
  }
  if (state.screen === SCREENS.END) {
    if (inRect(x, y, { x: 470, y: 570, w: 340, h: 56 })) {
      sfxClick();
      startShift(state);
    }
    return;
  }

  // Serve / trash.
  if (inRect(x, y, SERVE_BTN)) {
    servePlate(state);
    return;
  }
  if (inRect(x, y, TRASH_BTN)) {
    trashPlate(state);
    return;
  }

  // Grill slots: click a filled slot to take the piece off.
  for (let i = 0; i < 2; i++) {
    const sx = GRILL_BOX.x + 46 + i * 150;
    const sy = GRILL_BOX.y + 84;
    if (inCircle(x, y, sx, sy, 52) && state.grill[i]) {
      takeFromGrill(state, i);
      return;
    }
  }

  // Ready tray: click a cooked piece to add it to the plate.
  if (state.cooked.length > 0) {
    const counts = {};
    for (const id of state.cooked) counts[id] = (counts[id] || 0) + 1;
    let ix = TRAY_BOX.x + 52;
    for (const id of Object.keys(counts)) {
      if (inCircle(x, y, ix, TRAY_BOX.y + 84, 46)) {
        addIngredient(state, id);
        return;
      }
      ix += 92;
    }
  }

  // Ingredient counter: raw pieces go to the grill, the rest to the plate.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    const rect = counterSlotRect(i);
    if (inRect(x, y, rect)) {
      const ing = INGREDIENTS[i];
      if (ing.cook) putOnGrill(state, ing.id);
      else addIngredient(state, ing.id);
      return;
    }
  }
}

export function handleKey(state, key) {
  if (key === 'm' || key === 'M') {
    setMuted(!isMuted());
    return;
  }
  if (state.screen === SCREENS.TITLE || state.screen === SCREENS.END) {
    if (key === 'Enter' || key === ' ') {
      sfxClick();
      startShift(state);
    }
    return;
  }
  if (key === 'Enter') {
    servePlate(state);
    return;
  }
  if (key === 'Backspace' || key === 'Delete') {
    trashPlate(state);
    return;
  }
  const ing = INGREDIENTS.find((i) => i.key === key);
  if (ing) {
    if (ing.cook) putOnGrill(state, ing.id);
    else addIngredient(state, ing.id);
  }
}

// Exposed for the play-test harness: the same rectangles render.js draws.
export function hitBoxes() {
  return {
    grill: GRILL_BOX,
    tray: TRAY_BOX,
    serve: SERVE_BTN,
    trash: TRASH_BTN,
    counterSlots: INGREDIENTS.map((_, i) => counterSlotRect(i)),
  };
}

export { INGREDIENT_BY_ID };
