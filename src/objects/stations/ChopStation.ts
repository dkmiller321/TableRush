import Phaser from 'phaser';
import { BALANCE, COLORS, EVENTS } from '../../config';
import { StationType, ItemType, HoldableItem, makeItem } from '../../types/Recipe';
import { WorkStation } from '../WorkStation';

const CHOP_MAP: Partial<Record<string, ItemType>> = {
  [ItemType.Lettuce]: ItemType.ChoppedLettuce,
  [ItemType.Tomato]: ItemType.ChoppedTomato,
  [ItemType.RawVeggies]: ItemType.ChoppedVeggies,
};

export class ChopStation extends WorkStation {
  private _chopTimer: number = 0;
  private _chopDuration: number = BALANCE.CHOP_DURATION_MS;
  private _isChopping: boolean = false;
  private _outputType: ItemType | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene, x, y,
      StationType.Chop,
      [ItemType.Lettuce, ItemType.Tomato, ItemType.RawVeggies],
      COLORS.CHOP_STATION,
      'CHOP',
    );
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (this._isOccupied && this._progress >= 1 && this._outputType) {
      const output = makeItem(this._outputType);
      this._reset();
      return output;
    }

    if (this._isOccupied && this._isChopping) {
      return null;
    }

    if (heldItem && this.acceptsInput(heldItem.type)) {
      this._currentItem = heldItem;
      this._isOccupied = true;
      this._isChopping = true;
      this._chopTimer = 0;
      this._progress = 0;
      this._outputType = CHOP_MAP[heldItem.type] ?? null;
      this._showProgressBar();
      this._showItemIndicator(heldItem.color);
      return null;
    }

    if (this._isOccupied && !this._isChopping && this._currentItem) {
      const item = this._currentItem;
      this._reset();
      return item;
    }

    return heldItem ?? null;
  }

  update(_time: number, delta: number): void {
    if (!this._isChopping) return;

    this._chopTimer += delta;
    this._progress = Math.min(this._chopTimer / this._chopDuration, 1);
    this._updateProgressBar(this._progress);

    if (this._progress >= 1) {
      this._isChopping = false;
      this._label.setText('DONE');
      this.scene.game.events.emit(EVENTS.STATION_COMPLETE, this._stationType);
    }
  }

  private _reset(): void {
    this._isOccupied = false;
    this._isChopping = false;
    this._chopTimer = 0;
    this._progress = 0;
    this._currentItem = null;
    this._outputType = null;
    this._label.setText('CHOP');
    this._hideProgressBar();
    this._hideItemIndicator();
  }
}
