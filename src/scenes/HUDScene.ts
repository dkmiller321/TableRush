import Phaser from 'phaser';
import { GAME_WIDTH, EVENTS, COLORS } from '../config';
import { OrderTicket } from '../types/OrderState';
import { ScoreEvent } from '../types/OrderState';
import { OrderBoard } from '../ui/OrderBoard';
import { ScoreDisplay } from '../ui/ScoreDisplay';
import { TipPopup } from '../ui/TipPopup';

export class HUDScene extends Phaser.Scene {
  private _timerText!: Phaser.GameObjects.Text;
  private _levelText!: Phaser.GameObjects.Text;
  private _orderBoard!: OrderBoard;
  private _scoreDisplay!: ScoreDisplay;
  private _serviceTimeMs: number = 0;

  constructor() {
    super({ key: 'HUDScene' });
  }

  init(data: { level: number; serviceTimeMs: number }): void {
    this._serviceTimeMs = data.serviceTimeMs;
  }

  create(): void {
    // HUD background bar at top
    this.add.rectangle(GAME_WIDTH / 2, 14, GAME_WIDTH, 28, COLORS.UI_BG).setAlpha(0.8);

    this._levelText = this.add.text(10, 5, `Level ${this.registry.get('level') ?? ''}`, {
      fontSize: '14px',
      color: '#ffcc88',
    });

    this._timerText = this.add.text(GAME_WIDTH / 2, 5, this._formatTime(this._serviceTimeMs), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this._scoreDisplay = new ScoreDisplay(this, GAME_WIDTH - 10, 5);

    // Order board area
    this._orderBoard = new OrderBoard(this);

    // Listen for events
    this.game.events.on(EVENTS.SERVICE_TIMER_UPDATE, this._onTimerUpdate, this);
    this.game.events.on(EVENTS.SCORE_UPDATED, this._onScoreUpdate, this);
    this.game.events.on(EVENTS.COMBO_UPDATED, this._onComboUpdate, this);
    this.game.events.on(EVENTS.ORDER_CREATED, this._onOrderCreated, this);
    this.game.events.on(EVENTS.ORDER_COMPLETED, this._onOrderCompleted, this);
    this.game.events.on(EVENTS.ORDER_FAILED, this._onOrderFailed, this);
    this.game.events.on(EVENTS.TIP_EARNED, this._onTipEarned, this);
    this.game.events.on(EVENTS.SERVICE_END, this._onServiceEnd, this);
  }

  private _onTimerUpdate(timeMs: number): void {
    this._timerText.setText(this._formatTime(timeMs));
    if (timeMs < 30000) {
      this._timerText.setColor('#ff4444');
    } else if (timeMs < 60000) {
      this._timerText.setColor('#ffaa44');
    }
  }

  private _onScoreUpdate(score: number): void {
    this._scoreDisplay.updateScore(score);
  }

  private _onComboUpdate(combo: number): void {
    this._scoreDisplay.updateCombo(combo);
  }

  private _onOrderCreated(ticket: OrderTicket): void {
    this._orderBoard.addOrder(ticket);
  }

  private _onOrderCompleted(data: { orderId: number }): void {
    this._orderBoard.removeOrder(data.orderId);
  }

  private _onOrderFailed(ticket: OrderTicket): void {
    this._orderBoard.removeOrder(ticket.id);
  }

  private _onTipEarned(event: ScoreEvent): void {
    TipPopup.show(this, event.x, event.y, event.amount, event.combo);

    // Sparkle burst at tip position
    const sparkle = this.add.particles(event.x, event.y - 20, '__DEFAULT', {
      speed: { min: 30, max: 80 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      tint: [0xffdd44, 0xffaa00, 0xffff88],
      quantity: 10,
      emitting: false,
    });
    sparkle.explode();
    this.time.delayedCall(600, () => sparkle.destroy());
  }

  private _onServiceEnd(): void {
    this.game.events.off(EVENTS.SERVICE_TIMER_UPDATE, this._onTimerUpdate, this);
    this.game.events.off(EVENTS.SCORE_UPDATED, this._onScoreUpdate, this);
    this.game.events.off(EVENTS.COMBO_UPDATED, this._onComboUpdate, this);
    this.game.events.off(EVENTS.ORDER_CREATED, this._onOrderCreated, this);
    this.game.events.off(EVENTS.ORDER_COMPLETED, this._onOrderCompleted, this);
    this.game.events.off(EVENTS.ORDER_FAILED, this._onOrderFailed, this);
    this.game.events.off(EVENTS.TIP_EARNED, this._onTipEarned, this);
    this.game.events.off(EVENTS.SERVICE_END, this._onServiceEnd, this);
  }

  private _formatTime(ms: number): string {
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }
}
