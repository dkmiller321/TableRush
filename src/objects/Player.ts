import Phaser from 'phaser';
import { BALANCE, COLORS, TILE_SIZE, EVENTS } from '../config';
import { HoldableItem } from '../types/Recipe';
import { WorkStation } from './WorkStation';
import { Table } from './Table';

type Direction = 'up' | 'down' | 'left' | 'right';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private _speed: number = BALANCE.PLAYER_SPEED;
  private _holding: HoldableItem | null = null;
  private _direction: Direction = 'down';
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private _wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private _interactKey: Phaser.Input.Keyboard.Key | null = null;
  private _dropKey: Phaser.Input.Keyboard.Key | null = null;
  private _heldItemSprite: Phaser.GameObjects.Rectangle | null = null;
  private _heldItemText: Phaser.GameObjects.Text | null = null;
  private _interactCooldown: number = 0;
  private _stations: WorkStation[] = [];
  private _tables: Table[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '__DEFAULT');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(TILE_SIZE, TILE_SIZE);
    this.setTint(COLORS.PLAYER);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(TILE_SIZE * 0.8, TILE_SIZE * 0.8);

    if (scene.input.keyboard) {
      this._cursors = scene.input.keyboard.createCursorKeys();
      this._wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this._interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this._dropKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

      const eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      const qKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

      eKey.on('down', () => this._tryInteract());
      qKey.on('down', () => this._dropItem());
    }
  }

  setStations(stations: WorkStation[]): void {
    this._stations = stations;
  }

  setTables(tables: Table[]): void {
    this._tables = tables;
  }

  get holding(): HoldableItem | null {
    return this._holding;
  }

  setHolding(item: HoldableItem | null): void {
    this._holding = item;
    this._updateHeldDisplay();
  }

  update(delta: number): void {
    this._handleMovement();
    this._handleInteract(delta);
    this._updateHeldPosition();
  }

  private _handleMovement(): void {
    let vx = 0;
    let vy = 0;

    const left = this._cursors?.left.isDown || this._wasd?.A.isDown;
    const right = this._cursors?.right.isDown || this._wasd?.D.isDown;
    const up = this._cursors?.up.isDown || this._wasd?.W.isDown;
    const down = this._cursors?.down.isDown || this._wasd?.S.isDown;

    if (left) vx = -1;
    else if (right) vx = 1;
    if (up) vy = -1;
    else if (down) vy = 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / len) * this._speed;
      vy = (vy / len) * this._speed;

      if (Math.abs(vx) >= Math.abs(vy)) {
        this._direction = vx > 0 ? 'right' : 'left';
      } else {
        this._direction = vy > 0 ? 'down' : 'up';
      }
    }

    this.setVelocity(vx, vy);
  }

  private _handleInteract(delta: number): void {
    if (this._interactCooldown > 0) {
      this._interactCooldown -= delta;
      return;
    }

    if (this._interactKey?.isDown) {
      this._tryInteract();
      this._interactCooldown = 250;
    }

    if (this._dropKey?.isDown) {
      this._dropItem();
      this._interactCooldown = 250;
    }
  }

  private _tryInteract(): void {
    const interactDist = TILE_SIZE * 2;

    let nearestStation: WorkStation | null = null;
    let nearestStationDist = Infinity;

    for (const station of this._stations) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, station.x, station.y);
      if (dist < interactDist && dist < nearestStationDist) {
        nearestStation = station;
        nearestStationDist = dist;
      }
    }

    let nearestTable: Table | null = null;
    let nearestTableDist = Infinity;

    for (const table of this._tables) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, table.x, table.y);
      if (dist < interactDist && dist < nearestTableDist) {
        nearestTable = table;
        nearestTableDist = dist;
      }
    }

    if (nearestStation && nearestStationDist <= nearestTableDist) {
      const result = nearestStation.onInteract(this._holding);
      if (result !== this._holding) {
        this._holding = result;
        this._updateHeldDisplay();
      }
      return;
    }

    if (nearestTable) {
      const result = nearestTable.onInteract(this._holding);
      if (result !== this._holding) {
        this._holding = result;
        this._updateHeldDisplay();
      }
    }
  }

  private _dropItem(): void {
    if (this._holding) {
      this._holding = null;
      this._updateHeldDisplay();
      this.scene.game.events.emit(EVENTS.ITEM_DROPPED);
    }
  }

  private _updateHeldDisplay(): void {
    this._heldItemSprite?.destroy();
    this._heldItemText?.destroy();
    this._heldItemSprite = null;
    this._heldItemText = null;

    if (this._holding) {
      this._heldItemSprite = this.scene.add.rectangle(
        this.x, this.y - TILE_SIZE,
        16, 16,
        this._holding.color,
      ).setStrokeStyle(1, 0xffffff).setDepth(100);

      this._heldItemText = this.scene.add.text(
        this.x, this.y - TILE_SIZE - 12,
        this._holding.label,
        { fontSize: '9px', color: '#ffffff', align: 'center' },
      ).setOrigin(0.5).setDepth(100);
    }
  }

  private _updateHeldPosition(): void {
    if (this._heldItemSprite) {
      this._heldItemSprite.x = this.x;
      this._heldItemSprite.y = this.y - TILE_SIZE;
    }
    if (this._heldItemText) {
      this._heldItemText.x = this.x;
      this._heldItemText.y = this.y - TILE_SIZE - 12;
    }
  }
}
