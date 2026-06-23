/**
 * main.js
 * Phaser 3 konfiguration og spilstart for Motherfuga Catch.
 */

(function () {
  'use strict';

  if (typeof Phaser === 'undefined') {
    if (typeof showError === 'function') {
      showError('Phaser kunne ikke indlæses. Tjek at lib/phaser.min.js findes.');
    }
    return;
  }

  const phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GameConfig.WIDTH,
    height: GameConfig.HEIGHT,
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      PreloadScene,
      MenuScene,
      GameScene,
      GameOverScene
    ],
    input: {
      activePointers: 3
    },
    render: {
      antialias: true,
      pixelArt: false
    }
  };

  try {
    window.game = new Phaser.Game(phaserConfig);

    window.addEventListener('resize', function () {
      if (window.game && window.game.scale) {
        window.game.scale.refresh();
      }
    });
  } catch (err) {
    if (typeof showError === 'function') {
      showError('Fejl ved opstart: ' + err.message);
    }
  }
})();