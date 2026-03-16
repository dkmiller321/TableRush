import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';

interface ResultData {
  level: number;
  score: number;
  ordersCompleted: number;
  ordersFailed: number;
  totalTips: number;
  stars: number;
}

export class ResultScene extends Phaser.Scene {
  private _data!: ResultData;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: ResultData): void {
    this._data = data;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    this.add.text(cx, 50, 'Service Complete!', {
      fontSize: '32px',
      color: '#ff8844',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 100, `Level ${this._data.level}`, {
      fontSize: '20px',
      color: '#ffcc88',
    }).setOrigin(0.5);

    // Stars
    const starStr = '★'.repeat(this._data.stars) + '☆'.repeat(3 - this._data.stars);
    this.add.text(cx, 145, starStr, {
      fontSize: '36px',
      color: '#ffdd44',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `Total Score: ${this._data.score}`,
      `Orders Completed: ${this._data.ordersCompleted}`,
      `Orders Failed: ${this._data.ordersFailed}`,
      `Total Tips: $${this._data.totalTips}`,
    ];

    stats.forEach((line, i) => {
      this.add.text(cx, 200 + i * 30, line, {
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5);
    });

    // Buttons
    const retryBtn = this.add.rectangle(cx - 110, 380, 180, 45, 0xaa4444)
      .setStrokeStyle(2, 0xcc6666).setInteractive({ useHandCursor: true });
    this.add.text(cx - 110, 380, 'Retry', {
      fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { level: this._data.level });
    });
    retryBtn.on('pointerover', () => retryBtn.fillColor = 0xbb5555);
    retryBtn.on('pointerout', () => retryBtn.fillColor = 0xaa4444);

    if (this._data.level < 5) {
      const nextBtn = this.add.rectangle(cx + 110, 380, 180, 45, 0x44aa44)
        .setStrokeStyle(2, 0x66cc66).setInteractive({ useHandCursor: true });
      this.add.text(cx + 110, 380, 'Next Level', {
        fontSize: '18px', color: '#ffffff',
      }).setOrigin(0.5);

      nextBtn.on('pointerdown', () => {
        this.scene.start('GameScene', { level: this._data.level + 1 });
      });
      nextBtn.on('pointerover', () => nextBtn.fillColor = 0x55bb55);
      nextBtn.on('pointerout', () => nextBtn.fillColor = 0x44aa44);
    }

    const menuBtn = this.add.rectangle(cx, 440, 180, 40, 0x444488)
      .setStrokeStyle(2, 0x6666aa).setInteractive({ useHandCursor: true });
    this.add.text(cx, 440, 'Main Menu', {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5);

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    menuBtn.on('pointerover', () => menuBtn.fillColor = 0x555599);
    menuBtn.on('pointerout', () => menuBtn.fillColor = 0x444488);

    // Keyboard
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-R', () => {
        this.scene.start('GameScene', { level: this._data.level });
      });
      this.input.keyboard.on('keydown-ENTER', () => {
        if (this._data.level < 5) {
          this.scene.start('GameScene', { level: this._data.level + 1 });
        }
      });
      this.input.keyboard.on('keydown-ESC', () => {
        this.scene.start('MenuScene');
      });
    }
  }
}
