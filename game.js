/* global Phaser, COIN_DASH */
const THEME_KEY = 'coinDashTheme';
function theme() { return COIN_DASH.themes[COIN_DASH.theme]; }
const sound = {
  ctx: null,
  unlock() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    this.ctx = this.ctx || new AC();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  choice() { return document.getElementById('sound')?.value || COIN_DASH.defaultSound; },
  play(def) {
    const ctx = def && this.unlock();
    if (!ctx) return;
    const t = ctx.currentTime, end = t + def.duration, gain = ctx.createGain();
    gain.gain.setValueAtTime(def.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, end);
    gain.connect(ctx.destination);
    let src, out = gain;
    if (def.type === 'noise') {
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * def.duration), ctx.sampleRate);
      buf.getChannelData(0).forEach((_, i, d) => { d[i] = Math.random() * 2 - 1; });
      src = ctx.createBufferSource();
      src.buffer = buf;
      out = ctx.createBiquadFilter();
      out.frequency.setValueAtTime(def.freq, t);
      out.frequency.exponentialRampToValueAtTime(def.to, end);
      out.connect(gain);
    } else {
      src = ctx.createOscillator();
      src.type = def.type;
      src.frequency.setValueAtTime(def.freq, t);
      src.frequency.exponentialRampToValueAtTime(def.to, end);
    }
    src.connect(out);
    src.start(t);
    src.stop(end);
  },
  playChoice() { this.play(COIN_DASH.sounds[this.choice()]); },
  playPickup() { if (COIN_DASH.sounds[this.choice()]) this.play(COIN_DASH.pickupSound); }
};
['pointerdown', 'keydown'].forEach(type => window.addEventListener(type, () => sound.unlock()));
const soundSelect = document.getElementById('sound');
if (soundSelect) {
  Object.keys(COIN_DASH.sounds).forEach(name => soundSelect.add(new Option(name, name)));
  soundSelect.value = COIN_DASH.defaultSound;
  soundSelect.addEventListener('change', () => { soundSelect.blur(); sound.playChoice(); });
}

class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    this.score = 0;
    this.finished = false;
    // The registry outlives scene restarts, so the chosen difficulty sticks.
    this.difficulty = c.difficulties[this.registry.get('difficulty') || c.defaultDifficulty];
    this.deadline = this.time.now + c.roundSeconds * 1000;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.endPanel = null;
    this.endText = null;
    this.grid = this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace' });
    this.player = this.add.rectangle(c.width / 2, c.height / 2, 24, 24);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < c.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * 270, 100, 26, 26);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      const speed = c.droneSpeed * this.difficulty.speed;
      drone.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      sound.playPickup();
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => {
      if (!this.finished) sound.playChoice();
      this.finish('A drone caught you!');
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-ONE', () => this.setDifficulty('easy'));
    this.input.keyboard.on('keydown-TWO', () => this.setDifficulty('medium'));
    this.input.keyboard.on('keydown-THREE', () => this.setDifficulty('hard'));
    this.input.keyboard.on('keydown-FOUR', () => this.setDifficulty('maxhard'));
    this.applyTheme();
  }

  setDifficulty(key) {
    this.registry.set('difficulty', key);
    this.scene.restart();
  }

  // Restyle everything already on screen; safe to call at any point in a round.
  applyTheme() {
    const t = theme();
    this.cameras.main.setBackgroundColor(t.background);
    this.grid.setFillStyle(t.background, 1).setOutlineStyle(t.grid, t.gridAlpha);
    this.hud.setColor(t.text);
    // A thin outline keeps the shapes distinct on both the dark and the light background.
    this.player.setFillStyle(t.player).setStrokeStyle(2, t.outline);
    this.coin.setFillStyle(t.coin).setStrokeStyle(2, t.outline);
    this.drones.getChildren().forEach(drone => drone.setFillStyle(t.drone).setStrokeStyle(2, t.outline));
    if (this.endPanel) this.endPanel.setFillStyle(t.panel, t.panelAlpha).setStrokeStyle(2, t.grid);
    if (this.endText) this.endText.setColor(t.text);
  }

  placeCoin() {
    const c = COIN_DASH;
    // Avoid spawning the next coin directly underneath the player.
    let x, y;
    do {
      x = Phaser.Math.Between(25, c.width - 25);
      y = Phaser.Math.Between(70, c.height - 25);
    } while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 60);
    this.coin.setPosition(x, y);
    this.coin.body.reset(x, y);
  }

  update() {
    if (this.finished) return;
    const dx = Number(this.cursors.right.isDown || this.keys.D.isDown)
      - Number(this.cursors.left.isDown || this.keys.A.isDown);
    const dy = Number(this.cursors.down.isDown || this.keys.S.isDown)
      - Number(this.cursors.up.isDown || this.keys.W.isDown);
    const direction = new Phaser.Math.Vector2(dx, dy).normalize()
      .scale(COIN_DASH.playerSpeed * this.difficulty.speed);
    this.player.body.setVelocity(direction.x, direction.y);
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}          ${this.difficulty.label.padEnd(8)}          Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const c = COIN_DASH;
    this.endPanel = this.add.rectangle(c.width / 2, c.height / 2, 460, 150);
    this.endText = this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
    this.applyTheme();
  }
}

// Theme: restore the saved choice (storage may be unavailable, e.g. in a private window).
function setTheme(name) {
  COIN_DASH.theme = COIN_DASH.themes[name] ? name : COIN_DASH.defaultTheme;
  document.documentElement.dataset.theme = COIN_DASH.theme;
  const other = COIN_DASH.theme === 'dark' ? 'light' : 'dark';
  const button = document.getElementById('theme-toggle');
  button.textContent = other === 'dark' ? 'Dark mode' : 'Light mode';
  button.setAttribute('aria-label', `Switch to ${other} mode`);
  try { localStorage.setItem(THEME_KEY, COIN_DASH.theme); } catch (e) { /* not saved */ }
  const scene = window.coinDashGame && window.coinDashGame.scene.getScene('CoinDash');
  if (scene && scene.sys.isActive()) scene.applyTheme();
}
let savedTheme = null;
try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* use the default */ }
setTheme(savedTheme);
const themeButton = document.getElementById('theme-toggle');
// Keep keyboard focus off the button on mouse clicks so the game keys behave as before.
themeButton.addEventListener('mousedown', event => event.preventDefault());
themeButton.addEventListener('click', () => {
  setTheme(COIN_DASH.theme === 'dark' ? 'light' : 'dark');
  if (themeButton.matches(':focus:not(:focus-visible)')) themeButton.blur();
});

window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: theme().background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: CoinDash
});
