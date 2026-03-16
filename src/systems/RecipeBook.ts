import { BALANCE } from '../config';
import { ItemType, StationType, Recipe, PrepStep } from '../types/Recipe';

const ALL_RECIPES: Recipe[] = [
  {
    id: 'salad',
    name: 'Salad',
    ingredients: [ItemType.ChoppedLettuce, ItemType.ChoppedTomato],
    prepSteps: [
      { station: StationType.Chop, input: ItemType.Lettuce, output: ItemType.ChoppedLettuce, durationMs: BALANCE.CHOP_DURATION_MS },
      { station: StationType.Chop, input: ItemType.Tomato, output: ItemType.ChoppedTomato, durationMs: BALANCE.CHOP_DURATION_MS },
    ],
    baseScore: 80,
    color: 0x44cc44,
  },
  {
    id: 'burger',
    name: 'Burger',
    ingredients: [ItemType.ChoppedLettuce, ItemType.CookedPatty, ItemType.Bun],
    prepSteps: [
      { station: StationType.Chop, input: ItemType.Lettuce, output: ItemType.ChoppedLettuce, durationMs: BALANCE.CHOP_DURATION_MS },
      { station: StationType.Cook, input: ItemType.RawPatty, output: ItemType.CookedPatty, durationMs: BALANCE.COOK_DURATION_MS },
    ],
    baseScore: 100,
    color: 0xddaa55,
  },
  {
    id: 'pasta',
    name: 'Pasta',
    ingredients: [ItemType.CookedNoodles, ItemType.Sauce],
    prepSteps: [
      { station: StationType.Cook, input: ItemType.RawNoodles, output: ItemType.CookedNoodles, durationMs: BALANCE.COOK_DURATION_MS },
    ],
    baseScore: 90,
    color: 0xeedd88,
  },
  {
    id: 'steak',
    name: 'Steak',
    ingredients: [ItemType.CookedSteak],
    prepSteps: [
      { station: StationType.Cook, input: ItemType.RawSteak, output: ItemType.CookedSteak, durationMs: BALANCE.COOK_DURATION_MS + 2000 },
    ],
    baseScore: 150,
    color: 0x884422,
  },
  {
    id: 'pizza',
    name: 'Pizza',
    ingredients: [ItemType.ChoppedVeggies, ItemType.CookedPizza],
    prepSteps: [
      { station: StationType.Chop, input: ItemType.RawVeggies, output: ItemType.ChoppedVeggies, durationMs: BALANCE.CHOP_DURATION_MS },
      { station: StationType.Cook, input: ItemType.RawPizza, output: ItemType.CookedPizza, durationMs: BALANCE.COOK_DURATION_MS },
    ],
    baseScore: 120,
    color: 0xddaa44,
  },
  {
    id: 'soup',
    name: 'Soup',
    ingredients: [ItemType.CookedBroth, ItemType.ChoppedVeggies],
    prepSteps: [
      { station: StationType.Cook, input: ItemType.RawBroth, output: ItemType.CookedBroth, durationMs: BALANCE.COOK_DURATION_MS },
      { station: StationType.Chop, input: ItemType.RawVeggies, output: ItemType.ChoppedVeggies, durationMs: BALANCE.CHOP_DURATION_MS },
    ],
    baseScore: 130,
    color: 0x889944,
  },
];

export class RecipeBook {
  private _recipes: Map<string, Recipe> = new Map();

  constructor() {
    for (const recipe of ALL_RECIPES) {
      this._recipes.set(recipe.id, recipe);
    }
  }

  getRecipe(id: string): Recipe | undefined {
    return this._recipes.get(id);
  }

  getRecipesForLevel(recipeIds: string[]): Recipe[] {
    const result: Recipe[] = [];
    for (const id of recipeIds) {
      const r = this._recipes.get(id);
      if (r) result.push(r);
    }
    return result;
  }

  getRandomRecipe(recipeIds: string[]): Recipe {
    const available = this.getRecipesForLevel(recipeIds);
    return available[Math.floor(Math.random() * available.length)];
  }

  checkPlate(items: ItemType[], recipeIds: string[]): Recipe | null {
    const available = this.getRecipesForLevel(recipeIds);
    for (const recipe of available) {
      const needed = [...recipe.ingredients];
      let match = true;
      for (const item of items) {
        const idx = needed.indexOf(item);
        if (idx === -1) {
          match = false;
          break;
        }
        needed.splice(idx, 1);
      }
      if (match && needed.length === 0) return recipe;
    }
    return null;
  }
}
