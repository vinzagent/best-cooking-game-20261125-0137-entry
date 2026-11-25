// Golden Skillet — all canvas drawing. Warm diner kitchen, drawn entirely in code:
// no images, no fonts from the network, just shapes, gradients and system fonts.

import {
  CANVAS_H,
  CANVAS_W,
  DISH_BY_ID,
  GRILL_BURN_SECONDS,
  GRILL_COOK_SECONDS,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  PALETTE,
  SHIFT_SECONDS,
} from './config.js';
import { SCREENS, starsEarned } from './state.js';

const FONT = (px, bold = true) => `${bold ? '800' : '400'} ${px}px "Trebuchet MS", "Segoe UI", Verdana, sans-serif`;

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, px, color, align = 'center', bold = true) {
  ctx.fillStyle = color;
  ctx.font = FONT(px, bold);
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function shadow(ctx, on) {
  ctx.shadowColor = on ? PALETTE.shadow : 'transparent';
  ctx.shadowBlur = on ? 10 : 0;
  ctx.shadowOffsetY = on ? 4 : 0;
}

// --- Ingredient art --------------------------------------------------------
// Each ingredient is drawn from shapes so the game needs no image files.
// (cx, cy) is the centre, r the radius of the piece.

export function drawIngredientIcon(ctx, id, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);
  switch (id) {
    case 'bun': {
      ctx.fillStyle = INGREDIENT_BY_ID.bun.color;
      ctx.beginPath();
      ctx.arc(0, r * 0.15, r, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = INGREDIENT_BY_ID.bun.dark;
      ctx.fillRect(-r, r * 0.1, r * 2, r * 0.22);
      ctx.fillStyle = '#fff2cf';
      for (const [sx, sy] of [[-0.45, -0.45], [0.1, -0.6], [0.5, -0.3]]) {
        ctx.beginPath();
        ctx.ellipse(sx * r, sy * r, r * 0.12, r * 0.07, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'patty': {
      ctx.fillStyle = INGREDIENT_BY_ID.patty.color;
      roundRect(ctx, -r, -r * 0.42, r * 2, r * 0.84, r * 0.4);
      ctx.fill();
      ctx.fillStyle = INGREDIENT_BY_ID.patty.dark;
      for (const [sx, sy] of [[-0.5, -0.1], [0, 0.15], [0.5, -0.15], [0.2, -0.2]]) {
        ctx.beginPath();
        ctx.arc(sx * r, sy * r, r * 0.09, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'cheese': {
      ctx.fillStyle = INGREDIENT_BY_ID.cheese.color;
      ctx.save();
      ctx.rotate(-0.06);
      ctx.fillRect(-r * 0.95, -r * 0.55, r * 1.9, r * 1.1);
      ctx.restore();
      ctx.fillStyle = INGREDIENT_BY_ID.cheese.dark;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.55);
      ctx.lineTo(-r * 0.3, r * 0.95);
      ctx.lineTo(0, r * 0.55);
      ctx.lineTo(r * 0.35, r * 0.9);
      ctx.lineTo(r * 0.65, r * 0.55);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = INGREDIENT_BY_ID.lettuce.color;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = r * (i % 2 === 0 ? 1 : 0.72);
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr * 0.55;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = INGREDIENT_BY_ID.lettuce.dark;
      ctx.lineWidth = r * 0.08;
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, 0);
      ctx.lineTo(r * 0.7, 0);
      ctx.stroke();
      break;
    }
    case 'tomato': {
      ctx.fillStyle = INGREDIENT_BY_ID.tomato.color;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a7a';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.25, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INGREDIENT_BY_ID.tomato.dark;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'onion': {
      ctx.strokeStyle = '#e8d9f2';
      ctx.lineWidth = r * 0.22;
      for (const rr of [0.85, 0.55, 0.28]) {
        ctx.beginPath();
        ctx.arc(0, 0, r * rr, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = '#b48ec9';
      ctx.lineWidth = r * 0.07;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.72, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INGREDIENT_BY_ID.egg.color;
      ctx.beginPath();
      ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7b733';
      ctx.beginPath();
      ctx.arc(r * 0.02, -r * 0.08, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bacon': {
      ctx.fillStyle = INGREDIENT_BY_ID.bacon.color;
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.35);
      ctx.bezierCurveTo(-r * 0.5, -r * 0.7, -r * 0.2, 0, r * 0.2, -r * 0.35);
      ctx.bezierCurveTo(r * 0.6, -r * 0.7, r, -r * 0.1, r, r * 0.1);
      ctx.bezierCurveTo(r * 0.5, r * 0.5, r * 0.2, r * 0.2, -r * 0.2, r * 0.45);
      ctx.bezierCurveTo(-r * 0.6, r * 0.7, -r, r * 0.3, -r, -r * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e8a58c';
      ctx.fillRect(-r * 0.8, -r * 0.12, r * 1.6, r * 0.24);
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

// --- Kitchen backdrop ------------------------------------------------------

function drawWall(ctx) {
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = PALETTE.wallStripe;
  for (let y = 96; y < 200; y += 28) ctx.fillRect(0, y, CANVAS_W, 6);
  // Teal tile band behind the counters.
  ctx.fillStyle = PALETTE.tile;
  ctx.fillRect(0, 200, CANVAS_W, 92);
  ctx.strokeStyle = PALETTE.tileDark;
  ctx.lineWidth = 2;
  for (let x = 0; x <= CANVAS_W; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 200);
    ctx.lineTo(x, 292);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 246);
  ctx.lineTo(CANVAS_W, 246);
  ctx.stroke();
  // Hanging lamps.
  for (const x of [220, 640, 1060]) {
    ctx.strokeStyle = '#8a6b45';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 46);
    ctx.stroke();
    ctx.fillStyle = PALETTE.ember;
    ctx.beginPath();
    ctx.moveTo(x - 26, 58);
    ctx.lineTo(x + 26, 58);
    ctx.lineTo(x + 14, 40);
    ctx.lineTo(x - 14, 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd97a';
    ctx.beginPath();
    ctx.arc(x, 60, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawChefMascot(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Face.
  ctx.fillStyle = '#ffcf9e';
  ctx.beginPath();
  ctx.arc(0, 6, 20, 0, Math.PI * 2);
  ctx.fill();
  // Chef hat.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-12, -12, 11, 0, Math.PI * 2);
  ctx.arc(0, -17, 12, 0, Math.PI * 2);
  ctx.arc(12, -12, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-18, -14, 36, 8);
  // Eyes and smile.
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(-7, 4, 2.2, 0, Math.PI * 2);
  ctx.arc(7, 4, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 9, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

// --- HUD -------------------------------------------------------------------

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, CANVAS_W, 64);
  drawChefMascot(ctx, 44, 30, 1.05);
  text(ctx, 'GOLDEN SKILLET', 78, 33, 26, '#ffd97a', 'left');
  text(ctx, 'rush-hour kitchen', 78, 52, 12, '#c9a06a', 'left', false);

  // Shift timer, centre.
  const t = Math.max(0, Math.ceil(state.timeLeft));
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  const urgent = state.timeLeft <= 30 && state.screen === SCREENS.PLAY;
  const timerColor = urgent ? '#ff6b5e' : '#ffffff';
  ctx.fillStyle = urgent ? '#5c1a12' : '#3a2c1e';
  roundRect(ctx, CANVAS_W / 2 - 92, 10, 184, 44, 10);
  ctx.fill();
  text(ctx, `⏱ ${mm}:${ss}`, CANVAS_W / 2, 33, 26, timerColor);
  const frac = state.timeLeft / SHIFT_SECONDS;
  ctx.fillStyle = urgent ? '#ff6b5e' : PALETTE.gold;
  roundRect(ctx, CANVAS_W / 2 - 92, 52, 184 * frac, 4, 2);
  ctx.fill();

  // Coins and hearts, right.
  text(ctx, `🪙 ${state.coins}`, CANVAS_W - 230, 33, 24, PALETTE.gold, 'right');
  for (let i = 0; i < 3; i++) {
    const hx = CANVAS_W - 196 + i * 34;
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i < state.hearts ? '❤️' : '🖤', hx, 33);
  }
  if (state.combo >= 2) {
    text(ctx, `COMBO x${state.combo}`, CANVAS_W - 300, 33, 20, '#ff9d5c', 'right');
  }
}

// --- Order board -----------------------------------------------------------

function drawOrderTicket(ctx, order, x, y, w, h) {
  const dish = DISH_BY_ID[order.dishId];
  const frac = Math.max(0, order.patience / order.maxPatience);
  const barColor = frac > 0.5 ? PALETTE.green : frac > 0.25 ? '#f5a623' : PALETTE.red;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  shadow(ctx, false);
  ctx.strokeStyle = PALETTE.boardEdge;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 12);
  ctx.stroke();

  // Ticket number and dish name.
  ctx.fillStyle = PALETTE.ember;
  ctx.beginPath();
  ctx.arc(x + 24, y + 22, 14, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, String(order.id % 100), x + 24, y + 23, 15, '#ffffff');
  text(ctx, dish.name, x + 46, y + 22, 17, PALETTE.ink, 'left');
  text(ctx, `+${dish.reward} 🪙`, x + w - 12, y + 22, 15, '#8a6b1f', 'right');

  // The build, as a row of mini icons.
  const iconR = 15;
  const gap = 34;
  const totalW = dish.build.length * gap - (gap - iconR * 2);
  let ix = x + (w - totalW) / 2 + iconR;
  for (const id of dish.build) {
    ctx.fillStyle = '#f3e3c2';
    ctx.beginPath();
    ctx.arc(ix, y + 58, iconR + 4, 0, Math.PI * 2);
    ctx.fill();
    drawIngredientIcon(ctx, id, ix, y + 58, iconR);
    ix += gap;
  }

  // Patience bar.
  ctx.fillStyle = '#e8dcc0';
  roundRect(ctx, x + 14, y + h - 18, w - 28, 9, 4);
  ctx.fill();
  ctx.fillStyle = barColor;
  roundRect(ctx, x + 14, y + h - 18, (w - 28) * frac, 9, 4);
  ctx.fill();
}

function drawOrderBoard(ctx, state) {
  const x = 24;
  const y = 84;
  const w = 288;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.ink;
  roundRect(ctx, x, y, w, 44, 10);
  ctx.fill();
  shadow(ctx, false);
  text(ctx, '📋 ORDER BOARD', x + w / 2, y + 23, 18, '#ffd97a');
  if (state.orders.length === 0) {
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = FONT(15, false);
    ctx.textAlign = 'center';
    ctx.fillText('No orders yet —', x + w / 2, y + 90);
    ctx.fillText('the rush is coming!', x + w / 2, y + 112);
  }
  let ty = y + 56;
  for (const order of state.orders) {
    drawOrderTicket(ctx, order, x, ty, w, 96);
    ty += 108;
  }
}

// --- Grill and cooked tray ---------------------------------------------------

export const GRILL_BOX = { x: 336, y: 84, w: 300, h: 150 };
export const TRAY_BOX = { x: 656, y: 84, w: 300, h: 150 };

function drawGrill(ctx, state) {
  const { x, y, w, h } = GRILL_BOX;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.steelDark;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  shadow(ctx, false);
  ctx.fillStyle = PALETTE.steel;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 10);
  ctx.fill();
  text(ctx, '🔥 GRILL', x + w / 2, y + 22, 16, PALETTE.ink);
  // Grill bars.
  ctx.strokeStyle = '#7d838e';
  ctx.lineWidth = 3;
  for (let gy = y + 44; gy < y + h - 14; gy += 12) {
    ctx.beginPath();
    ctx.moveTo(x + 16, gy);
    ctx.lineTo(x + w - 16, gy);
    ctx.stroke();
  }
  // Slots.
  for (let i = 0; i < 2; i++) {
    const sx = x + 46 + i * 150;
    const sy = y + 84;
    const slot = state.grill[i];
    ctx.fillStyle = 'rgba(43,33,24,0.18)';
    ctx.beginPath();
    ctx.arc(sx, sy, 44, 0, Math.PI * 2);
    ctx.fill();
    if (slot) {
      const ing = INGREDIENT_BY_ID[slot.id];
      const cookedFrac = Math.min(1, slot.t / GRILL_COOK_SECONDS);
      const burning = slot.t >= GRILL_COOK_SECONDS;
      drawIngredientIcon(ctx, slot.id, sx, sy, 34);
      // Cook ring.
      ctx.strokeStyle = burning ? '#ff5a3c' : '#2e7f7a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(sx, sy, 44, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cookedFrac);
      ctx.stroke();
      if (burning) {
        const burnFrac = Math.min(1, (slot.t - GRILL_COOK_SECONDS) / (GRILL_BURN_SECONDS - GRILL_COOK_SECONDS));
        text(ctx, 'READY!', sx, sy + 56, 13, '#b94a12');
        ctx.fillStyle = '#e8483f';
        roundRect(ctx, sx - 30, sy - 54, 60 * burnFrac, 5, 2);
        ctx.fill();
      } else {
        text(ctx, `${Math.ceil(GRILL_COOK_SECONDS - slot.t)}s`, sx, sy + 56, 13, PALETTE.inkSoft);
      }
    } else {
      ctx.fillStyle = 'rgba(43,33,24,0.35)';
      ctx.font = FONT(13, false);
      ctx.textAlign = 'center';
      ctx.fillText('empty slot', sx, sy);
    }
  }
}

function drawCookedTray(ctx, state) {
  const { x, y, w, h } = TRAY_BOX;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  shadow(ctx, false);
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 10);
  ctx.fill();
  text(ctx, '🍽 READY TRAY — click a piece to add it', x + w / 2, y + 22, 14, '#fff6e3');
  if (state.cooked.length === 0) {
    ctx.fillStyle = 'rgba(255,246,227,0.75)';
    ctx.font = FONT(14, false);
    ctx.textAlign = 'center';
    ctx.fillText('Nothing cooked yet.', x + w / 2, y + 84);
    ctx.fillText('Grill a patty, egg or bacon first.', x + w / 2, y + 106);
    return;
  }
  const counts = {};
  for (const id of state.cooked) counts[id] = (counts[id] || 0) + 1;
  let ix = x + 52;
  for (const [id, n] of Object.entries(counts)) {
    ctx.fillStyle = 'rgba(255,246,227,0.9)';
    ctx.beginPath();
    ctx.arc(ix, y + 84, 40, 0, Math.PI * 2);
    ctx.fill();
    drawIngredientIcon(ctx, id, ix, y + 84, 30);
    if (n > 1) {
      ctx.fillStyle = PALETTE.ember;
      ctx.beginPath();
      ctx.arc(ix + 28, y + 52, 13, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, `x${n}`, ix + 28, y + 53, 14, '#ffffff');
    }
    ix += 92;
  }
}

// --- Assembly plate ----------------------------------------------------------

export const PLATE_BOX = { x: 336, y: 252, w: 620, h: 300 };
export const SERVE_BTN = { x: 336, y: 566, w: 300, h: 52 };
export const TRASH_BTN = { x: 656, y: 566, w: 300, h: 52 };

function drawStackLayer(ctx, id, cx, baseY, w) {
  const ing = INGREDIENT_BY_ID[id];
  const h = id === 'bun' ? 16 : 13;
  ctx.fillStyle = ing.color;
  roundRect(ctx, cx - w / 2, baseY - h, w, h, 6);
  ctx.fill();
  ctx.fillStyle = ing.dark;
  if (id === 'bun') {
    ctx.beginPath();
    ctx.arc(cx, baseY - h, w * 0.42, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
  }
  if (id === 'patty' || id === 'bacon') {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (const dx of [-w * 0.28, 0, w * 0.28]) {
      ctx.beginPath();
      ctx.arc(cx + dx, baseY - h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (id === 'cheese') {
    ctx.fillStyle = ing.dark;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.3, baseY);
    ctx.lineTo(cx - w * 0.18, baseY + 9);
    ctx.lineTo(cx - w * 0.05, baseY);
    ctx.moveTo(cx + w * 0.1, baseY);
    ctx.lineTo(cx + w * 0.22, baseY + 9);
    ctx.lineTo(cx + w * 0.35, baseY);
    ctx.fill();
  }
  if (id === 'egg') {
    ctx.fillStyle = '#f7b733';
    ctx.beginPath();
    ctx.arc(cx + w * 0.18, baseY - h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  return h;
}

function drawPlate(ctx, state) {
  const { x, y, w, h } = PLATE_BOX;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  shadow(ctx, false);
  text(ctx, '🍔 ASSEMBLY PLATE', x + w / 2, y + 22, 15, '#fff6e3', 'center');
  const cx = x + w / 2;
  const plateY = y + h - 52;
  // Plate ellipse.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 150, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d9d2c2';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 150, 30, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#eef2f5';
  ctx.beginPath();
  ctx.ellipse(cx, plateY, 118, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.plate.length === 0) {
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = FONT(16, false);
    ctx.textAlign = 'center';
    ctx.fillText('Click ingredients below to build a dish.', cx, plateY - 90);
    ctx.fillText('Match a ticket, then hit SERVE.', cx, plateY - 64);
  } else {
    let baseY = plateY - 8;
    const n = state.plate.length;
    for (let i = 0; i < n; i++) {
      const id = state.plate[i];
      const layerW = 170 - Math.min(40, i * 4);
      baseY -= drawStackLayer(ctx, id, cx, baseY, layerW);
    }
    // Show the next expected piece for the closest ticket, as a hint.
    const match = state.orders.find((o) => {
      const dish = DISH_BY_ID[o.dishId];
      return dish.build.slice(0, state.plate.length).every((id, i) => id === state.plate[i]);
    });
    if (match) {
      const dish = DISH_BY_ID[match.dishId];
      const next = dish.build[state.plate.length];
      if (next) {
        text(ctx, `Next for ${dish.name}: ${INGREDIENT_BY_ID[next].name}`, cx, y + 48, 15, '#2e7f7a');
      } else {
        text(ctx, `Ready to serve: ${dish.name}!`, cx, y + 48, 16, PALETTE.ember);
      }
    }
  }
}

function drawServeButtons(ctx, state) {
  const match = state.plate.length > 0 && state.orders.some((o) => {
    const dish = DISH_BY_ID[o.dishId];
    return dish.build.length === state.plate.length && dish.build.every((id, i) => id === state.plate[i]);
  });
  shadow(ctx, true);
  ctx.fillStyle = match ? PALETTE.green : '#8a8f96';
  roundRect(ctx, SERVE_BTN.x, SERVE_BTN.y, SERVE_BTN.w, SERVE_BTN.h, 12);
  ctx.fill();
  shadow(ctx, false);
  text(ctx, match ? '✅ SERVE IT!  (Enter)' : 'SERVE  (Enter)', SERVE_BTN.x + SERVE_BTN.w / 2, SERVE_BTN.y + 27, 19, '#ffffff');

  ctx.fillStyle = '#6b5844';
  roundRect(ctx, TRASH_BTN.x, TRASH_BTN.y, TRASH_BTN.w, TRASH_BTN.h, 12);
  ctx.fill();
  text(ctx, '🗑 TRASH PLATE  (Backspace)', TRASH_BTN.x + TRASH_BTN.w / 2, TRASH_BTN.y + 27, 17, '#fff6e3');
}

// --- Ingredient counter ------------------------------------------------------

export const COUNTER_Y = 640;
export const COUNTER_H = 148;

function drawCounter(ctx, state) {
  const x0 = 24;
  const w = CANVAS_W - 48;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.counter;
  roundRect(ctx, x0, COUNTER_Y, w, COUNTER_H, 16);
  ctx.fill();
  shadow(ctx, false);
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, x0 + 6, COUNTER_Y + 6, w - 12, 26, 10);
  ctx.fill();
  text(ctx, '🥬 INGREDIENT COUNTER — click, or press 1–8  •  grill items cook first (click the grill to take them off)', x0 + w / 2, COUNTER_Y + 19, 14, '#fff6e3');
  const slotW = (w - 24) / INGREDIENTS.length;
  INGREDIENTS.forEach((ing, i) => {
    const cx = x0 + 12 + slotW * i + slotW / 2;
    const cy = COUNTER_Y + 92;
    const cookedReady = ing.cook ? state.cooked.includes(ing.id) : true;
    const grilling = ing.cook ? state.grill.some((s) => s.id === ing.id) : false;
    ctx.fillStyle = cookedReady ? '#fff8e7' : '#e8dcc0';
    roundRect(ctx, cx - slotW / 2 + 6, cy - 46, slotW - 12, 92, 12);
    ctx.fill();
    if (!cookedReady) {
      ctx.fillStyle = 'rgba(43,33,24,0.45)';
      roundRect(ctx, cx - slotW / 2 + 6, cy - 46, slotW - 12, 92, 12);
      ctx.fill();
    }
    drawIngredientIcon(ctx, ing.id, cx, cy - 8, 26);
    text(ctx, `${ing.name} [${ing.key}]`, cx, cy + 28, 14, PALETTE.ink);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = FONT(11, false);
    ctx.textAlign = 'center';
    ctx.fillText(ing.cook ? (grilling ? 'on grill…' : cookedReady ? 'ready!' : 'needs grill') : 'ready', cx, cy + 42);
    if (ing.cook) {
      ctx.fillStyle = '#e8641f';
      ctx.font = FONT(11);
      ctx.fillText('🔥', cx + slotW / 2 - 18, cy - 34);
    }
  });
}

// --- Floats, toast, screens ----------------------------------------------------

function drawFloats(ctx, state) {
  for (const f of state.floats) {
    const alpha = Math.max(0, f.life / f.max);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = FONT(26);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,246,227,0.9)';
    const rise = (1 - f.life / f.max) * 46;
    ctx.strokeText(f.text, f.x, f.y - rise);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y - rise);
    ctx.restore();
  }
}

function drawToast(ctx, state) {
  if (!state.toast || state.elapsed > state.toastUntil) return;
  ctx.save();
  ctx.font = FONT(16);
  const w = ctx.measureText(state.toast).width + 36;
  const x = (CANVAS_W - w) / 2;
  const y = 632;
  ctx.fillStyle = 'rgba(43,33,24,0.88)';
  roundRect(ctx, x, y - 18, w, 36, 18);
  ctx.fill();
  text(ctx, state.toast, CANVAS_W / 2, y, 16, '#ffd97a');
  ctx.restore();
}

function drawTitleScreen(ctx, state) {
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  const px = 290;
  const py = 150;
  const pw = 700;
  const ph = 480;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.fill();
  shadow(ctx, false);
  ctx.strokeStyle = PALETTE.boardEdge;
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.stroke();
  drawChefMascot(ctx, px + pw / 2, py + 78, 2.2);
  text(ctx, 'GOLDEN SKILLET', px + pw / 2, py + 150, 52, PALETTE.ember);
  text(ctx, 'A rush-hour kitchen game', px + pw / 2, py + 196, 22, PALETTE.inkSoft, 'center', false);
  const lines = [
    'Tickets roll in on the order board — build each dish',
    'on the plate, grill the raw stuff first, and serve',
    'before patience runs out. Burned food and wrong',
    'plates cost you. How many coins can one shift make?',
  ];
  lines.forEach((line, i) => text(ctx, line, px + pw / 2, py + 248 + i * 28, 18, PALETTE.ink, 'center', false));
  ctx.fillStyle = PALETTE.green;
  roundRect(ctx, px + pw / 2 - 170, py + 386, 340, 56, 14);
  ctx.fill();
  text(ctx, '▶  START SHIFT  (click or Enter)', px + pw / 2, py + 415, 20, '#ffffff');
  text(ctx, 'Mouse to click  •  1–8 ingredients  •  Enter serve  •  M mute', px + pw / 2, py + 466, 14, PALETTE.inkSoft, 'center', false);
}

function drawEndScreen(ctx, state) {
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  ctx.fillRect(0, 64, CANVAS_W, CANVAS_H - 64);
  const px = 340;
  const py = 130;
  const pw = 600;
  const ph = 520;
  shadow(ctx, true);
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, px, py, pw, ph, 20);
  ctx.fill();
  shadow(ctx, false);
  text(ctx, 'SHIFT OVER!', px + pw / 2, py + 52, 40, PALETTE.ember);
  text(ctx, state.endReason, px + pw / 2, py + 92, 18, PALETTE.inkSoft, 'center', false);
  const stars = starsEarned(state);
  for (let i = 0; i < 3; i++) {
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i < stars ? '⭐' : '☆', px + pw / 2 - 70 + i * 70, py + 152);
  }
  const rows = [
    ['Coins earned', `🪙 ${state.coins}`],
    ['Dishes served', String(state.served)],
    ['Best combo', `x${state.bestCombo}`],
    ['Wrong serves', String(state.stats.wrongServes)],
    ['Burned on grill', String(state.stats.burned)],
  ];
  rows.forEach(([label, value], i) => {
    const ry = py + 218 + i * 42;
    text(ctx, label, px + 70, ry, 19, PALETTE.inkSoft, 'left', false);
    text(ctx, value, px + pw - 70, ry, 19, PALETTE.ink, 'right');
  });
  ctx.fillStyle = PALETTE.green;
  roundRect(ctx, px + pw / 2 - 170, py + 440, 340, 56, 14);
  ctx.fill();
  text(ctx, '↻  PLAY AGAIN  (Enter)', px + pw / 2, py + 469, 20, '#ffffff');
}

// --- Main entry ---------------------------------------------------------------

export function render(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawWall(ctx);
  drawHud(ctx, state);
  if (state.screen === SCREENS.TITLE) {
    // A lively kitchen behind the title: a staged mid-game scene.
    drawOrderBoard(ctx, state);
    drawGrill(ctx, state);
    drawCookedTray(ctx, state);
    drawPlate(ctx, state);
    drawServeButtons(ctx, state);
    drawCounter(ctx, state);
    drawTitleScreen(ctx, state);
    return;
  }
  drawOrderBoard(ctx, state);
  drawGrill(ctx, state);
  drawCookedTray(ctx, state);
  drawPlate(ctx, state);
  drawServeButtons(ctx, state);
  drawCounter(ctx, state);
  drawFloats(ctx, state);
  drawToast(ctx, state);
  if (state.screen === SCREENS.END) drawEndScreen(ctx, state);
}
