/**
 * BootScene.js
 * Første scene – sætter grundlæggende spilindstillinger op.
 */
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scale.on('resize', this.handleResize, this);
    this.scene.start('PreloadScene');
  }

  handleResize() {
    this.scale.refresh();
  }
}