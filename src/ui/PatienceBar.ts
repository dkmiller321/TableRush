import Phaser from 'phaser';
import { COLORS } from '../config';

export class PatienceBar {
  private _container: Phaser.GameObjects.Container;
  private _bg: Phaser.GameObjects.Rectangle;
  private _bar: Phaser.GameObjects.Rectangle;
  private _width: number;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this._width = width;

    this._bg = scene.add.rectangle(0, 0, width, height, 0x000000);
    this._bar = scene.add.rectangle(
      -width / 2 + 1, 0,
      width - 2, height - 2,
      COLORS.PATIENCE_GREEN,
    ).setOrigin(0, 0.5);

    this._container = scene.add.container(0, 0, [this._bg, this._bar]);
  }

  get container(): Phaser.GameObjects.Container {
    return this._container;
  }

  update(ratio: number): void {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    this._bar.width = Math.max(0, (this._width - 2) * clamped);

    if (clamped > 0.5) {
      this._bar.fillColor = COLORS.PATIENCE_GREEN;
    } else if (clamped > 0.25) {
      this._bar.fillColor = COLORS.PATIENCE_YELLOW;
    } else {
      this._bar.fillColor = COLORS.PATIENCE_RED;
    }
  }
}
