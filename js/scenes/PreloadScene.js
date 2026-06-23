/**
 * PreloadScene.js
 * Indlæser indlejrede billeder (virker på mobil uden server).
 */
class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const { WIDTH, HEIGHT } = GameConfig;
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.loadingText = this.add.text(cx, cy - 20, 'Indlæser...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.progressBarBg = this.add.rectangle(cx, cy + 20, 220, 10, 0x333333);
    this.progressBar = this.add.rectangle(cx - 110, cy + 20, 0, 8, 0x00cc66).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      this.progressBar.width = 220 * value;
      this.progressBar.x = cx - 110;
    });

    // Indlæs fra indlejrede base64-data (ingen ekstern server nødvendig)
    this.load.image('background', EmbeddedAssets.background);
    this.load.image('gameBackground', EmbeddedAssets.gameBackground);
    this.load.image('logo', EmbeddedAssets.logo);
    this.load.image('van', EmbeddedAssets.van);
    this.load.image('garanti', EmbeddedAssets.garanti);
    this.load.image('dansk', EmbeddedAssets.dansk);
    this.load.image('losLedning', EmbeddedAssets.losLedning);
  }

  create() {
    this.generateStikkontaktTexture();
    this.generateAfbryderTexture();
    this.generateParticleTexture();
    this.scene.start('MenuScene');
  }

  generateStikkontaktTexture() {
    const size = 128;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(20, 20, 88, 88, 10);
    g.lineStyle(3, 0xcccccc, 1);
    g.strokeRoundedRect(20, 20, 88, 88, 10);
    g.fillStyle(0x1a1a1a, 1);
    g.fillCircle(50, 54, 9);
    g.fillCircle(78, 54, 9);
    g.fillRoundedRect(62, 78, 8, 12, 2);
    g.generateTexture('stikkontakt', size, size);
    g.destroy();
  }

  generateAfbryderTexture() {
    const size = 128;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(20, 20, 88, 88, 10);
    g.lineStyle(3, 0xcccccc, 1);
    g.strokeRoundedRect(20, 20, 88, 88, 10);
    g.fillStyle(0x1a1a1a, 1);
    g.fillRoundedRect(54, 38, 20, 52, 4);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(58, 42, 12, 22, 3);
    g.generateTexture('afbryder', size, size);
    g.destroy();
  }

  generateParticleTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture('particle', 16, 16);
    g.destroy();
  }
}