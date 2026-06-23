/**
 * GameScene.js
 * Hovedspilscene – varebil, faldende objekter, scoring og kollision.
 */
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.score = 0;
    this.elapsedMs = 0;
    this.isGameOver = false;
    this.setupBackground();
    this.setupHUD();
    this.setupPlayer();
    this.setupFallingItems();
    this.setupInput();
    this.setupSpawnTimer();

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  setupBackground() {
    const { WIDTH, HEIGHT } = GameConfig;
    this.cameras.main.setBackgroundColor('#000000');
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'gameBackground');
    bg.setDisplaySize(WIDTH, HEIGHT);
    bg.setDepth(0);
  }

  setupHUD() {
    const { WIDTH, LOGO } = GameConfig;
    const cx = WIDTH / 2;
    const hudY = 128;
    const columnGap = 58;

    GameConfig.createLogo(this, cx, LOGO.y, 100);

    const numberStyle = {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '46px',
      fontStyle: 'bold',
      color: '#ffffff'
    };

    const labelStyle = {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    };

    this.timeValue = this.add.text(cx - columnGap, hudY, String(GameConfig.GAME_DURATION), numberStyle)
      .setOrigin(0.5)
      .setDepth(100);

    this.scoreValue = this.add.text(cx + columnGap, hudY, '0', numberStyle)
      .setOrigin(0.5)
      .setDepth(100);

    this.add.text(cx - columnGap, hudY + 30, 'Time', labelStyle)
      .setOrigin(0.5)
      .setDepth(100);

    this.add.text(cx + columnGap, hudY + 30, 'Points', labelStyle)
      .setOrigin(0.5)
      .setDepth(100);

    const divider = this.add.graphics().setDepth(100);
    divider.lineStyle(1.5, 0xffffff, 0.9);
    divider.beginPath();
    divider.moveTo(cx, hudY - 22);
    divider.lineTo(cx, hudY + 22);
    divider.strokePath();
  }

  setupPlayer() {
    const { WIDTH, HEIGHT, VAN } = GameConfig;

    this.player = this.add.sprite(WIDTH / 2, 0, 'van');
    GameConfig.scaleVan(this.player);
    this.player.y = HEIGHT - VAN.bottomMargin - this.player.displayHeight / 2;
    this.player.setDepth(10);
  }

  setupFallingItems() {
    this.fallingItems = this.add.group({ maxSize: 30 });
  }

  setupInput() {
    this.input.addPointer(2);

    const followPointer = (pointer) => {
      if (this.isGameOver || !pointer.isDown) return;
      this.movePlayerToPointer(pointer);
    };

    this.input.on('pointerdown', followPointer);
    this.input.on('pointermove', followPointer);
  }

  movePlayerToPointer(pointer) {
    const gameX = this.getPointerGameX(pointer);
    const halfW = this.player.displayWidth / 2;
    this.player.x = Phaser.Math.Clamp(
      gameX,
      halfW,
      GameConfig.WIDTH - halfW
    );
  }

  getPointerGameX(pointer) {
    if (typeof pointer.worldX === 'number' && !isNaN(pointer.worldX)) {
      return pointer.worldX;
    }
    const cam = this.cameras.main;
    return (pointer.x - cam.scrollX) / cam.zoom;
  }

  /**
   * Fang-zone oven på varebilen – bruger display-pixels, ikke physics body.
   */
  getCatchZone() {
    const van = this.player;
    return {
      left: van.x - van.displayWidth * 0.5,
      right: van.x + van.displayWidth * 0.5,
      top: van.y - van.displayHeight * 0.7,
      bottom: van.y + van.displayHeight * 0.2
    };
  }

  itemHitsCatchZone(item) {
    const zone = this.getCatchZone();
    const radius = GameConfig.ITEM_SIZE * 0.48;

    return (
      item.x + radius > zone.left &&
      item.x - radius < zone.right &&
      item.y + radius > zone.top &&
      item.y - radius < zone.bottom
    );
  }

  setupSpawnTimer() {
    this.scheduleNextSpawn();
  }

  scheduleNextSpawn() {
    if (this.isGameOver) return;

    const delay = Phaser.Math.Between(GameConfig.SPAWN_MIN, GameConfig.SPAWN_MAX);
    this.spawnTimer = this.time.delayedCall(delay, () => {
      this.spawnItem();
      this.scheduleNextSpawn();
    });
  }

  spawnItem() {
    if (this.isGameOver) return;

    const itemKey = GameConfig.pickRandomItem();
    const itemData = GameConfig.ITEMS[itemKey];
    const margin = 36;
    const x = Phaser.Math.Between(margin, GameConfig.WIDTH - margin);
    const y = GameConfig.HUD_HEIGHT - 20;

    let item = this.fallingItems.getFirstDead(false);

    if (!item) {
      if (this.fallingItems.getLength() >= 30) return;
      item = this.add.sprite(x, y, itemData.texture);
      this.fallingItems.add(item);
    } else {
      item.setPosition(x, y);
      item.setTexture(itemData.texture);
    }
    item.setActive(true).setVisible(true);
    item.itemKey = itemKey;
    item.itemData = itemData;
    item.setDisplaySize(GameConfig.ITEM_SIZE, GameConfig.ITEM_SIZE);
    item.setDepth(5);
    item.setAlpha(1);
    item.clearTint();

    item.setAngle(Phaser.Math.Between(-12, 12));
    this.tweens.add({
      targets: item,
      angle: item.angle + Phaser.Math.Between(-20, 20),
      duration: 2000,
      ease: 'Linear'
    });
  }

  collectItem(item) {
    const points = item.itemData.points;

    this.score += points;
    this.scoreValue.setText(String(this.score));

    if (item.itemKey === 'dansk') {
      AudioSynth.playReward();
    } else {
      AudioSynth.playDing();
    }

    this.emitCollectParticles(item.x, item.y, item.itemKey);
    this.showFloatingText(item.x, item.y, `+${points}`);
    this.recycleItem(item);
  }

  emitCollectParticles(x, y, itemKey) {
    const colors = {
      stikkontakt: 0xffffff,
      afbryder: 0xffffff,
      garanti: 0x4caf50,
      dansk: 0xff4444
    };

    const color = colors[itemKey] || 0xffffff;

    const emitter = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 180 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: color,
      emitting: false
    }).setDepth(50);

    emitter.explode(12);
    this.time.delayedCall(600, () => emitter.destroy());
  }

  showFloatingText(x, y, text) {
    const floatText = this.add.text(x, y - 20, text, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: floatText,
      y: y - 80,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatText.destroy()
    });
  }

  endGame(reason, item) {
    if (this.isGameOver) return;
    this.isGameOver = true;

    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    if (item) {
      this.recycleItem(item);
    }

    if (reason === 'danger') {
      AudioSynth.playShortCircuit();
      this.cameras.main.shake(400, 0.02);
      this.cameras.main.flash(200, 255, 255, 100);
    }

    const highscore = GameConfig.saveHighscore(this.score);
    const delay = reason === 'danger' ? 800 : 500;

    this.time.delayedCall(delay, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(400, () => {
        this.scene.start('GameOverScene', {
          score: this.score,
          reason,
          highscore
        });
      });
    });
  }

  recycleItem(item) {
    this.tweens.killTweensOf(item);
    item.setActive(false).setVisible(false);
  }

  update(_time, delta) {
    if (this.isGameOver) return;

    const ptr = this.input.activePointer;
    if (ptr.isDown) {
      this.movePlayerToPointer(ptr);
    }

    this.elapsedMs += delta;
    const elapsedSec = this.elapsedMs / 1000;
    const remaining = Math.max(0, GameConfig.GAME_DURATION - elapsedSec);
    this.timeValue.setText(String(Math.ceil(remaining)));

    if (remaining <= 0) {
      this.endGame('timeup');
      return;
    }

    const multiplier = GameConfig.getSpeedMultiplier(elapsedSec);
    const speed = GameConfig.BASE_FALL_SPEED * multiplier;
    const dt = delta / 1000;

    const items = this.fallingItems.getChildren();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.active) continue;

      item.y += speed * dt;

      if (this.itemHitsCatchZone(item)) {
        if (item.itemData.danger) {
          this.endGame('danger', item);
          return;
        }
        this.collectItem(item);
        continue;
      }

      if (item.y > GameConfig.HEIGHT + 50) {
        this.recycleItem(item);
      }
    }
  }
}