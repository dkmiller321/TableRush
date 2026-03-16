import Phaser from 'phaser';
import { BALANCE, COLORS, EVENTS } from '../../config';
import { StationType, ItemType, HoldableItem, makeItem } from '../../types/Recipe';
import { WorkStation } from '../WorkStation';

const COOK_MAP: Partial<Record<string, ItemType>> = {
  [ItemType.RawPatty]: ItemType.CookedPatty,
  [ItemType.RawNoodles]: ItemType.CookedNoodles,
  [ItemType.RawSteak]: ItemType.CookedSteak,
  [ItemType.RawPizza]: ItemType.CookedPizza,
  [ItemType.RawBroth]: ItemType.CookedBroth,
};

export class CookStation extends WorkStation {
  private _cookTimer: number = 0;
  private _cookDuration: number = BALANCE.COOK_DURATION_MS;
  private _isCooking: boolean = false;
  private _isBurned: boolean = false;
  private _burnWarned: boolean = false;
  private _outputType: ItemType | null = null;
  private _steamEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene, x, y,
      StationType.Cook,
      [ItemType.RawPatty, ItemType.RawNoodles, ItemType.RawSteak, ItemType.RawPizza, ItemType.RawBroth],
      COLORS.COOK_STATION,
      'COOK',
    );
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (this._isOccupied && !this._isCooking && this._outputType) {
      const output = this._isBurned ? makeItem(ItemType.BurnedFood) : makeItem(this._outputType);
      this._reset();
      return output;
    }

    if (this._isOccupied) {
      return null;
    }

    if (heldItem && this.acceptsInput(heldItem.type)) {
      this._currentItem = heldItem;
      this._isOccupied = true;
      this._isCooking = true;
      this._cookTimer = 0;
      this._progress = 0;
      this._outputType = COOK_MAP[heldItem.type] ?? null;
      this._showProgressBar();
      this._showItemIndicator(heldItem.color);
      this._startSteamParticles();
      return null;
    }

    return heldItem ?? null;
  }

  update(_time: number, delta: number): void {
    if (!this._isCooking) return;

    this._cookTimer += delta;
    this._progress = Math.min(this._cookTimer / this._cookDuration, 1);
    this._updateProgressBar(this._progress);

    if (this._cookTimer >= BALANCE.BURN_WARNING_MS && !this._burnWarned) {
      this._burnWarned = true;
      this._bg.fillColor = 0xff6600;
      this._label.setText('!!');
      this._setSmokeParticles();
      this.scene.game.events.emit(EVENTS.STATION_BURN_WARNING, this);
    }

    if (this._cookTimer >= BALANCE.BURN_THRESHOLD_MS && !this._isBurned) {
      this._isBurned = true;
      this._isCooking = false;
      this._bg.fillColor = 0x220000;
      this._label.setText('BURN');
      this.scene.game.events.emit(EVENTS.STATION_BURNED, this);
    }

    if (this._progress >= 1 && !this._isBurned) {
      this._isCooking = false;
      this._label.setText('DONE');
      this.scene.game.events.emit(EVENTS.STATION_COMPLETE, this._stationType);
    }
  }

  private _reset(): void {
    this._isOccupied = false;
    this._isCooking = false;
    this._isBurned = false;
    this._burnWarned = false;
    this._cookTimer = 0;
    this._progress = 0;
    this._currentItem = null;
    this._outputType = null;
    this._label.setText('COOK');
    this._bg.fillColor = COLORS.COOK_STATION;
    this._hideProgressBar();
    this._hideItemIndicator();
    this._stopParticles();
  }

  private _startSteamParticles(): void {
    this._stopParticles();
    this._steamEmitter = this.scene.add.particles(this.x, this.y - 10, '__DEFAULT', {
      speed: { min: 8, max: 20 },
      angle: { min: 250, max: 290 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 800,
      frequency: 120,
      tint: [0xcccccc, 0xdddddd, 0xeeeeee],
    });
  }

  private _setSmokeParticles(): void {
    this._stopParticles();
    this._steamEmitter = this.scene.add.particles(this.x, this.y - 10, '__DEFAULT', {
      speed: { min: 15, max: 40 },
      angle: { min: 240, max: 300 },
      scale: { start: 2.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 600,
      frequency: 60,
      tint: [0xff4400, 0xff6600, 0xcc3300],
    });
  }

  private _stopParticles(): void {
    if (this._steamEmitter) {
      this._steamEmitter.destroy();
      this._steamEmitter = null;
    }
  }
}
