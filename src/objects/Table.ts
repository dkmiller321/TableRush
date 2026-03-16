import Phaser from 'phaser';
import { COLORS, TILE_SIZE, EVENTS, BALANCE } from '../config';
import { HoldableItem, ItemType } from '../types/Recipe';

export const enum TableState {
  Empty = 'empty',
  Seated = 'seated',
  Ordering = 'ordering',
  WaitingForFood = 'waiting_for_food',
  Eating = 'eating',
  NeedsClearing = 'needs_clearing',
}

export class Table extends Phaser.GameObjects.Container {
  private _tableId: number;
  private _seats: 2 | 4;
  private _state: TableState = TableState.Empty;
  private _bg: Phaser.GameObjects.Rectangle;
  private _stateLabel: Phaser.GameObjects.Text;
  private _orderId: number = -1;
  private _customerId: number = -1;
  private _eatingTimer: number = 0;
  private _clearTimer: number = 0;
  private _expectedDish: string = '';

  constructor(scene: Phaser.Scene, x: number, y: number, tableId: number, seats: 2 | 4) {
    super(scene, x, y);
    this._tableId = tableId;
    this._seats = seats;

    const size = seats === 2 ? TILE_SIZE * 2 : TILE_SIZE * 3;
    this._bg = scene.add.rectangle(0, 0, size, size, COLORS.TABLE);
    this._bg.setStrokeStyle(2, 0x886644);
    this.add(this._bg);

    this._stateLabel = scene.add.text(0, 0, '', {
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this._stateLabel);

    this.setSize(size, size);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }

  get tableId(): number { return this._tableId; }
  get seats(): number { return this._seats; }
  get tableState(): TableState { return this._state; }
  get orderId(): number { return this._orderId; }
  get customerId(): number { return this._customerId; }

  get isEmpty(): boolean { return this._state === TableState.Empty; }

  seatCustomer(customerId: number): void {
    this._state = TableState.Seated;
    this._customerId = customerId;
    this._stateLabel.setText('Seated');
    this._bg.setStrokeStyle(2, 0xffaa44);
  }

  startOrdering(orderId: number, dishName: string): void {
    this._state = TableState.Ordering;
    this._orderId = orderId;
    this._expectedDish = dishName;
    this._stateLabel.setText(`Order:\n${dishName}`);
    this._stateLabel.setFontSize(9);
  }

  setWaitingForFood(): void {
    this._state = TableState.WaitingForFood;
    this._stateLabel.setText(`Want:\n${this._expectedDish}`);
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (this._state === TableState.WaitingForFood && heldItem && heldItem.type === ItemType.Plate) {
      if (heldItem.label === this._expectedDish) {
        this._state = TableState.Eating;
        this._eatingTimer = BALANCE.EATING_DURATION_MS;
        this._stateLabel.setText('Eating...');
        this._bg.setStrokeStyle(2, 0x44ff44);
        this.scene.game.events.emit(EVENTS.ORDER_COMPLETED, {
          orderId: this._orderId,
          tableId: this._tableId,
          customerId: this._customerId,
          x: this.x,
          y: this.y,
        });
        return null;
      }
    }

    if (this._state === TableState.NeedsClearing && !heldItem) {
      this._clearTable();
      return null;
    }

    return heldItem ?? null;
  }

  update(_time: number, delta: number): void {
    if (this._state === TableState.Eating) {
      this._eatingTimer -= delta;
      if (this._eatingTimer <= 0) {
        this._state = TableState.NeedsClearing;
        this._stateLabel.setText('Clear me');
        this._bg.setStrokeStyle(2, 0xaaaaaa);
      }
    }
  }

  forceEmpty(): void {
    this._clearTable();
  }

  private _clearTable(): void {
    this._state = TableState.Empty;
    this._orderId = -1;
    this._customerId = -1;
    this._eatingTimer = 0;
    this._expectedDish = '';
    this._stateLabel.setText('');
    this._bg.setStrokeStyle(2, 0x886644);
    this.scene.game.events.emit(EVENTS.TABLE_CLEARED, this._tableId);
  }
}
