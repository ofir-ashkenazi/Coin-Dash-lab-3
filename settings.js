// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  // Difficulty scales player and drone speed; keys 0-4 switch and restart the round.
  difficulties: {
    supereasy: { label: 'Super Easy', speed: 0.5 },
    easy: { label: 'Easy', speed: 0.75 },
    medium: { label: 'Medium', speed: 1 },
    hard: { label: 'Hard', speed: 1.75 },
    maxhard: { label: 'Max Hard', speed: 2.5 }
  },
  defaultDifficulty: 'medium',
  // Synthesized with Web Audio; type 'noise' is a filtered noise burst (freq = low-pass cutoff).
  defaultSound: 'Beep',
  sounds: {
    Beep: { type: 'square', freq: 880, to: 660, duration: 0.18, volume: 0.15 },
    Buzz: { type: 'sawtooth', freq: 140, to: 70, duration: 0.4, volume: 0.2 },
    Boom: { type: 'noise', freq: 900, to: 60, duration: 0.6, volume: 0.6 },
    Chirp: { type: 'triangle', freq: 400, to: 1600, duration: 0.25, volume: 0.25 },
    Off: null
  },
  pickupSound: { type: 'sine', freq: 990, to: 1480, duration: 0.08, volume: 0.12 },
  // Colour themes; the toggle button switches between them at any time. "player" is the accent
  // colour; the player itself is drawn in the colour chosen on the start screen.
  defaultTheme: 'dark',
  themes: {
    dark: {
      background: 0x101c31, grid: 0x24334b, gridAlpha: 0.45, text: '#ffffff',
      panel: 0x0a1120, panelAlpha: 0.95, outline: 0x0a1120,
      player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a,
      // Start screen: dimmed text, card fill and border, selected card fill and border, button text.
      muted: '#9fb0c8', card: 0x0a1120, border: 0x34445e, selected: 0x1d2c45, strong: 0xffffff, buttonText: '#0a1120'
    },
    light: {
      background: 0xf3f6fb, grid: 0xc9d3e3, gridAlpha: 0.8, text: '#14213d',
      panel: 0xffffff, panelAlpha: 0.95, outline: 0x14213d,
      player: 0x0f9d84, coin: 0xf2b100, drone: 0xe0314b,
      muted: '#5a6b85', card: 0xffffff, border: 0xc9d3e3, selected: 0xdde6f3, strong: 0x14213d, buttonText: '#ffffff'
    }
  },
  // Choices offered on the start screen; the first entry of each list is the default.
  playerShapes: ['square', 'triangle', 'heart', 'star'],
  playerColors: [
    { name: 'pink', value: 0xff7eb6 },
    { name: 'green', value: 0x7ee081 },
    { name: 'blue', value: 0x5aa9ff },
    { name: 'purple', value: 0xb48cff }
  ],
  playerSize: 26
};
