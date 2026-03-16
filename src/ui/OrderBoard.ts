import Phaser from 'phaser';
import { OrderTicket } from '../types/OrderState';
import { GAME_WIDTH } from '../config';

interface OrderSlip {
  orderId: number;
  container: Phaser.GameObjects.Container;
}

export class OrderBoard {
  private _scene: Phaser.Scene;
  private _slips: OrderSlip[] = [];
  private _bg: Phaser.GameObjects.Rectangle;

  private static readonly SLIP_WIDTH = 140;
  private static readonly SLIP_HEIGHT = 26;
  private static readonly SLIP_GAP = 10;
  private static readonly START_X = 20;
  private static readonly START_Y = 38;
  private static readonly BG_COLOR = 0xfff5e0;
  private static readonly TEXT_COLOR = '#3b2f1e';
  private static readonly SHADOW_COLOR = 0xccbb99;

  constructor(scene: Phaser.Scene) {
    this._scene = scene;
    this._bg = scene.add.rectangle(GAME_WIDTH / 2, 50, GAME_WIDTH - 20, 30, 0x000000)
      .setAlpha(0.4)
      .setVisible(false);
  }

  addOrder(ticket: OrderTicket): void {
    const idx = this._slips.length;
    const x = OrderBoard.START_X + idx * (OrderBoard.SLIP_WIDTH + OrderBoard.SLIP_GAP);
    const y = OrderBoard.START_Y;

    const container = this._scene.add.container(x, y);

    // Shadow
    const shadow = this._scene.add.rectangle(
      2, 2,
      OrderBoard.SLIP_WIDTH, OrderBoard.SLIP_HEIGHT,
      OrderBoard.SHADOW_COLOR,
    ).setOrigin(0, 0).setAlpha(0.5);
    container.add(shadow);

    // Slip background
    const bg = this._scene.add.rectangle(
      0, 0,
      OrderBoard.SLIP_WIDTH, OrderBoard.SLIP_HEIGHT,
      OrderBoard.BG_COLOR,
    ).setOrigin(0, 0);
    container.add(bg);

    // Order text
    const label = this._scene.add.text(
      6, 5,
      `#${ticket.id} ${ticket.recipe.name}`,
      {
        fontSize: '12px',
        color: OrderBoard.TEXT_COLOR,
        fontStyle: 'bold',
      },
    );
    container.add(label);

    this._slips.push({ orderId: ticket.id, container });
    this._updateBgVisibility();
  }

  removeOrder(orderId: number): void {
    const idx = this._slips.findIndex((s) => s.orderId === orderId);
    if (idx < 0) return;

    this._slips[idx].container.destroy();
    this._slips.splice(idx, 1);

    // Reposition remaining slips
    this._slips.forEach((slip, i) => {
      slip.container.x = OrderBoard.START_X + i * (OrderBoard.SLIP_WIDTH + OrderBoard.SLIP_GAP);
    });

    this._updateBgVisibility();
  }

  clear(): void {
    for (const slip of this._slips) {
      slip.container.destroy();
    }
    this._slips = [];
    this._updateBgVisibility();
  }

  private _updateBgVisibility(): void {
    this._bg.setVisible(this._slips.length > 0);
  }
}
