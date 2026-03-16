import Phaser from 'phaser';
import { GAME_WIDTH, EVENTS, COLORS } from '../config';
import { OrderTicket } from '../types/OrderState';
import { ScoreEvent } from '../types/OrderState';

export class HUDScene extends Phaser.Scene {
  private _scoreText!: Phaser.GameObjects.Text;
  private _timerText!: Phaser.GameObjects.Text;
  private _comboText!: Phaser.GameObjects.Text;
  private _levelText!: Phaser.GameObjects.Text;
  private _orderTexts: Phaser.GameObjects.Text[] = [];
  private _orderBg!: Phaser.GameObjects.Rectangle;
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

    this._scoreText = this.add.text(GAME_WIDTH - 10, 5, 'Score: 0', {
      fontSize: '14px',
      color: '#44ff44',
    }).setOrigin(1, 0);

    this._comboText = this.add.text(GAME_WIDTH - 10, 22, '', {
      fontSize: '12px',
      color: '#ffaa44',
    }).setOrigin(1, 0);

    // Order board area
    this._orderBg = this.add.rectangle(GAME_WIDTH / 2, 50, GAME_WIDTH - 20, 30, 0x000000)
      .setAlpha(0.4);

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
    this._scoreText.setText(`Score: ${score}`);
  }

  private _onComboUpdate(combo: number): void {
    if (combo > 1) {
      this._comboText.setText(`Combo x${combo}!`);
    } else {
      this._comboText.setText('');
    }
  }

  private _onOrderCreated(ticket: OrderTicket): void {
    const idx = this._orderTexts.length;
    const text = this.add.text(
      20 + idx * 160, 40,
      `#${ticket.id} ${ticket.recipe.name}`,
      { fontSize: '11px', color: '#ffffff', backgroundColor: '#333333', padding: { x: 4, y: 2 } },
    );
    this._orderTexts.push(text);
    this._resizeOrderBg();
  }

  private _onOrderCompleted(data: { orderId: number }): void {
    this._removeOrderText(data.orderId);
  }

  private _onOrderFailed(ticket: OrderTicket): void {
    this._removeOrderText(ticket.id);
  }

  private _removeOrderText(orderId: number): void {
    const idx = this._orderTexts.findIndex((t) => t.text.startsWith(`#${orderId} `));
    if (idx >= 0) {
      this._orderTexts[idx].destroy();
      this._orderTexts.splice(idx, 1);
      // Reposition remaining
      this._orderTexts.forEach((t, i) => {
        t.x = 20 + i * 160;
      });
      this._resizeOrderBg();
    }
  }

  private _resizeOrderBg(): void {
    if (this._orderTexts.length > 0) {
      this._orderBg.setVisible(true);
    } else {
      this._orderBg.setVisible(false);
    }
  }

  private _onTipEarned(event: ScoreEvent): void {
    // Floating tip text in the GameScene coordinate space
    // We need to create it here but with game scene coordinates
    const text = this.add.text(event.x, event.y - 30, `+$${event.amount}`, {
      fontSize: '16px',
      color: '#44ff44',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (event.combo > 1) {
      this.add.text(event.x, event.y - 14, `x${event.combo} combo!`, {
        fontSize: '11px',
        color: '#ffaa44',
      }).setOrigin(0.5);
    }

    this.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });
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
