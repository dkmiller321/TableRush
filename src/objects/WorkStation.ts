import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../config';
import { StationType, ItemType, HoldableItem } from '../types/Recipe';

export abstract class WorkStation extends Phaser.GameObjects.Container {
  protected _stationType: StationType;
  protected _isOccupied: boolean = false;
  protected _progress: number = 0;
  protected _acceptedInputs: ItemType[];
  protected _currentItem: HoldableItem | null = null;
  protected _bg: Phaser.GameObjects.Rectangle;
  protected _label: Phaser.GameObjects.Text;
  protected _progressBar: Phaser.GameObjects.Rectangle | null = null;
  protected _progressBg: Phaser.GameObjects.Rectangle | null = null;
  protected _itemIndicator: Phaser.GameObjects.Rectangle | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stationType: StationType,
    acceptedInputs: ItemType[],
    color: number,
    label: string,
  ) {
    super(scene, x, y);
    this._stationType = stationType;
    this._acceptedInputs = acceptedInputs;

    this._bg = scene.add.rectangle(0, 0, TILE_SIZE * 1.5, TILE_SIZE * 1.5, color);
    this._bg.setStrokeStyle(2, 0xffffff);
    this.add(this._bg);

    this._label = scene.add.text(0, 0, label, {
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this._label);

    this.setSize(TILE_SIZE * 1.5, TILE_SIZE * 1.5);
    scene.add.existing(this);

    scene.physics.add.existing(this, true);
  }

  get stationType(): StationType {
    return this._stationType;
  }

  get isOccupied(): boolean {
    return this._isOccupied;
  }

  get progress(): number {
    return this._progress;
  }

  get currentItem(): HoldableItem | null {
    return this._currentItem;
  }

  acceptsInput(itemType: ItemType): boolean {
    return this._acceptedInputs.includes(itemType);
  }

  protected _showProgressBar(): void {
    if (!this._progressBg) {
      this._progressBg = this.scene.add.rectangle(0, -TILE_SIZE * 0.9, TILE_SIZE * 1.4, 6, 0x000000);
      this.add(this._progressBg);
    }
    if (!this._progressBar) {
      this._progressBar = this.scene.add.rectangle(
        -TILE_SIZE * 0.7 + 1, -TILE_SIZE * 0.9,
        0, 4, COLORS.PATIENCE_GREEN
      ).setOrigin(0, 0.5);
      this.add(this._progressBar);
    }
  }

  protected _updateProgressBar(progress: number): void {
    if (this._progressBar) {
      this._progressBar.width = (TILE_SIZE * 1.4 - 2) * Math.min(progress, 1);
    }
  }

  protected _hideProgressBar(): void {
    this._progressBg?.destroy();
    this._progressBg = null;
    this._progressBar?.destroy();
    this._progressBar = null;
  }

  protected _showItemIndicator(color: number): void {
    if (!this._itemIndicator) {
      this._itemIndicator = this.scene.add.rectangle(0, TILE_SIZE * 0.5, 12, 12, color);
      this._itemIndicator.setStrokeStyle(1, 0xffffff);
      this.add(this._itemIndicator);
    } else {
      this._itemIndicator.fillColor = color;
      this._itemIndicator.setVisible(true);
    }
  }

  protected _hideItemIndicator(): void {
    this._itemIndicator?.setVisible(false);
  }

  abstract onInteract(heldItem: HoldableItem | null): HoldableItem | null;
  abstract update(_time: number, delta: number): void;
}
