import Phaser from 'phaser';
import { COLORS, TILE_SIZE, BALANCE, EVENTS } from '../config';

export const enum CustomerState {
  Waiting = 'waiting',
  WalkingToTable = 'walking_to_table',
  Seated = 'seated',
  Ordering = 'ordering',
  WaitingForFood = 'waiting_for_food',
  Eating = 'eating',
  Leaving = 'leaving',
  Gone = 'gone',
}

export class Customer extends Phaser.GameObjects.Container {
  private _customerId: number;
  private _state: CustomerState = CustomerState.Waiting;
  private _patienceTimer: number = 0;
  private _maxPatience: number = BALANCE.CUSTOMER_PATIENCE_MS.WAITING;
  private _tableId: number = -1;
  private _sprite: Phaser.GameObjects.Rectangle;
  private _patienceBar: Phaser.GameObjects.Rectangle;
  private _patienceBg: Phaser.GameObjects.Rectangle;
  private _targetX: number = 0;
  private _targetY: number = 0;
  private _moveSpeed: number = 80;
  private _orderingDelay: number = BALANCE.ORDERING_DELAY_MS;

  constructor(scene: Phaser.Scene, x: number, y: number, customerId: number) {
    super(scene, x, y);
    this._customerId = customerId;

    this._sprite = scene.add.rectangle(0, 0, TILE_SIZE * 0.8, TILE_SIZE * 0.8, COLORS.CUSTOMER);
    this._sprite.setStrokeStyle(2, 0xffffff);
    this.add(this._sprite);

    this._patienceBg = scene.add.rectangle(0, -TILE_SIZE * 0.6, TILE_SIZE * 0.8, 5, 0x000000);
    this.add(this._patienceBg);

    this._patienceBar = scene.add.rectangle(
      -TILE_SIZE * 0.4 + 1, -TILE_SIZE * 0.6,
      TILE_SIZE * 0.8 - 2, 3,
      COLORS.PATIENCE_GREEN,
    ).setOrigin(0, 0.5);
    this.add(this._patienceBar);

    this.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);
    scene.add.existing(this);
  }

  get customerId(): number { return this._customerId; }
  get customerState(): CustomerState { return this._state; }
  get tableId(): number { return this._tableId; }
  get patienceRatio(): number {
    return Math.max(0, 1 - this._patienceTimer / this._maxPatience);
  }

  assignTable(tableId: number, tableX: number, tableY: number): void {
    this._tableId = tableId;
    this._state = CustomerState.WalkingToTable;
    this._targetX = tableX;
    this._targetY = tableY - TILE_SIZE * 1.5;
  }

  setSeated(): void {
    this._state = CustomerState.Seated;
    this._patienceTimer = 0;
    this._orderingDelay = BALANCE.ORDERING_DELAY_MS;
  }

  startOrdering(): void {
    this._state = CustomerState.Ordering;
  }

  setWaitingForFood(): void {
    this._state = CustomerState.WaitingForFood;
    this._patienceTimer = 0;
    this._maxPatience = BALANCE.CUSTOMER_PATIENCE_MS.WAITING_FOR_FOOD;
    this._patienceBar.fillColor = COLORS.PATIENCE_GREEN;
  }

  startEating(): void {
    this._state = CustomerState.Eating;
    this._patienceBar.setVisible(false);
    this._patienceBg.setVisible(false);
  }

  startLeaving(exitX: number, exitY: number): void {
    this._state = CustomerState.Leaving;
    this._targetX = exitX;
    this._targetY = exitY;
    this._patienceBar.setVisible(false);
    this._patienceBg.setVisible(false);
  }

  update(_time: number, delta: number): void {
    switch (this._state) {
      case CustomerState.Waiting:
        this._updatePatience(delta);
        break;

      case CustomerState.WalkingToTable:
        this._moveToTarget(delta);
        if (this._reachedTarget()) {
          this.setSeated();
          this.scene.game.events.emit(EVENTS.CUSTOMER_SEATED, {
            customerId: this._customerId,
            tableId: this._tableId,
          });
        }
        break;

      case CustomerState.Seated:
        this._orderingDelay -= delta;
        if (this._orderingDelay <= 0) {
          this.startOrdering();
        }
        break;

      case CustomerState.WaitingForFood:
        this._updatePatience(delta);
        break;

      case CustomerState.Leaving:
        this._moveToTarget(delta);
        if (this._reachedTarget()) {
          this._state = CustomerState.Gone;
        }
        break;
    }
  }

  private _updatePatience(delta: number): void {
    this._patienceTimer += delta;
    const ratio = this.patienceRatio;

    const barWidth = (TILE_SIZE * 0.8 - 2) * ratio;
    this._patienceBar.width = Math.max(0, barWidth);

    if (ratio > 0.5) {
      this._patienceBar.fillColor = COLORS.PATIENCE_GREEN;
    } else if (ratio > 0.25) {
      this._patienceBar.fillColor = COLORS.PATIENCE_YELLOW;
      this._sprite.fillColor = 0xffaa44;
    } else {
      this._patienceBar.fillColor = COLORS.PATIENCE_RED;
      this._sprite.fillColor = COLORS.CUSTOMER_ANGRY;
    }

    if (ratio <= 0) {
      this.scene.game.events.emit(EVENTS.CUSTOMER_ANGRY, {
        customerId: this._customerId,
        tableId: this._tableId,
        state: this._state,
      });
    }
  }

  private _moveToTarget(delta: number): void {
    const dx = this._targetX - this.x;
    const dy = this._targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 2) {
      this.x = this._targetX;
      this.y = this._targetY;
      return;
    }

    const speed = (this._moveSpeed * delta) / 1000;
    this.x += (dx / dist) * speed;
    this.y += (dy / dist) * speed;
  }

  private _reachedTarget(): boolean {
    return Math.abs(this.x - this._targetX) < 2 && Math.abs(this.y - this._targetY) < 2;
  }
}
