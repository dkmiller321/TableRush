import { BALANCE, EVENTS } from '../config';
import { OrderTicket, OrderStatus } from '../types/OrderState';
import { RecipeBook } from './RecipeBook';

export class OrderSystem {
  private _orders: Map<number, OrderTicket> = new Map();
  private _nextOrderId: number = 1;
  private _recipeBook: RecipeBook;
  private _availableRecipeIds: string[];
  private _gameEvents: Phaser.Events.EventEmitter;

  constructor(
    gameEvents: Phaser.Events.EventEmitter,
    recipeBook: RecipeBook,
    availableRecipeIds: string[],
  ) {
    this._gameEvents = gameEvents;
    this._recipeBook = recipeBook;
    this._availableRecipeIds = availableRecipeIds;
  }

  get activeOrders(): OrderTicket[] {
    return Array.from(this._orders.values()).filter(
      (o) => o.status === OrderStatus.Pending || o.status === OrderStatus.InProgress,
    );
  }

  get openOrderCount(): number {
    return this.activeOrders.length;
  }

  createOrder(customerId: number, tableId: number): OrderTicket | null {
    if (this.openOrderCount >= BALANCE.MAX_OPEN_ORDERS) return null;

    const recipe = this._recipeBook.getRandomRecipe(this._availableRecipeIds);
    const ticket: OrderTicket = {
      id: this._nextOrderId++,
      recipe,
      status: OrderStatus.Pending,
      customerId,
      tableId,
      createdAt: Date.now(),
      collectedItems: [],
    };

    this._orders.set(ticket.id, ticket);
    this._gameEvents.emit(EVENTS.ORDER_CREATED, ticket);
    return ticket;
  }

  completeOrder(orderId: number): void {
    const order = this._orders.get(orderId);
    if (order) {
      order.status = OrderStatus.Completed;
    }
  }

  failOrder(orderId: number): void {
    const order = this._orders.get(orderId);
    if (order) {
      order.status = OrderStatus.Failed;
      this._gameEvents.emit(EVENTS.ORDER_FAILED, order);
    }
  }

  getOrderForTable(tableId: number): OrderTicket | undefined {
    return this.activeOrders.find((o) => o.tableId === tableId);
  }

  getOrderById(orderId: number): OrderTicket | undefined {
    return this._orders.get(orderId);
  }

  update(_delta: number): void {
    // Future: could add time-based order urgency updates
  }
}
