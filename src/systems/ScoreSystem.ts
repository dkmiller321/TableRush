import { BALANCE, EVENTS } from '../config';
import { ScoreEvent } from '../types/OrderState';

export class ScoreSystem {
  private _score: number = 0;
  private _combo: number = 0;
  private _comboMultiplier: number = 1.0;
  private _ordersCompleted: number = 0;
  private _ordersFailed: number = 0;
  private _totalTips: number = 0;
  private _gameEvents: Phaser.Events.EventEmitter;

  constructor(gameEvents: Phaser.Events.EventEmitter) {
    this._gameEvents = gameEvents;

    this._gameEvents.on(EVENTS.ORDER_SCORE, this._onOrderScore, this);
    this._gameEvents.on(EVENTS.ORDER_FAILED, this._onOrderFailed, this);
    this._gameEvents.on(EVENTS.CUSTOMER_LEFT, this._onCustomerLeft, this);
  }

  get score(): number { return this._score; }
  get combo(): number { return this._combo; }
  get comboMultiplier(): number { return this._comboMultiplier; }
  get ordersCompleted(): number { return this._ordersCompleted; }
  get ordersFailed(): number { return this._ordersFailed; }
  get totalTips(): number { return this._totalTips; }

  private _onOrderScore(data: { patienceRatio: number; baseScore: number; x: number; y: number }): void {
    this._combo++;
    this._comboMultiplier = Math.min(
      1.0 + (this._combo - 1) * BALANCE.COMBO_MULTIPLIER_INCREMENT,
      BALANCE.MAX_COMBO_MULTIPLIER,
    );

    const tip = Math.round(data.baseScore * data.patienceRatio * this._comboMultiplier);
    this._score += tip;
    this._totalTips += tip;
    this._ordersCompleted++;

    const scoreEvent: ScoreEvent = {
      type: 'tip',
      amount: tip,
      combo: this._combo,
      x: data.x,
      y: data.y,
    };

    this._gameEvents.emit(EVENTS.TIP_EARNED, scoreEvent);
    this._gameEvents.emit(EVENTS.SCORE_UPDATED, this._score);
    this._gameEvents.emit(EVENTS.COMBO_UPDATED, this._combo);
  }

  private _onOrderFailed(): void {
    this._combo = 0;
    this._comboMultiplier = 1.0;
    this._ordersFailed++;
    this._score = Math.max(0, this._score - 50);

    this._gameEvents.emit(EVENTS.SCORE_UPDATED, this._score);
    this._gameEvents.emit(EVENTS.COMBO_UPDATED, this._combo);
  }

  private _onCustomerLeft(data: { angry: boolean }): void {
    if (data.angry) {
      this._combo = 0;
      this._comboMultiplier = 1.0;
      this._gameEvents.emit(EVENTS.COMBO_UPDATED, this._combo);
    }
  }

  getStarRating(thresholds: [number, number, number]): number {
    if (this._score >= thresholds[2]) return 3;
    if (this._score >= thresholds[1]) return 2;
    if (this._score >= thresholds[0]) return 1;
    return 0;
  }

  update(_delta: number): void {
    // Future: time-based score decay or bonuses
  }

  destroy(): void {
    this._gameEvents.off(EVENTS.ORDER_SCORE, this._onOrderScore, this);
    this._gameEvents.off(EVENTS.ORDER_FAILED, this._onOrderFailed, this);
    this._gameEvents.off(EVENTS.CUSTOMER_LEFT, this._onCustomerLeft, this);
  }
}
