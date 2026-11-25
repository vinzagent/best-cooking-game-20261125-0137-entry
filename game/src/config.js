// Golden Skillet — configuration: every ingredient, dish, price and tuning knob.
// Nothing here is loaded from the network; the whole game is static files.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// A shift lasts three minutes. Orders get faster and meaner as the shift goes on.
export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const GRILL_SLOTS = 2;

// Ingredients. `cook` means the raw piece must spend time on the grill first.
// `key` is the keyboard shortcut, `color` drives the drawn art.
export const INGREDIENTS = [
  { id: 'bun',     name: 'Bun',     key: '1', color: '#e8a34c', dark: '#b97a2e', price: 2, cook: null },
  { id: 'patty',   name: 'Patty',   key: '2', color: '#8a4b2d', dark: '#5f3018', price: 5, cook: 'grill' },
  { id: 'cheese',  name: 'Cheese',  key: '3', color: '#ffc93c', dark: '#e0a100', price: 3, cook: null },
  { id: 'lettuce', name: 'Lettuce', key: '4', color: '#7ac74f', dark: '#4d9b2a', price: 2, cook: null },
  { id: 'tomato',  name: 'Tomato',  key: '5', color: '#e8483f', dark: '#b32a24', price: 2, cook: null },
  { id: 'onion',   name: 'Onion',   key: '6', color: '#f2e8d5', dark: '#cbb98f', price: 2, cook: null },
  { id: 'egg',     name: 'Egg',     key: '7', color: '#fff3b0', dark: '#e8c95a', price: 4, cook: 'grill' },
  { id: 'bacon',   name: 'Bacon',   key: '8', color: '#c65a3c', dark: '#8f3a24', price: 4, cook: 'grill' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// Dishes the order board can ask for. `build` is the stack, bottom to top,
// always starting with a bun and ending with a bun. Reward grows with length.
export const DISHES = [
  { id: 'classic',   name: 'Classic Burger',  build: ['bun', 'patty', 'lettuce', 'tomato', 'bun'], reward: 14 },
  { id: 'cheesy',    name: 'Cheesy Melt',     build: ['bun', 'patty', 'cheese', 'cheese', 'bun'], reward: 16 },
  { id: 'breakfast', name: 'Sunrise Stack',   build: ['bun', 'egg', 'bacon', 'cheese', 'bun'],   reward: 20 },
  { id: 'garden',    name: 'Garden Stack',    build: ['bun', 'lettuce', 'tomato', 'onion', 'cheese', 'bun'], reward: 15 },
  { id: 'double',    name: 'Double Trouble',  build: ['bun', 'patty', 'cheese', 'patty', 'onion', 'bun'], reward: 24 },
  { id: 'baconator', name: 'Bacon Deluxe',    build: ['bun', 'bacon', 'patty', 'cheese', 'tomato', 'bun'], reward: 26 },
  { id: 'plain',     name: 'Plain Jane',      build: ['bun', 'patty', 'bun'], reward: 10 },
  { id: 'veggie',    name: 'Veggie Crunch',   build: ['bun', 'lettuce', 'tomato', 'onion', 'bun'], reward: 13 },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// How long a raw piece needs on the grill (seconds), and how long before it burns.
export const GRILL_COOK_SECONDS = 6;
export const GRILL_BURN_SECONDS = 12;

// Order patience: a fresh ticket lives this long (seconds), shorter late in the shift.
export function patienceFor(elapsedSeconds) {
  const t = Math.min(1, elapsedSeconds / SHIFT_SECONDS);
  return 46 - 16 * t;
}

// Gap between new orders arriving, shorter as the rush builds.
export function spawnGapFor(elapsedSeconds) {
  const t = Math.min(1, elapsedSeconds / SHIFT_SECONDS);
  return 13 - 6 * t;
}

// Combo: every 3rd correct serve in a row adds +1 coin per dish, capped here.
export const COMBO_STEP = 3;
export const COMBO_MAX_BONUS = 8;

// Serving a plate that matches no open ticket.
export const WRONG_SERVE_PENALTY_SECONDS = 4;

// Palette — warm diner kitchen: cream walls, teal tiles, wood counters, ember orange.
export const PALETTE = {
  wall: '#f7e8c9',
  wallStripe: '#f3dcae',
  tile: '#2e7f7a',
  tileDark: '#256662',
  counter: '#a9703f',
  counterTop: '#c98d54',
  counterEdge: '#7d4f27',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  board: '#fff8e7',
  boardEdge: '#d9b96a',
  ink: '#2b2118',
  inkSoft: '#6b5844',
  cream: '#fff6e3',
  ember: '#e8641f',
  emberDark: '#b94a12',
  gold: '#ffc93c',
  green: '#4caf50',
  red: '#e8483f',
  shadow: 'rgba(43,33,24,0.25)',
};
