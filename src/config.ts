export const ASSETS = {
  TILEMAP: 'restaurant_map',
  TILESET: 'kitchen_tiles',
  PLAYER: 'player',
  CUSTOMERS: 'customers',
  INGREDIENTS: 'ingredients',
  UI: 'ui_sheet',
  BGM: 'bgm',
} as const;

export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_COMPLETED: 'order:completed',
  ORDER_FAILED: 'order:failed',
  SCORE_UPDATED: 'score:updated',
  COMBO_UPDATED: 'combo:updated',
  CUSTOMER_SEATED: 'customer:seated',
  CUSTOMER_LEFT: 'customer:left',
  CUSTOMER_ANGRY: 'customer:angry',
  SERVICE_TIMER_UPDATE: 'service:timerUpdate',
  SERVICE_END: 'service:end',
  ITEM_PICKED_UP: 'item:pickedUp',
  ITEM_DROPPED: 'item:dropped',
  STATION_PROGRESS: 'station:progress',
  STATION_COMPLETE: 'station:complete',
  STATION_BURN_WARNING: 'station:burnWarning',
  STATION_BURNED: 'station:burned',
  TABLE_CLEARED: 'table:cleared',
  TIP_EARNED: 'tip:earned',
  ORDER_SCORE: 'order:score',
} as const;

export const BALANCE = {
  PLAYER_SPEED: 160,
  CHOP_DURATION_MS: 2000,
  COOK_DURATION_MS: 5000,
  BURN_THRESHOLD_MS: 7000,
  BURN_WARNING_MS: 6000,
  CUSTOMER_PATIENCE_MS: {
    WAITING: 15000,
    WAITING_FOR_FOOD: 45000,
  },
  EATING_DURATION_MS: 10000,
  ORDERING_DELAY_MS: 2000,
  BASE_TIP: 100,
  COMBO_MULTIPLIER_INCREMENT: 0.25,
  MAX_COMBO_MULTIPLIER: 3.0,
  MAX_OPEN_ORDERS: 4,
  CUSTOMER_SPAWN_INTERVAL_MS: 8000,
  TABLE_CLEAR_DURATION_MS: 1000,
} as const;

export const COLORS = {
  PLAYER: 0x4488ff,
  CUSTOMER: 0xff8844,
  CUSTOMER_ANGRY: 0xff2222,
  TABLE: 0x664422,
  CHOP_STATION: 0x44aa44,
  COOK_STATION: 0xaa4444,
  PLATE_STATION: 0xaaaaaa,
  TRASH_STATION: 0x444444,
  INGREDIENT_SHELF: 0x886644,
  WALL: 0x333333,
  FLOOR_KITCHEN: 0xddeedd,
  FLOOR_DINING: 0xeeddcc,
  PATIENCE_GREEN: 0x44ff44,
  PATIENCE_YELLOW: 0xffff44,
  PATIENCE_RED: 0xff4444,
  UI_BG: 0x222222,
  UI_TEXT: 0xffffff,
  HELD_ITEM_BG: 0x333355,
} as const;

export const TILE_SIZE = 32;

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
