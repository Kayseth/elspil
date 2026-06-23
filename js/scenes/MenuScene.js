/**
 * MenuScene.js
 * Startskærm – baggrunden viser point-reglerne, ingen overlay-tekst.
 */
class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { WIDTH, HEIGHT } = GameConfig;
    const cx = WIDTH / 2;

    const bg = this.add.image(cx, HEIGHT / 2, 'background');
    bg.setDisplaySize(WIDTH, HEIGHT);
    bg.setDepth(0);

    const { logo } = GameConfig.createLogo(this, cx, GameConfig.LOGO.menuY, 2);
    const logoBottom = GameConfig.LOGO.menuY + logo.displayHeight / 2;

    const titleY = logoBottom + 20;
    const title = this.add.text(cx, titleY, 'MOTHERFUGA\nCATCH', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '34px',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 4,
      stroke: '#000000',
      strokeThickness: 5,
      wordWrap: { width: WIDTH - 40, useAdvancedWrap: true }
    }).setOrigin(0.5, 0).setDepth(2);

    const titleBottom = titleY + title.height;
    const highscore = GameConfig.getHighscore();

    this.add.text(cx, titleBottom + 14, `Highscore: ${highscore}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#ffcc00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(2);

    this.createButton(cx, HEIGHT - 100, 'START', () => {
      AudioSynth.init();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('GameScene');
      });
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createButton(x, y, label, onClick) {
    const btnW = 200;
    const btnH = 56;
    const container = this.add.container(x, y).setDepth(4);

    const bg = this.add.rectangle(0, 0, btnW, btnH, 0xffffff, 1)
      .setStrokeStyle(3, 0xcccccc);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '28px',
      color: '#0a0a0a'
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(btnW, btnH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.setFillStyle(0xffcc00);
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0xffffff);
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick
      });
    });

    return container;
  }
}