// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  // Difficulty scales player and drone speed; keys 1/2/3 switch and restart the round.
  difficulties: {
    easy: { label: 'Easy', speed: 0.75 },
    medium: { label: 'Medium', speed: 1 },
    hard: { label: 'Hard', speed: 1.75 }
  },
  defaultDifficulty: 'medium',
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
