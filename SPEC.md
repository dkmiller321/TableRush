# SPEC.md — TableRush: Kitchen Chaos

> A top-down, multiplayer-inspired restaurant management game built with Phaser 3 + TypeScript.
> Fuses Overcooked's kitchen chaos with Diner Dash's front-of-house table service loop.

---

## 1. Product Vision

TableRush is a single-player (with optional 2-player local co-op) restaurant game where the player
manages both the kitchen and dining room under time pressure. Each round is a "service" — tables
fill with hungry customers, orders are taken, food is prepared through a multi-step kitchen pipeline,
and dishes are delivered before patience meters expire. Score is measured in tips, stars, and combo
multipliers.

The core tension: **do you finish the dish that's almost ready, or go seat the customers who just
walked in?**

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Game engine | Phaser 3.60+ | All-code, browser-based, TypeScript-native |
| Language | TypeScript 5.x | Type safety, Claude Code friendly |
| Build tool | Vite | Fast HMR, simple Phaser config |
| State management | Plain TypeScript classes | No external dependency needed |
| Asset format | PNG spritesheets + Tiled JSON tilemaps | Standard Phaser workflow |
| Deployment | Vite build → static HTML | Host anywhere (GitHub Pages, Vercel) |

**No React wrapper needed.** Phaser owns the canvas. A plain HTML shell is sufficient.

---

## 3. Project Structure

```
tablerush/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/
│   └── assets/
│       ├── tilemaps/
│       │   └── restaurant.json       # Tiled tilemap
│       ├── tilesets/
│       │   └── kitchen_tiles.png
│       ├── sprites/
│       │   ├── player.png            # 4-dir walk spritesheet
│       │   ├── customers.png         # Customer idle/eat/angry states
│       │   ├── ingredients.png       # Food items
│       │   └── ui.png               # HUD elements
│       └── audio/
│           ├── bgm.mp3
│           └── sfx/
│               ├── pickup.wav
│               ├── plate.wav
│               └── tip.wav
└── src/
    ├── main.ts                       # Phaser game config entry point
    ├── config.ts                     # Game constants
    ├── scenes/
    │   ├── BootScene.ts              # Asset preload
    │   ├── MenuScene.ts              # Main menu
    │   ├── GameScene.ts              # Core gameplay
    │   ├── HUDScene.ts               # Overlay HUD (runs in parallel)
    │   └── ResultScene.ts            # End-of-service summary
    ├── objects/
    │   ├── Player.ts                 # Player controller (keyboard/gamepad)
    │   ├── Customer.ts               # Customer FSM
    │   ├── Table.ts                  # Table state manager
    │   ├── WorkStation.ts            # Base class for all kitchen stations
    │   ├── stations/
    │   │   ├── ChopStation.ts
    │   │   ├── CookStation.ts
    │   │   ├── PlateStation.ts
    │   │   └── TrashStation.ts
    │   └── OrderTicket.ts            # Order data container
    ├── systems/
    │   ├── OrderSystem.ts            # Order generation + queue management
    │   ├── CustomerSystem.ts         # Customer spawn + patience
    │   ├── ScoreSystem.ts            # Tip + combo calculation
    │   └── RecipeBook.ts             # Recipe definitions
    ├── ui/
    │   ├── PatienceBar.ts            # Per-customer timer widget
    │   ├── OrderBoard.ts             # Kitchen ticket display
    │   ├── ScoreDisplay.ts
    │   └── TipPopup.ts               # Floating tip animation
    └── types/
        ├── Recipe.ts
        ├── OrderState.ts
        └── GameConfig.ts
```

---

## 4. Core Game Loop

```
SERVICE START
    │
    ▼
[CustomerSystem] spawns wave of customers → they walk to HOST STAND
    │
    ▼
Player picks up CUSTOMER GROUP → escorts to OPEN TABLE
    │
    ▼
TABLE STATE: Seated → OrderSystem generates order ticket
    │
    ▼
Player picks up ORDER TICKET → carries to KITCHEN ORDER BOARD
    │
    ▼
Player assembles dish through STATION PIPELINE:
  ChopStation → CookStation → PlateStation
    │
    ▼
Player picks up PLATED DISH → delivers to correct TABLE
    │
    ▼
[ScoreSystem] calculates tip based on patience remaining + combo
    │
    ▼
TABLE STATE: Eating (timer) → Done → Player clears table → Ready
    │
    ▼
Loop until SERVICE TIMER hits zero → ResultScene
```

---

## 5. Scene Specifications

### 5.1 BootScene
- Preloads all assets (tilemaps, spritesheets, audio, fonts)
- Shows loading bar with logo
- Transitions to MenuScene on complete

### 5.2 MenuScene
- Title logo + animated background (idle kitchen)
- Options: Start Game, How to Play, Settings (SFX/Music toggle)
- Keyboard and mouse/touch support

### 5.3 GameScene (PRIMARY)
See Section 6 for full breakdown.

### 5.4 HUDScene
- Runs as a parallel scene overlaid on GameScene
- Displays: Service timer, current score, active order tickets, combo counter
- OrderBoard widget: Shows all open tickets with station progress indicators
- Communicates with GameScene via Phaser event emitter

### 5.5 ResultScene
- End-of-service summary: orders completed, tables served, total tips, star rating (1–3)
- Animated tip counter
- Options: Retry, Next Level, Main Menu

---

## 6. GameScene — Detailed Spec

### 6.1 Map Layout (Tiled JSON)

Two zones separated by a service counter/window:

**Dining Room (left/bottom half):**
- 4–6 tables (2- and 4-seat variants)
- Host stand near entrance
- Customer entry/exit path

**Kitchen (right/top half):**
- ChopStation (×2)
- CookStation (×2, with cook timer progress bar)
- PlateStation (×1)
- TrashStation (×1, for burned/wrong items)
- Ingredient shelves (×4, one per ingredient type)
- Order board on kitchen-side of counter window

**Service Window:**
- Player crosses through opening to move between zones
- Plated dishes placed here to "carry" across (optional design: player carries dish sprite)

### 6.2 Player (Player.ts)

```typescript
interface PlayerState {
  position: Phaser.Math.Vector2;
  direction: 'up' | 'down' | 'left' | 'right';
  speed: number;                    // default: 160px/s
  holding: HoldableItem | null;     // one item at a time
  isInteracting: boolean;
}
```

Controls:
- WASD / Arrow keys: movement
- Space / E: interact with nearest station or pickup
- X / Q: drop held item

Player animation states: idle-{dir}, walk-{dir}, hold-{dir} (4 directions each)

Collision: Phaser arcade physics, static group for walls/furniture

### 6.3 Customer FSM (Customer.ts)

```
States: Waiting → Seated → Ordering → WaitingForFood → Eating → Leaving
```

- **Waiting**: At host stand, patience meter starts. Expires → customer leaves angry (tip penalty)
- **Seated**: At table, brief menu-read pause
- **Ordering**: Ticket appears above table head, player must pick it up
- **WaitingForFood**: Patience meter active (longest phase). Tier-based: green → yellow → red
- **Eating**: No patience meter. Fixed duration (8–12s)
- **Leaving**: Walk animation to exit. Drop tip coin on table for player to collect (optional mechanic)

Patience multiplier → tip calculation:
```
tip = baseTip * (patienceRemaining / maxPatience) * comboMultiplier
```

### 6.4 WorkStation Base Class

```typescript
abstract class WorkStation {
  stationType: StationType;
  isOccupied: boolean;
  progress: number;                 // 0–1, for cook/chop timers
  acceptedInputs: ItemType[];
  output: ItemType;

  abstract onInteract(player: Player, item: HoldableItem | null): void;
  abstract update(delta: number): void;
}
```

Station behaviors:
- **ChopStation**: Player holds interact key, progress bar fills over 2s, releases chopped ingredient
- **CookStation**: Player places ingredient, auto-cooks over 5s (burns at 7s → trash required), emits smoke particle at 6s warning
- **PlateStation**: Combines chopped + cooked items matching a recipe → creates Plate item
- **TrashStation**: Accepts any item, destroys it (for burned food or wrong ingredients)

### 6.5 Recipe System (RecipeBook.ts)

```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: ItemType[];          // required items on plate
  prepSteps: PrepStep[];            // ordered station sequence
  baseScore: number;
  cookTime: number;                 // seconds at CookStation
  icon: string;                     // sprite frame key
}
```

**Starter recipes (Level 1–2):**
| Dish | Steps |
|---|---|
| Salad | Chop lettuce → Chop tomato → Plate |
| Burger | Chop lettuce → Cook patty → Plate (bun from shelf) |
| Pasta | Cook noodles → Plate (sauce from shelf) |

**Advanced recipes (Level 3+):**
| Dish | Steps |
|---|---|
| Steak | Cook steak (longer timer) → Plate (no chop) |
| Pizza | Chop veggies → Cook pizza → Plate |
| Soup | Cook broth → Chop veg → Cook again → Plate |

### 6.6 Order System (OrderSystem.ts)

- Generates orders based on current level recipe pool
- Max simultaneous open tickets: 4
- Ticket display: OrderBoard shows ingredient icons + station progress
- Tickets color-coded by urgency (matches customer patience state)
- Failed order (customer leaves): ticket cleared, penalty applied

### 6.7 Scoring (ScoreSystem.ts)

```typescript
interface ScoreEvent {
  type: 'tip' | 'bonus' | 'penalty';
  amount: number;
  combo: number;
  position: Phaser.Math.Vector2;   // for floating text spawn
}
```

- Combo multiplier: consecutive successful deliveries, resets on any failure
- Star rating thresholds configurable per level in GameConfig
- End score = sum of all tips + bonuses - penalties

---

## 7. Level Progression

| Level | Tables | Recipes | Service Time | Notes |
|---|---|---|---|---|
| 1 | 3 | Salad, Burger | 3 min | Tutorial prompts, slow customers |
| 2 | 4 | + Pasta | 3 min | Faster customer spawn |
| 3 | 5 | + Steak | 2.5 min | Burned food mechanic introduced |
| 4 | 6 | + Pizza | 2.5 min | Mix of 2- and 4-seat tables |
| 5 | 6 | + Soup | 2 min | Rush hour: burst spawns |

Levels defined as JSON config, not hardcoded.

---

## 8. Audio Design

- Background music: upbeat jazz/kitchen ambience loop, tempo increases at 60s remaining
- SFX events: chop, sizzle, plate clink, cash register (tip), buzzer (burn), door bell (customer enter)
- All audio toggleable via settings

---

## 9. Visual Style

- **Camera**: Top-down, fixed (no scroll on small map), slight zoom on larger levels
- **Tile size**: 32×32px
- **Art style**: Bright, saturated colors. Thick outlines. Slightly cartoonish.
- **UI**: Clean, minimal overlays. Ticket board styled as physical paper slips.
- **Particles**: Steam from cook stations, sparkle on tip collection, smoke on burn warning

---

## 10. Non-Goals (Out of Scope for v1)

- Online multiplayer (local co-op only)
- Procedural map generation
- Mobile touch controls (keyboard/gamepad only)
- Save/load system (session-based scoring only)
- Unlockable cosmetics or meta-progression

---

## 11. Definition of Done

- [ ] All 5 levels playable from menu to result screen
- [ ] All recipes functional through full station pipeline
- [ ] Customer patience + tip calculation correct
- [ ] HUD correctly reflects all game state in real time
- [ ] No console errors during normal play session
- [ ] Runs at 60fps on a mid-range laptop in Chrome
- [ ] Build produces static HTML deployable to Vercel/GitHub Pages
