import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';

export class MenuScene extends Phaser.Scene {
  private _selectedLevel: number = 1;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    this.add.text(cx, 80, 'TableRush', {
      fontSize: '48px',
      color: '#ff8844',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 130, 'Kitchen Chaos', {
      fontSize: '24px',
      color: '#ffcc88',
    }).setOrigin(0.5);

    // Level select
    this.add.text(cx, 200, 'Select Level:', {
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const levelText = this.add.text(cx, 240, `Level ${this._selectedLevel}`, {
      fontSize: '24px',
      color: '#44aaff',
    }).setOrigin(0.5);

    // Level arrows
    const leftArrow = this.add.text(cx - 80, 240, '<', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const rightArrow = this.add.text(cx + 80, 240, '>', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leftArrow.on('pointerdown', () => {
      this._selectedLevel = Math.max(1, this._selectedLevel - 1);
      levelText.setText(`Level ${this._selectedLevel}`);
    });

    rightArrow.on('pointerdown', () => {
      this._selectedLevel = Math.min(5, this._selectedLevel + 1);
      levelText.setText(`Level ${this._selectedLevel}`);
    });

    // Start button
    const startBtn = this.add.rectangle(cx, 320, 200, 50, 0x44aa44);
    startBtn.setStrokeStyle(2, 0x66cc66);
    startBtn.setInteractive({ useHandCursor: true });

    this.add.text(cx, 320, 'Start Game', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { level: this._selectedLevel });
    });

    startBtn.on('pointerover', () => startBtn.fillColor = 0x55bb55);
    startBtn.on('pointerout', () => startBtn.fillColor = 0x44aa44);

    // Controls
    this.add.text(cx, 420, 'Controls:', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    const controls = [
      'WASD / Arrow Keys — Move',
      'Space / E — Interact',
      'X / Q — Drop item',
    ];

    controls.forEach((line, i) => {
      this.add.text(cx, 450 + i * 25, line, {
        fontSize: '14px',
        color: '#888888',
      }).setOrigin(0.5);
    });

    // Keyboard support
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-ENTER', () => {
        this.scene.start('GameScene', { level: this._selectedLevel });
      });
      this.input.keyboard.on('keydown-LEFT', () => {
        this._selectedLevel = Math.max(1, this._selectedLevel - 1);
        levelText.setText(`Level ${this._selectedLevel}`);
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        this._selectedLevel = Math.min(5, this._selectedLevel + 1);
        levelText.setText(`Level ${this._selectedLevel}`);
      });
    }
  }
}
