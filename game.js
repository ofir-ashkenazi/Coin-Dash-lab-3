/* global Phaser, COIN_DASH */

// The player's chosen shape and colour live in the game registry so they survive restarts.
function playerChoice(scene) {
  const c = COIN_DASH;
  return scene.registry.get('playerChoice')
    || { shape: c.playerShapes[0], color: c.playerColors[0].name };
}

function colorValue(name) {
  const entry = COIN_DASH.playerColors.find(color => color.name === name);
  return (entry || COIN_DASH.playerColors[0]).value;
}

// Draws a player shape into a cached texture of the given pixel size and returns its key.
function playerTexture(scene, shape, colorName, size) {
  const key = `player-${shape}-${colorName}-${size}`;
  if (scene.textures.exists(key)) return key;
  const s = size;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  g.fillStyle(colorValue(colorName), 1);
  if (shape === 'triangle') {
    g.fillTriangle(s / 2, s * 0.04, s * 0.96, s * 0.92, s * 0.04, s * 0.92);
  } else if (shape === 'heart') {
    g.fillCircle(s * 0.28, s * 0.32, s * 0.26);
    g.fillCircle(s * 0.72, s * 0.32, s * 0.26);
    g.fillTriangle(s * 0.03, s * 0.4, s * 0.97, s * 0.4, s / 2, s * 0.95);
  } else if (shape === 'star') {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? s * 0.48 : s * 0.2;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      points.push({ x: s / 2 + Math.cos(angle) * radius, y: s * 0.53 + Math.sin(angle) * radius });
    }
    g.fillPoints(points, true);
  } else {
    g.fillRect(s * 0.04, s * 0.04, s * 0.92, s * 0.92);
  }
  g.generateTexture(key, s, s);
  g.destroy();
  return key;
}

class StartScreen extends Phaser.Scene {
  constructor() { super('StartScreen'); }

  create() {
    const c = COIN_DASH;
    const choice = playerChoice(this);
    this.shapeIndex = Math.max(0, c.playerShapes.indexOf(choice.shape));
    this.colorIndex = Math.max(0, c.playerColors.findIndex(color => color.name === choice.color));
    this.row = 0; // 0 = shape row, 1 = colour row
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.add.text(c.width / 2, 42, 'Choose your player', { font: 'bold 30px monospace', color: '#ffffff' })
      .setOrigin(0.5);

    this.rowLabels = [
      this.add.text(40, 92, '', { font: '18px monospace', color: '#ffffff' }),
      this.add.text(40, 252, '', { font: '18px monospace', color: '#ffffff' })
    ];
    this.shapeCards = c.playerShapes.map((shape, i) => {
      const card = this.makeCard(100 + i * 115, 175, shape, () => { this.row = 0; this.shapeIndex = i; });
      card.icon = this.add.image(card.box.x, card.box.y - 8, playerTexture(this, shape, choice.color, 44));
      return card;
    });
    this.colorCards = c.playerColors.map((color, i) => {
      const card = this.makeCard(100 + i * 115, 335, color.name, () => { this.row = 1; this.colorIndex = i; });
      card.icon = this.add.circle(card.box.x, card.box.y - 8, 20, color.value);
      return card;
    });

    this.add.rectangle(650, 230, 220, 250, 0x0a1120, 0.85).setStrokeStyle(2, 0x34445e);
    this.add.text(650, 128, 'Preview', { font: '18px monospace', color: '#71e8ce' }).setOrigin(0.5);
    this.preview = this.add.image(650, 225, playerTexture(this, choice.shape, choice.color, 110));
    this.previewLabel = this.add.text(650, 318, '', { font: '18px monospace', color: '#ffffff' }).setOrigin(0.5);

    this.startButton = this.add.rectangle(650, 410, 220, 56, 0x71e8ce)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startButton.setFillStyle(0xa6f3e2))
      .on('pointerout', () => this.startButton.setFillStyle(0x71e8ce))
      .on('pointerdown', () => this.startRound());
    this.add.text(650, 410, 'START', { font: 'bold 24px monospace', color: '#0a1120' }).setOrigin(0.5);
    this.add.text(c.width / 2, 470,
      '←/→ or A/D: choose · ↑/↓ or W/S: switch row · Enter/Space: start',
      { font: '15px monospace', color: '#9fb0c8' }).setOrigin(0.5);

    const keyboard = this.input.keyboard;
    keyboard.addCapture('UP,DOWN,LEFT,RIGHT,SPACE');
    // Phaser can hand the same browser key event to listeners more than once when several keys
    // arrive within one frame, so each event is acted on only once.
    const handled = new WeakSet();
    const onKey = (name, action) => keyboard.on(`keydown-${name}`, event => {
      if (handled.has(event)) return;
      handled.add(event);
      action();
    });
    const step = delta => {
      if (this.row === 0) this.shapeIndex = Phaser.Math.Wrap(this.shapeIndex + delta, 0, c.playerShapes.length);
      else this.colorIndex = Phaser.Math.Wrap(this.colorIndex + delta, 0, c.playerColors.length);
      this.refresh();
    };
    const switchRow = () => { this.row = 1 - this.row; this.refresh(); };
    ['LEFT', 'A'].forEach(name => onKey(name, () => step(-1)));
    ['RIGHT', 'D'].forEach(name => onKey(name, () => step(1)));
    ['UP', 'W', 'DOWN', 'S'].forEach(name => onKey(name, switchRow));
    ['ENTER', 'SPACE'].forEach(name => onKey(name, () => this.startRound()));
    this.refresh();
  }

  makeCard(x, y, label, select) {
    const box = this.add.rectangle(x, y, 100, 110, 0x0a1120, 0.85)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => { select(); this.refresh(); });
    const text = this.add.text(x, y + 38, label, { font: '15px monospace', color: '#e5edf7' }).setOrigin(0.5);
    return { box, text };
  }

  refresh() {
    const c = COIN_DASH;
    const shape = c.playerShapes[this.shapeIndex];
    const color = c.playerColors[this.colorIndex].name;
    ['Shape', 'Colour'].forEach((name, i) => {
      const focused = this.row === i;
      this.rowLabels[i].setText(`${focused ? '▶ ' : '  '}${name}`).setColor(focused ? '#71e8ce' : '#9fb0c8');
    });
    const highlight = (cards, selected, rowFocused) => cards.forEach((card, i) => {
      const isSelected = i === selected;
      card.box.setStrokeStyle(isSelected ? 4 : 2, isSelected ? (rowFocused ? 0x71e8ce : 0xffffff) : 0x34445e);
      card.box.setFillStyle(isSelected ? 0x1d2c45 : 0x0a1120, 0.85);
      card.text.setColor(isSelected ? '#ffffff' : '#9fb0c8');
    });
    highlight(this.shapeCards, this.shapeIndex, this.row === 0);
    highlight(this.colorCards, this.colorIndex, this.row === 1);
    // Shape icons are drawn in the current colour so every option doubles as a preview.
    this.shapeCards.forEach((card, i) => card.icon.setTexture(playerTexture(this, c.playerShapes[i], color, 44)));
    this.preview.setTexture(playerTexture(this, shape, color, 110));
    this.previewLabel.setText(`${color} ${shape}`);
  }

  startRound() {
    const c = COIN_DASH;
    this.registry.set('playerChoice', {
      shape: c.playerShapes[this.shapeIndex],
      color: c.playerColors[this.colorIndex].name
    });
    this.scene.start('CoinDash');
  }
}

class CoinDash extends Phaser.Scene {
  constructor() { super('CoinDash'); }

  create() {
    const c = COIN_DASH;
    const choice = playerChoice(this);
    this.score = 0;
    this.finished = false;
    // The deadline is set on the first update: this scene's clock is stale until then, and using it
    // here would count the time spent on the start screen against the round.
    this.deadline = null;
    this.physics.world.setBounds(0, 44, c.width, c.height - 44);
    this.add.grid(c.width / 2, c.height / 2, c.width, c.height, 40, 40,
      c.colors.background, 1, 0x24334b, 0.45);
    this.hud = this.add.text(18, 12, '', { font: '18px monospace', color: '#ffffff' });
    const size = c.playerSize;
    this.player = this.physics.add.image(c.width / 2, c.height / 2,
      playerTexture(this, choice.shape, choice.color, size));
    // The square uses its full outline; other shapes use a circle that fits inside the drawing,
    // so a drone has to touch the visible shape rather than an empty corner of the texture.
    if (choice.shape === 'square') this.player.body.setSize(size * 0.92, size * 0.92, true);
    else this.player.body.setCircle(size * 0.4, size * 0.1, size * 0.12);
    this.player.body.setCollideWorldBounds(true);
    this.coin = this.add.circle(100, 100, 9, c.colors.coin);
    this.physics.add.existing(this.coin);
    this.coin.body.setCircle(9);
    this.placeCoin();
    this.drones = this.physics.add.group();
    for (let i = 0; i < c.droneCount; i++) {
      const drone = this.add.rectangle(90 + i * 270, 100, 26, 26, c.colors.drone);
      this.drones.add(drone);
      drone.body.setCollideWorldBounds(true).setBounce(1, 1);
      const angle = (35 + i * 105) * Math.PI / 180;
      drone.body.setVelocity(Math.cos(angle) * c.droneSpeed, Math.sin(angle) * c.droneSpeed);
    }
    this.physics.add.overlap(this.player, this.coin, () => {
      if (this.finished) return;
      this.score++;
      this.placeCoin();
    });
    this.physics.add.overlap(this.player, this.drones, () => this.finish('A drone caught you!'));
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,R,M');
    this.input.keyboard.on('keydown-R', () => this.scene.restart());
    this.input.keyboard.on('keydown-M', () => { if (this.finished) this.scene.start('StartScreen'); });
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
    const direction = new Phaser.Math.Vector2(dx, dy).normalize().scale(COIN_DASH.playerSpeed);
    this.player.body.setVelocity(direction.x, direction.y);
    if (this.deadline === null) this.deadline = this.time.now + COIN_DASH.roundSeconds * 1000;
    const seconds = Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    this.hud.setText(`Coins: ${this.score}                       Time: ${seconds}s`);
    if (seconds === 0) this.finish('Time is up!');
  }

  finish(reason) {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    const c = COIN_DASH;
    this.add.rectangle(c.width / 2, c.height / 2, 460, 190, 0x0a1120, 0.95);
    this.add.text(c.width / 2, c.height / 2,
      `${reason}\n${this.score} coins collected\nPress R to try again\nPress M to change player`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }
    ).setOrigin(0.5);
  }
}
window.coinDashGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: COIN_DASH.width,
  height: COIN_DASH.height,
  backgroundColor: COIN_DASH.colors.background,
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_HORIZONTALLY },
  scene: [StartScreen, CoinDash]
});
