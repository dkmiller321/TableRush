import Phaser from 'phaser';

export class ScoreDisplay {
  private _scene: Phaser.Scene;
  private _scoreText: Phaser.GameObjects.Text;
  private _comboText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this._scene = scene;

    this._scoreText = scene.add.text(x, y, 'Score: 0', {
      fontSize: '14px',
      color: '#44ff44',
    }).setOrigin(1, 0);

    this._comboText = scene.add.text(x, y + 17, '', {
      fontSize: '12px',
      color: '#ffaa44',
    }).setOrigin(1, 0);
  }

  updateScore(score: number): void {
    this._scoreText.setText(`Score: ${score}`);

    // Brief scale-up tween on score change
    this._scene.tweens.add({
      targets: this._scoreText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  updateCombo(combo: number): void {
    if (combo > 1) {
      this._comboText.setText(`Combo x${combo}!`);
    } else {
      this._comboText.setText('');
    }
  }
}
