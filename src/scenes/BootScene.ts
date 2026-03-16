import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Loading bar
    const progressBar = this.add.rectangle(cx, cy + 40, 0, 20, 0x44aaff);
    const progressBox = this.add.rectangle(cx, cy + 40, 320, 24, 0x222244);
    progressBox.setStrokeStyle(2, 0x4488ff);

    this.add.text(cx, cy - 20, 'TableRush: Kitchen Chaos', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const loadText = this.add.text(cx, cy + 70, 'Loading...', {
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.width = 300 * value;
    });

    this.load.on('complete', () => {
      loadText.setText('Ready!');
    });

    // Create a 1x1 white pixel texture for use as placeholder sprites
    const canvas = this.textures.createCanvas('__DEFAULT', 1, 1);
    if (canvas) {
      const ctx = canvas.getContext();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1, 1);
      canvas.refresh();
    }
  }

  create(): void {
    this.scene.start('MenuScene');
  }
}
