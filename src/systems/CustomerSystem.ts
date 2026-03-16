import Phaser from 'phaser';
import { BALANCE, EVENTS } from '../config';
import { Customer, CustomerState } from '../objects/Customer';
import { Table, TableState } from '../objects/Table';
import { OrderSystem } from './OrderSystem';

export class CustomerSystem {
  private _scene: Phaser.Scene;
  private _customers: Customer[] = [];
  private _tables: Table[];
  private _orderSystem: OrderSystem;
  private _spawnTimer: number = 0;
  private _spawnInterval: number;
  private _nextCustomerId: number = 1;
  private _hostStandX: number;
  private _hostStandY: number;
  private _exitX: number;
  private _exitY: number;
  private _gameEvents: Phaser.Events.EventEmitter;

  constructor(
    scene: Phaser.Scene,
    tables: Table[],
    orderSystem: OrderSystem,
    spawnInterval: number,
    hostStandX: number,
    hostStandY: number,
  ) {
    this._scene = scene;
    this._tables = tables;
    this._orderSystem = orderSystem;
    this._spawnInterval = spawnInterval;
    this._hostStandX = hostStandX;
    this._hostStandY = hostStandY;
    this._exitX = hostStandX;
    this._exitY = hostStandY + 60;
    this._gameEvents = scene.game.events;

    this._gameEvents.on(EVENTS.CUSTOMER_SEATED, this._onCustomerSeated, this);
    this._gameEvents.on(EVENTS.ORDER_COMPLETED, this._onOrderCompleted, this);
    this._gameEvents.on(EVENTS.CUSTOMER_ANGRY, this._onCustomerAngry, this);
    this._gameEvents.on(EVENTS.TABLE_CLEARED, this._onTableCleared, this);
  }

  get customers(): Customer[] {
    return this._customers;
  }

  update(_time: number, delta: number): void {
    this._spawnTimer += delta;

    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      this._trySpawnCustomer();
    }

    for (const customer of this._customers) {
      customer.update(_time, delta);
    }

    this._cleanupGone();
  }

  private _trySpawnCustomer(): void {
    const emptyTable = this._tables.find((t) => t.isEmpty);
    if (!emptyTable) return;

    const customer = new Customer(
      this._scene,
      this._hostStandX,
      this._hostStandY,
      this._nextCustomerId++,
    );
    this._customers.push(customer);

    customer.assignTable(emptyTable.tableId, emptyTable.x, emptyTable.y);
    emptyTable.seatCustomer(customer.customerId);
  }

  private _onCustomerSeated(data: { customerId: number; tableId: number }): void {
    const customer = this._customers.find((c) => c.customerId === data.customerId);
    if (!customer) return;

    // After seating delay, customer starts ordering
    this._scene.time.delayedCall(500, () => {
      if (customer.customerState !== CustomerState.Seated) return;
      customer.startOrdering();

      const ticket = this._orderSystem.createOrder(data.customerId, data.tableId);
      if (ticket) {
        const table = this._tables.find((t) => t.tableId === data.tableId);
        table?.startOrdering(ticket.id, ticket.recipe.name);

        this._scene.time.delayedCall(1000, () => {
          customer.setWaitingForFood();
          table?.setWaitingForFood();
        });
      }
    });
  }

  private _onOrderCompleted(data: { orderId: number; tableId: number; customerId: number; x: number; y: number }): void {
    const customer = this._customers.find((c) => c.customerId === data.customerId);
    if (!customer) return;

    const order = this._orderSystem.getOrderById(data.orderId);
    const patienceRatio = customer.patienceRatio;
    const baseScore = order?.recipe.baseScore ?? BALANCE.BASE_TIP;

    customer.startEating();
    this._orderSystem.completeOrder(data.orderId);

    this._gameEvents.emit(EVENTS.ORDER_SCORE, {
      patienceRatio,
      baseScore,
      x: data.x,
      y: data.y,
    });
  }

  private _onCustomerAngry(data: { customerId: number; tableId: number; state: CustomerState }): void {
    const customer = this._customers.find((c) => c.customerId === data.customerId);
    if (!customer) return;

    if (customer.customerState === CustomerState.Leaving || customer.customerState === CustomerState.Gone) return;

    const order = this._orderSystem.getOrderForTable(data.tableId);
    if (order) {
      this._orderSystem.failOrder(order.id);
    }

    const table = this._tables.find((t) => t.tableId === data.tableId);
    table?.forceEmpty();

    customer.startLeaving(this._exitX, this._exitY);
    this._gameEvents.emit(EVENTS.CUSTOMER_LEFT, {
      customerId: data.customerId,
      angry: true,
    });
  }

  private _onTableCleared(tableId: number): void {
    const table = this._tables.find((t) => t.tableId === tableId);
    if (!table) return;

    const customer = this._customers.find(
      (c) => c.tableId === tableId &&
        (c.customerState === CustomerState.Eating || c.customerState === CustomerState.WaitingForFood),
    );
    if (customer) {
      customer.startLeaving(this._exitX, this._exitY);
      this._gameEvents.emit(EVENTS.CUSTOMER_LEFT, {
        customerId: customer.customerId,
        angry: false,
      });
    }
  }

  private _cleanupGone(): void {
    this._customers = this._customers.filter((c) => {
      if (c.customerState === CustomerState.Gone) {
        c.destroy();
        return false;
      }
      return true;
    });
  }

  destroy(): void {
    this._gameEvents.off(EVENTS.CUSTOMER_SEATED, this._onCustomerSeated, this);
    this._gameEvents.off(EVENTS.ORDER_COMPLETED, this._onOrderCompleted, this);
    this._gameEvents.off(EVENTS.CUSTOMER_ANGRY, this._onCustomerAngry, this);
    this._gameEvents.off(EVENTS.TABLE_CLEARED, this._onTableCleared, this);

    for (const customer of this._customers) {
      customer.destroy();
    }
    this._customers = [];
  }
}
