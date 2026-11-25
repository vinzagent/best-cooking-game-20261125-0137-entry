// Golden Skillet — boot and game loop. A fixed 1280x800 canvas, scaled by CSS
// to fit the window; clicks are mapped back into canvas coordinates.

import { CANVAS_H, CANVAS_W, DISH_BY_ID, INGREDIENTS } from './config.js';
import { handleClick, handleKey } from './input.js';
import { render } from './render.js';
import { freshShotState } from './shots.js';
import { SCREENS, newGame, update } from './state.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number(params.get('seed'));

const state = shot
  ? freshShotState(shot)
  : newGame(Number.isFinite(seedParam) ? seedParam : (Date.now() % 2147483647));

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}

canvas.addEventListener('click', (event) => {
  const { x, y } = toCanvasCoords(event);
  handleClick(state, x, y);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Backspace') event.preventDefault();
  handleKey(state, event.key);
});

// Debug handle for play-tests (never used by the game itself).
window.__golden = {
  state,
  screen: () => state.screen,
  coins: () => state.coins,
  served: () => state.served,
  plate: () => state.plate.slice(),
  orders: () => state.orders.map((o) => o.dishId),
  click: (x, y) => handleClick(state, x, y),
  key: (k) => handleKey(state, k),
  dishBuild: (id) => DISH_BY_ID[id].build.slice(),
  ingredientKeys: () => INGREDIENTS.map((i) => [i.id, i.key, i.cook]),
};

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  // Staged screenshot scenes stay frozen exactly as built.
  if (!shot) update(state, dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}

render(ctx, state);
requestAnimationFrame(frame);

// Keep the title screen honest: it shows the staged kitchen, not a blank wall.
if (state.screen === SCREENS.TITLE && !shot) {
  // Populate the backdrop kitchen once, the same way shots.js does.
  const staged = freshShotState('start');
  state.orders = staged.orders;
  state.grill = staged.grill;
  state.cooked = staged.cooked;
  state.plate = staged.plate;
  state.coins = staged.coins;
  state.combo = staged.combo;
  state.elapsed = staged.elapsed;
  state.timeLeft = staged.timeLeft;
}
