import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config';

export class MenuScene extends Phaser.Scene {
  private _selectedLevel: number = 1;
  private _settingsPanel!: Phaser.GameObjects.Group;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // Initialize registry defaults if not already set
    if (this.registry.get('sfxEnabled') === undefined) {
      this.registry.set('sfxEnabled', true);
    }
    if (this.registry.get('musicEnabled') === undefined) {
      this.registry.set('musicEnabled', true);
    }

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

    // Settings button
    const settingsBtn = this.add.rectangle(cx, 380, 200, 50, 0x4466aa);
    settingsBtn.setStrokeStyle(2, 0x5588cc);
    settingsBtn.setInteractive({ useHandCursor: true });

    this.add.text(cx, 380, 'Settings', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    settingsBtn.on('pointerover', () => settingsBtn.fillColor = 0x5577bb);
    settingsBtn.on('pointerout', () => settingsBtn.fillColor = 0x4466aa);

    settingsBtn.on('pointerdown', () => {
      this._settingsPanel.setVisible(true);
    });

    // Controls
    this.add.text(cx, 460, 'Controls:', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    const controls = [
      'WASD / Arrow Keys — Move',
      'Space / E — Interact',
      'X / Q — Drop item',
    ];

    controls.forEach((line, i) => {
      this.add.text(cx, 490 + i * 25, line, {
        fontSize: '14px',
        color: '#888888',
      }).setOrigin(0.5);
    });

    // Build settings panel (hidden by default)
    this._settingsPanel = this._createSettingsPanel(cx);

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

  private _createSettingsPanel(cx: number): Phaser.GameObjects.Group {
    const group = this.add.group();

    // Overlay background
    const overlay = this.add.rectangle(cx, GAME_HEIGHT / 2, 320, 260, 0x111122, 0.95);
    overlay.setStrokeStyle(2, 0x5588cc);
    group.add(overlay);

    // Title
    const title = this.add.text(cx, GAME_HEIGHT / 2 - 100, 'Settings', {
      fontSize: '28px',
      color: '#ff8844',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    group.add(title);

    // SFX toggle
    const sfxLabel = this.add.text(cx - 80, GAME_HEIGHT / 2 - 40, 'SFX:', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    group.add(sfxLabel);

    const sfxStatusText = this.registry.get('sfxEnabled') as boolean ? 'ON' : 'OFF';
    const sfxStatusColor = this.registry.get('sfxEnabled') as boolean ? '#44ff44' : '#ff4444';

    const sfxBtn = this.add.rectangle(cx + 60, GAME_HEIGHT / 2 - 40, 100, 36, 0x335533);
    sfxBtn.setStrokeStyle(2, 0x44aa44);
    sfxBtn.setInteractive({ useHandCursor: true });
    group.add(sfxBtn);

    const sfxText = this.add.text(cx + 60, GAME_HEIGHT / 2 - 40, sfxStatusText, {
      fontSize: '18px',
      color: sfxStatusColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    group.add(sfxText);

    sfxBtn.on('pointerover', () => sfxBtn.fillColor = 0x446644);
    sfxBtn.on('pointerout', () => sfxBtn.fillColor = 0x335533);

    sfxBtn.on('pointerdown', () => {
      const current = this.registry.get('sfxEnabled') as boolean;
      this.registry.set('sfxEnabled', !current);
      sfxText.setText(!current ? 'ON' : 'OFF');
      sfxText.setColor(!current ? '#44ff44' : '#ff4444');
    });

    // Music toggle
    const musicLabel = this.add.text(cx - 80, GAME_HEIGHT / 2 + 10, 'Music:', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);
    group.add(musicLabel);

    const musicStatusText = this.registry.get('musicEnabled') as boolean ? 'ON' : 'OFF';
    const musicStatusColor = this.registry.get('musicEnabled') as boolean ? '#44ff44' : '#ff4444';

    const musicBtn = this.add.rectangle(cx + 60, GAME_HEIGHT / 2 + 10, 100, 36, 0x335533);
    musicBtn.setStrokeStyle(2, 0x44aa44);
    musicBtn.setInteractive({ useHandCursor: true });
    group.add(musicBtn);

    const musicText = this.add.text(cx + 60, GAME_HEIGHT / 2 + 10, musicStatusText, {
      fontSize: '18px',
      color: musicStatusColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    group.add(musicText);

    musicBtn.on('pointerover', () => musicBtn.fillColor = 0x446644);
    musicBtn.on('pointerout', () => musicBtn.fillColor = 0x335533);

    musicBtn.on('pointerdown', () => {
      const current = this.registry.get('musicEnabled') as boolean;
      this.registry.set('musicEnabled', !current);
      musicText.setText(!current ? 'ON' : 'OFF');
      musicText.setColor(!current ? '#44ff44' : '#ff4444');
    });

    // Back button
    const backBtn = this.add.rectangle(cx, GAME_HEIGHT / 2 + 80, 140, 42, 0xaa4444);
    backBtn.setStrokeStyle(2, 0xcc6666);
    backBtn.setInteractive({ useHandCursor: true });
    group.add(backBtn);

    const backText = this.add.text(cx, GAME_HEIGHT / 2 + 80, 'Back', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);
    group.add(backText);

    backBtn.on('pointerover', () => backBtn.fillColor = 0xbb5555);
    backBtn.on('pointerout', () => backBtn.fillColor = 0xaa4444);

    backBtn.on('pointerdown', () => {
      group.setVisible(false);
    });

    // Start hidden
    group.setVisible(false);

    return group;
  }
}
