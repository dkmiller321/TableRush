# TableRush — Claude Code Build Prompt

Paste this prompt directly into Claude Code to kick off the build.

---

## PROMPT

You are building **TableRush**, a browser-based top-down restaurant management game.
Read `SPEC.md` and `CLAUDE.md` before generating any code.

**Your task:** Scaffold the complete project following the build sequence defined in `CLAUDE.md`
Section "Scaffolding Order". Build each layer in order, running `npx tsc --noEmit` after each
major step to catch type errors before moving on.

**Start with:**
1. Initialize the Vite + Phaser 3 TypeScript project (`npm create vite@latest . -- --template vanilla-ts`, then install `phaser`)
2. Create `src/config.ts` with all ASSETS, EVENTS, and BALANCE constants as defined in CLAUDE.md
3. Create all type files in `src/types/`
4. Wire `src/main.ts` with Phaser game config and scene list
5. Implement BootScene and MenuScene as thin shells (no gameplay yet)
6. Confirm `npm run dev` starts without errors before proceeding to game objects

**After scaffold is confirmed working, proceed to:**
- WorkStation base class and all station implementations
- Player with arcade physics movement and interact system
- Table and Customer with FSM
- All three systems (OrderSystem, ScoreSystem, CustomerSystem)
- GameScene wiring all objects and systems together
- HUDScene as parallel overlay scene using event emitter for state
- ResultScene

**At each stage:**
- Run `npx tsc --noEmit` and fix all errors before proceeding
- Do not implement features outside SPEC.md scope
- All tunable numbers must reference `BALANCE` constants from config.ts
- All asset keys must reference `ASSETS` constants from config.ts
- All event names must reference `EVENTS` constants from config.ts

**Placeholder assets:**
Since real sprite assets don't exist yet, use Phaser's built-in graphics primitives to stand in:
- Player: colored rectangle (32×32, blue)
- Customers: colored rectangle (28×28, orange variants)
- Stations: colored rectangles with text labels
- Tables: dark rectangle (64×64 for 2-seat, 96×96 for 4-seat)
- Ingredients: colored circles, one color per ingredient type

This allows full game logic to be verified before art assets are added.

**Definition of done for this session:**
- All 5 scenes implemented and navigable
- Full game loop playable in Level 1 with placeholder graphics
- TypeScript compiles with zero errors
- `npm run build` produces a working dist/
