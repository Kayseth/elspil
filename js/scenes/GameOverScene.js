/**
 * GameOverScene.js
 * Slutskærm med score, leaderboard og SPIL IGEN.
 */
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.reason = data.reason || 'timeup';
  }

  create() {
    const { WIDTH, HEIGHT } = GameConfig;
    const cx = WIDTH / 2;
    const isDanger = this.reason === 'danger';

    this.cameras.main.setBackgroundColor('#000000');
    this.add.rectangle(cx, HEIGHT / 2, WIDTH, HEIGHT, 0x000000).setDepth(0);

    const titleText = isDanger ? 'GAME OVER' : 'Tiden er gået';
    const titleColor = isDanger ? '#ff4444' : '#ffffff';

    this.add.text(cx, 120, titleText, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: isDanger ? '42px' : '36px',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(2);

    this.add.text(cx, 185, `Din score: ${this.finalScore}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);

    this.add.text(cx, 250, 'Leaderboard', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#ffcc00'
    }).setOrigin(0.5).setDepth(2);

    const board = GameConfig.generateLeaderboard(this.finalScore);
    const startY = 290;
    const lineHeight = 34;

    board.forEach((entry, index) => {
      const rank = index + 1;
      const isPlayer = entry.isPlayer;
      const row = `${rank}. ${entry.name}`.padEnd(16, ' ') + entry.score;

      this.add.text(cx, startY + index * lineHeight, row, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: isPlayer ? '#ffcc00' : '#ffffff',
        fontStyle: isPlayer ? 'bold' : 'normal'
      }).setOrigin(0.5).setDepth(2);
    });

    this.createButton(cx, HEIGHT - 90, 'SPIL IGEN', () => {
      AudioSynth.init();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createButton(x, y, label, onClick) {
    const btnW = 220;
    const btnH = 56;
    const container = this.add.container(x, y).setDepth(3);

    const bg = this.add.rectangle(0, 0, btnW, btnH, 0xffffff, 1)
      .setStrokeStyle(3, 0xcccccc);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '24px',
      color: '#0a0a0a'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(btnW, btnH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => bg.setFillStyle(0xffcc00));
    container.on('pointerout', () => bg.setFillStyle(0xffffff));
    container.on('pointerdown', onClick);

    return container;
  }
}