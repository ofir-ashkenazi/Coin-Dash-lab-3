// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a },
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
