// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a },
  // Synthesized with Web Audio; type 'noise' is a filtered noise burst (freq = low-pass cutoff).
  defaultSound: 'Beep',
  sounds: {
    Beep: { type: 'square', freq: 880, to: 660, duration: 0.18, volume: 0.15 },
    Buzz: { type: 'sawtooth', freq: 140, to: 70, duration: 0.4, volume: 0.2 },
    Boom: { type: 'noise', freq: 900, to: 60, duration: 0.6, volume: 0.6 },
    Off: null
  },
  pickupSound: { type: 'sine', freq: 990, to: 1480, duration: 0.08, volume: 0.12 }
};
