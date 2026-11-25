// All sound is synthesized with WebAudio — no audio files, no network.
// A tiny synth: short blips, a sizzle made of filtered noise, and a serve jingle.

let ctx = null;
let muted = false;
let sizzleNodes = null;

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
  if (muted) stopSizzle();
}

export function isMuted() {
  return muted;
}

function blip(freq, dur, type, vol, when = 0) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function sfxClick() {
  blip(660, 0.07, 'triangle', 0.12);
}

export function sfxAdd() {
  blip(520, 0.08, 'sine', 0.16);
  blip(780, 0.09, 'sine', 0.12, 0.05);
}

export function sfxServe() {
  blip(523, 0.1, 'triangle', 0.18);
  blip(659, 0.1, 'triangle', 0.18, 0.09);
  blip(784, 0.16, 'triangle', 0.2, 0.18);
}

export function sfxWrong() {
  blip(220, 0.16, 'sawtooth', 0.1);
  blip(174, 0.22, 'sawtooth', 0.1, 0.1);
}

export function sfxTick() {
  blip(880, 0.05, 'square', 0.05);
}

export function sfxBurn() {
  blip(140, 0.3, 'sawtooth', 0.12);
}

export function sfxOrder() {
  blip(392, 0.09, 'triangle', 0.14);
  blip(523, 0.12, 'triangle', 0.14, 0.08);
}

// A looping grill sizzle: white noise through a band-pass filter, quiet.
export function startSizzle() {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac || sizzleNodes) return;
  const len = ac.sampleRate * 1.5;
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 5200;
  filter.Q.value = 0.6;
  const gain = ac.createGain();
  gain.gain.value = 0.035;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
  sizzleNodes = { src, gain };
}

export function stopSizzle() {
  if (!sizzleNodes) return;
  try {
    sizzleNodes.src.stop();
  } catch {
    // Already stopped; nothing to do.
  }
  sizzleNodes = null;
}
