import { ItemType, Recipe } from './Recipe';

export const enum OrderStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}

export interface OrderTicket {
  id: number;
  recipe: Recipe;
  status: OrderStatus;
  customerId: number;
  tableId: number;
  createdAt: number;
  collectedItems: ItemType[];
}

export interface ScoreEvent {
  type: 'tip' | 'bonus' | 'penalty';
  amount: number;
  combo: number;
  x: number;
  y: number;
}
