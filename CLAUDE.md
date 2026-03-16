# CLAUDE.md — TableRush: Kitchen Chaos
## Claude Code Governance Document

This file defines how Claude Code should behave when working on this codebase.
Read this before generating any code, scaffolding, or modifications.

---

## Project Identity

**Game:** TableRush — Overcooked × Diner Dash hybrid
**Engine:** Phaser 3.60+ with TypeScript
**Build:** Vite
**Entry:** `src/main.ts`
**Canonical spec:** `SPEC.md` — treat it as ground truth for all game design decisions

---

## Architecture Rules

### Scene Communication
- GameScene and HUDScene communicate ONLY via `this.game.events` (global event emitter)
- Never pass direct references between scenes
- Event names must be defined as constants in `src/config.ts` under `EVENTS`

```typescript
// src/config.ts
export const EVENTS = {
  ORDER_CREATED: 'order:created',
  ORDER_COMPLETED: 'order:completed',
  SCORE_UPDATED: 'score:updated',
  CUSTOMER_SEATED: 'customer:seated',
  CUSTOMER_LEFT: 'customer:left',
  // etc.
} as const;
```

### State Ownership
- **GameScene** owns: all game objects, physics, world state
- **HUDScene** owns: all UI display, reads state via events only
- **Systems** (OrderSystem, ScoreSystem, CustomerSystem) are plain TypeScript classes, NOT Phaser GameObjects
- Systems are instantiated in GameScene and updated in GameScene's `update()` loop

### Object Hierarchy
```
GameScene
  ├── Player (extends Phaser.Physics.Arcade.Sprite)
  ├── CustomerSystem (plain class, manages Customer pool)
  │   └── Customer[] (extends Phaser.Physics.Arcade.Sprite)
  ├── OrderSystem (plain class)
  │   └── OrderTicket[] (plain data objects, not sprites)
  ├── ScoreSystem (plain class)
  ├── WorkStation[] (extends Phaser.GameObjects.Container)
  │   └── stations/ChopStation, CookStation, PlateStation, TrashStation
  └── Table[] (extends Phaser.GameObjects.Container)
```

### No Singletons
- Do not use module-level singletons or global state
- Pass system references as constructor arguments where needed
- Use Phaser's scene registry (`this.registry`) only for cross-scene read-only data (level config, settings)

---

## TypeScript Rules

### Strict Mode
`tsconfig.json` must have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### No `any`
- Never use `any` type. Use `unknown` with type guards if type is truly unknown.
- All Phaser callbacks must be properly typed (use Phaser type definitions)

### Enums for Game State
```typescript
// Use const enums for performance
export const enum CustomerState {
  Waiting = 'waiting',
  Seated = 'seated',
  Ordering = 'ordering',
  WaitingForFood = 'waitingForFood',
  Eating = 'eating',
  Leaving = 'leaving',
}

export const enum ItemType {
  RawPatty = 'raw_patty',
  CookedPatty = 'cooked_patty',
  Lettuce = 'lettuce',
  ChoppedLettuce = 'chopped_lettuce',
  // etc.
}
```

### Interface Over Class for Data
- Use `interface` for pure data shapes (OrderTicket data, RecipeDefinition, etc.)
- Use `class` only when behavior is needed (Player, Customer, WorkStation, etc.)

---

## Phaser-Specific Rules

### Physics
- Use **Arcade Physics** only (no Matter.js)
- World bounds set to map pixel dimensions on GameScene create()
- Player collides with: walls (static), furniture (static), tables (static)
- Customers collide with: walls (static), other customers (dynamic)
- NO physics on UI elements

### Asset Keys
All asset keys must be defined as constants in `src/config.ts`:
```typescript
export const ASSETS = {
  TILEMAP: 'restaurant_map',
  TILESET: 'kitchen_tiles',
  PLAYER: 'player',
  CUSTOMERS: 'customers',
  INGREDIENTS: 'ingredients',
  UI: 'ui_sheet',
  BGM: 'bgm',
} as const;
```
Never use raw strings for asset keys in scene files.

### Animation Keys
Follow pattern: `{sprite}_{state}_{direction}`
Examples: `player_walk_down`, `player_idle_up`, `customer_sit_idle`

### Camera
- GameScene camera: fixed, not following player (map fits screen)
- HUDScene: no camera manipulation, use fixed coordinates

### Update Loop Pattern
```typescript
// GameScene.ts
update(time: number, delta: number): void {
  this.player.update(delta);
  this.customerSystem.update(delta);
  this.orderSystem.update(delta);
  
  // WorkStations update themselves via their own Phaser update registration
  // Do NOT iterate stations manually here
}
```

---

## File Conventions

### One Class Per File
Every exported class lives in its own file. No barrel files that re-export classes.

### Import Order
1. Phaser imports
2. Internal type imports (`../../types/...`)
3. Internal config imports (`../../config`)
4. Other internal imports

### Naming
- Files: PascalCase for classes (`Player.ts`), camelCase for utilities (`scoreUtils.ts`)
- Constants: SCREAMING_SNAKE_CASE
- Interfaces: PascalCase with no `I` prefix
- Private class members: prefix with `_` underscore

---

## Game Balance Constants

All tunable numbers live in `src/config.ts` under `BALANCE`. Never hardcode them inline:

```typescript
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
  BASE_TIP: 100,
  COMBO_MULTIPLIER_INCREMENT: 0.25,
  MAX_COMBO_MULTIPLIER: 3.0,
} as const;
```

---

## What NOT to Build (v1 Scope Guard)

Do not implement any of the following unless explicitly requested:
- Online or networked multiplayer
- Mobile/touch controls
- Procedurally generated maps
- Save/load or persistent progression
- In-game cosmetics store
- Any external API calls

If a feature isn't in SPEC.md, raise a clarifying question before implementing it.

---

## Build & Run

```bash
npm install
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
```

TypeScript errors must be resolved before considering any feature complete.
Run `npx tsc --noEmit` to check types without building.

---

## Scaffolding Order (Recommended Build Sequence)

When building from scratch, follow this order to avoid dependency issues:

1. **Vite + Phaser project scaffold** — `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
2. **`src/config.ts`** — all constants, ASSETS, EVENTS, BALANCE
3. **`src/types/`** — all interfaces and enums
4. **`src/main.ts`** — Phaser game config, scene registration
5. **`src/scenes/BootScene.ts`** — asset preload only
6. **`src/scenes/MenuScene.ts`** — static menu, transitions to GameScene
7. **`src/objects/WorkStation.ts`** — base class
8. **`src/objects/stations/`** — all station implementations
9. **`src/objects/Player.ts`** — movement + interaction
10. **`src/objects/Table.ts`** — table state
11. **`src/objects/Customer.ts`** — FSM
12. **`src/systems/RecipeBook.ts`** — recipe data
13. **`src/systems/OrderSystem.ts`**
14. **`src/systems/CustomerSystem.ts`**
15. **`src/systems/ScoreSystem.ts`**
16. **`src/scenes/GameScene.ts`** — wires everything together
17. **`src/scenes/HUDScene.ts`** — UI overlay
18. **`src/ui/`** — individual HUD widgets
19. **`src/scenes/ResultScene.ts`**
20. **Level config JSON files** — define all 5 levels
21. **Polish pass** — particles, audio integration, animation tuning
