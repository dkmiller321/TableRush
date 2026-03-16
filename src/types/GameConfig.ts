export interface LevelConfig {
  level: number;
  tableCount: number;
  recipes: string[];
  serviceTimeMs: number;
  customerSpawnIntervalMs: number;
  starThresholds: [number, number, number];
  tables: TablePlacement[];
}

export interface TablePlacement {
  x: number;
  y: number;
  seats: 2 | 4;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    tableCount: 3,
    recipes: ['salad', 'burger'],
    serviceTimeMs: 180000,
    customerSpawnIntervalMs: 10000,
    starThresholds: [200, 400, 600],
    tables: [
      { x: 2, y: 4, seats: 2 },
      { x: 2, y: 7, seats: 2 },
      { x: 2, y: 10, seats: 4 },
    ],
  },
  {
    level: 2,
    tableCount: 4,
    recipes: ['salad', 'burger', 'pasta'],
    serviceTimeMs: 180000,
    customerSpawnIntervalMs: 8000,
    starThresholds: [300, 600, 900],
    tables: [
      { x: 2, y: 3, seats: 2 },
      { x: 2, y: 6, seats: 2 },
      { x: 2, y: 9, seats: 4 },
      { x: 5, y: 6, seats: 2 },
    ],
  },
  {
    level: 3,
    tableCount: 5,
    recipes: ['salad', 'burger', 'pasta', 'steak'],
    serviceTimeMs: 150000,
    customerSpawnIntervalMs: 7000,
    starThresholds: [400, 800, 1200],
    tables: [
      { x: 2, y: 3, seats: 2 },
      { x: 2, y: 6, seats: 2 },
      { x: 2, y: 9, seats: 4 },
      { x: 5, y: 3, seats: 2 },
      { x: 5, y: 6, seats: 4 },
    ],
  },
  {
    level: 4,
    tableCount: 6,
    recipes: ['salad', 'burger', 'pasta', 'steak', 'pizza'],
    serviceTimeMs: 150000,
    customerSpawnIntervalMs: 6000,
    starThresholds: [500, 1000, 1500],
    tables: [
      { x: 2, y: 2, seats: 2 },
      { x: 2, y: 5, seats: 4 },
      { x: 2, y: 8, seats: 2 },
      { x: 2, y: 11, seats: 4 },
      { x: 5, y: 3, seats: 2 },
      { x: 5, y: 7, seats: 2 },
    ],
  },
  {
    level: 5,
    tableCount: 6,
    recipes: ['salad', 'burger', 'pasta', 'steak', 'pizza', 'soup'],
    serviceTimeMs: 120000,
    customerSpawnIntervalMs: 4000,
    starThresholds: [600, 1200, 1800],
    tables: [
      { x: 2, y: 2, seats: 4 },
      { x: 2, y: 5, seats: 2 },
      { x: 2, y: 8, seats: 4 },
      { x: 2, y: 11, seats: 2 },
      { x: 5, y: 3, seats: 4 },
      { x: 5, y: 7, seats: 2 },
    ],
  },
];
