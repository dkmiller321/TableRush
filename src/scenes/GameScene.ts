import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, COLORS, EVENTS } from '../config';
import { LEVELS, LevelConfig } from '../types/GameConfig';
import { ItemType } from '../types/Recipe';
import { Player } from '../objects/Player';
import { Table } from '../objects/Table';
import { WorkStation } from '../objects/WorkStation';
import { ChopStation } from '../objects/stations/ChopStation';
import { CookStation } from '../objects/stations/CookStation';
import { PlateStation } from '../objects/stations/PlateStation';
import { TrashStation } from '../objects/stations/TrashStation';
import { IngredientShelf } from '../objects/stations/IngredientShelf';
import { RecipeBook } from '../systems/RecipeBook';
import { OrderSystem } from '../systems/OrderSystem';
import { CustomerSystem } from '../systems/CustomerSystem';
import { ScoreSystem } from '../systems/ScoreSystem';

export class GameScene extends Phaser.Scene {
  private _player!: Player;
  private _tables: Table[] = [];
  private _stations: WorkStation[] = [];
  private _recipeBook!: RecipeBook;
  private _orderSystem!: OrderSystem;
  private _customerSystem!: CustomerSystem;
  private _scoreSystem!: ScoreSystem;
  private _levelConfig!: LevelConfig;
  private _serviceTimer: number = 0;
  private _serviceActive: boolean = false;

  // Tutorial state
  private _tutorialShown: Set<string> = new Set();
  private _tutorialBg: Phaser.GameObjects.Rectangle | null = null;
  private _tutorialText: Phaser.GameObjects.Text | null = null;
  private _tutorialDismissTimer: Phaser.Time.TimerEvent | null = null;
  private _tutorialKeyListener: (() => void) | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { level: number }): void {
    const level = data.level ?? 1;
    this._levelConfig = LEVELS[level - 1] ?? LEVELS[0];
  }

  create(): void {
    // Draw floor
    this._drawFloor();

    // Create systems
    this._recipeBook = new RecipeBook();

    // Create stations
    this._createStations();

    // Create tables
    this._createTables();

    // Create player (center of kitchen area)
    this._player = new Player(this, GAME_WIDTH * 0.65, GAME_HEIGHT * 0.5);
    this._player.setStations(this._stations);
    this._player.setTables(this._tables);

    // Set up physics collisions
    const stationGroup = this.physics.add.staticGroup();
    for (const station of this._stations) {
      const body = station.body as Phaser.Physics.Arcade.StaticBody;
      if (body) stationGroup.add(station);
    }

    const tableGroup = this.physics.add.staticGroup();
    for (const table of this._tables) {
      const body = table.body as Phaser.Physics.Arcade.StaticBody;
      if (body) tableGroup.add(table);
    }

    // Create game systems
    this._orderSystem = new OrderSystem(
      this.game.events,
      this._recipeBook,
      this._levelConfig.recipes,
    );

    this._scoreSystem = new ScoreSystem(this.game.events);

    const hostStandX = TILE_SIZE * 3;
    const hostStandY = GAME_HEIGHT - TILE_SIZE * 2;

    this._customerSystem = new CustomerSystem(
      this,
      this._tables,
      this._orderSystem,
      this._levelConfig.customerSpawnIntervalMs,
      hostStandX,
      hostStandY,
    );

    // Service timer
    this._serviceTimer = this._levelConfig.serviceTimeMs;
    this._serviceActive = true;

    // Draw host stand marker — a distinct podium shape
    const standW = TILE_SIZE * 2;
    const standH = TILE_SIZE * 1.2;
    this.add.rectangle(hostStandX, hostStandY, standW, standH, 0x553377)
      .setStrokeStyle(3, 0x8866aa);
    // Small top ledge
    this.add.rectangle(hostStandX, hostStandY - standH / 2 - 3, standW + 8, 6, 0x7744aa)
      .setStrokeStyle(1, 0x9966cc);
    this.add.text(hostStandX, hostStandY - 5, 'HOST', {
      fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(hostStandX, hostStandY + 8, 'WAIT HERE', {
      fontSize: '7px', color: '#ccbbee',
    }).setOrigin(0.5);

    // Draw wall divider between kitchen and dining with service window gap
    const dividerX = GAME_WIDTH * 0.42;
    const wallThickness = 10;
    const gapHeight = TILE_SIZE * 3; // 3-tile-wide opening
    const gapCenterY = GAME_HEIGHT / 2;
    const upperWallHeight = gapCenterY - gapHeight / 2;
    const lowerWallTop = gapCenterY + gapHeight / 2;
    const lowerWallHeight = GAME_HEIGHT - lowerWallTop;

    // Upper wall segment
    this.add.rectangle(dividerX, upperWallHeight / 2, wallThickness, upperWallHeight, 0x444444)
      .setStrokeStyle(1, 0x555555);
    // Lower wall segment
    this.add.rectangle(dividerX, lowerWallTop + lowerWallHeight / 2, wallThickness, lowerWallHeight, 0x444444)
      .setStrokeStyle(1, 0x555555);
    // Gap frame top edge
    this.add.rectangle(dividerX, gapCenterY - gapHeight / 2, wallThickness + 8, 4, 0x888888);
    // Gap frame bottom edge
    this.add.rectangle(dividerX, gapCenterY + gapHeight / 2, wallThickness + 8, 4, 0x888888);
    // Service window label
    this.add.text(dividerX, gapCenterY - gapHeight / 2 - 10, 'SERVICE WINDOW', {
      fontSize: '8px', color: '#aaaaaa', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Launch HUD
    this.scene.launch('HUDScene', {
      level: this._levelConfig.level,
      serviceTimeMs: this._levelConfig.serviceTimeMs,
    });

    // Set world bounds
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Tutorial prompts for Level 1
    if (this._levelConfig.level === 1) {
      this._setupTutorial();
    }
  }

  update(time: number, delta: number): void {
    if (!this._serviceActive) return;

    this._serviceTimer -= delta;

    if (this._serviceTimer <= 0) {
      this._serviceTimer = 0;
      this._serviceActive = false;
      this._endService();
      return;
    }

    this.game.events.emit(EVENTS.SERVICE_TIMER_UPDATE, this._serviceTimer);

    this._player.update(delta);
    this._customerSystem.update(time, delta);
    this._orderSystem.update(delta);
    this._scoreSystem.update(delta);

    for (const table of this._tables) {
      table.update(time, delta);
    }

    for (const station of this._stations) {
      station.update(time, delta);
    }
  }

  private _drawFloor(): void {
    // Dining room floor (left side)
    this.add.rectangle(
      GAME_WIDTH * 0.21, GAME_HEIGHT / 2,
      GAME_WIDTH * 0.42, GAME_HEIGHT,
      COLORS.FLOOR_DINING,
    );

    // Kitchen floor (right side)
    this.add.rectangle(
      GAME_WIDTH * 0.71, GAME_HEIGHT / 2,
      GAME_WIDTH * 0.58, GAME_HEIGHT,
      COLORS.FLOOR_KITCHEN,
    );
  }

  private _createStations(): void {
    const kitchenLeft = GAME_WIDTH * 0.5;
    const kitchenRight = GAME_WIDTH - TILE_SIZE * 2;

    // Chop stations (x2)
    this._stations.push(new ChopStation(this, kitchenLeft + TILE_SIZE * 2, TILE_SIZE * 2));
    this._stations.push(new ChopStation(this, kitchenLeft + TILE_SIZE * 5, TILE_SIZE * 2));

    // Cook stations (x2)
    this._stations.push(new CookStation(this, kitchenLeft + TILE_SIZE * 2, TILE_SIZE * 5));
    this._stations.push(new CookStation(this, kitchenLeft + TILE_SIZE * 5, TILE_SIZE * 5));

    // Plate station (x1)
    this._stations.push(new PlateStation(
      this,
      kitchenLeft + TILE_SIZE * 2, TILE_SIZE * 8,
      this._recipeBook,
      this._levelConfig?.recipes ?? ['salad', 'burger'],
    ));

    // Trash station (x1)
    this._stations.push(new TrashStation(this, kitchenLeft + TILE_SIZE * 5, TILE_SIZE * 8));

    // Ingredient shelves along right wall
    const shelfX = kitchenRight;
    const ingredients: ItemType[] = [
      ItemType.Lettuce,
      ItemType.Tomato,
      ItemType.RawPatty,
      ItemType.Bun,
      ItemType.RawNoodles,
      ItemType.Sauce,
      ItemType.RawSteak,
      ItemType.RawVeggies,
      ItemType.RawPizza,
      ItemType.RawBroth,
    ];

    ingredients.forEach((ingredient, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      this._stations.push(new IngredientShelf(
        this,
        shelfX - col * TILE_SIZE * 2.5,
        TILE_SIZE * 2 + row * TILE_SIZE * 2,
        ingredient,
      ));
    });
  }

  private _createTables(): void {
    for (let i = 0; i < this._levelConfig.tables.length; i++) {
      const tp = this._levelConfig.tables[i];
      const table = new Table(
        this,
        tp.x * TILE_SIZE + TILE_SIZE,
        tp.y * TILE_SIZE + TILE_SIZE,
        i,
        tp.seats,
      );
      this._tables.push(table);
    }
  }

  private _setupTutorial(): void {
    // Initial movement prompt after 1 second
    this.time.delayedCall(1000, () => {
      this._showTutorial('move', 'Use WASD to move. Approach stations and press SPACE to interact.');
    });

    // After first customer is seated
    this.game.events.on(EVENTS.CUSTOMER_SEATED, () => {
      this._showTutorial('seated', 'A customer is seated! Pick up ingredients from the shelves on the right.');
    });

    // After first order is created
    this.game.events.on(EVENTS.ORDER_CREATED, () => {
      this._showTutorial('order', 'Check the order at the top. Chop and cook ingredients, then plate them!');
    });

    // After first order is completed
    this.game.events.on(EVENTS.ORDER_COMPLETED, () => {
      this._showTutorial('completed', 'Great job! Keep serving customers before the timer runs out!');
    });
  }

  private _showTutorial(key: string, text: string): void {
    if (this._tutorialShown.has(key)) return;
    this._tutorialShown.add(key);

    // Dismiss any existing tutorial prompt first
    this._dismissTutorial();

    const padding = 16;
    const bgWidth = GAME_WIDTH - 80;
    const bgHeight = 48;
    const bgX = GAME_WIDTH / 2;
    const bgY = GAME_HEIGHT - 50;

    this._tutorialBg = this.add.rectangle(bgX, bgY, bgWidth, bgHeight, 0x000000)
      .setAlpha(0.75)
      .setDepth(1000);

    this._tutorialText = this.add.text(bgX, bgY, text, {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: bgWidth - padding * 2 },
    }).setOrigin(0.5).setDepth(1001);

    // Auto-dismiss after 5 seconds
    this._tutorialDismissTimer = this.time.delayedCall(5000, () => {
      this._dismissTutorial();
    });

    // Dismiss on any key press
    const dismiss = (): void => {
      this._dismissTutorial();
    };
    this._tutorialKeyListener = dismiss;
    this.input.keyboard?.once('keydown', dismiss);
  }

  private _dismissTutorial(): void {
    if (this._tutorialBg) {
      this._tutorialBg.destroy();
      this._tutorialBg = null;
    }
    if (this._tutorialText) {
      this._tutorialText.destroy();
      this._tutorialText = null;
    }
    if (this._tutorialDismissTimer) {
      this._tutorialDismissTimer.destroy();
      this._tutorialDismissTimer = null;
    }
    if (this._tutorialKeyListener) {
      this.input.keyboard?.off('keydown', this._tutorialKeyListener);
      this._tutorialKeyListener = null;
    }
  }

  private _endService(): void {
    this.game.events.emit(EVENTS.SERVICE_END);
    this._customerSystem.destroy();
    this._scoreSystem.destroy();

    this.scene.stop('HUDScene');
    this.scene.start('ResultScene', {
      level: this._levelConfig.level,
      score: this._scoreSystem.score,
      ordersCompleted: this._scoreSystem.ordersCompleted,
      ordersFailed: this._scoreSystem.ordersFailed,
      totalTips: this._scoreSystem.totalTips,
      stars: this._scoreSystem.getStarRating(this._levelConfig.starThresholds),
    });
  }
}
