import Phaser from 'phaser';

export class TipPopup {
  static show(scene: Phaser.Scene, x: number, y: number, amount: number, combo: number): void {
    const tipText = scene.add.text(x, y - 30, `+$${amount}`, {
      fontSize: '16px',
      color: '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    let comboText: Phaser.GameObjects.Text | undefined;
    if (combo > 1) {
      comboText = scene.add.text(x, y - 14, `x${combo} combo!`, {
        fontSize: '11px',
        color: '#ffaa44',
      }).setOrigin(0.5);
    }

    scene.tweens.add({
      targets: tipText,
      y: tipText.y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => tipText.destroy(),
    });

    if (comboText) {
      scene.tweens.add({
        targets: comboText,
        y: comboText.y - 40,
        alpha: 0,
        duration: 1500,
        onComplete: () => comboText.destroy(),
      });
    }
  }
}
