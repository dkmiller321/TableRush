export const enum ItemType {
  RawPatty = 'raw_patty',
  CookedPatty = 'cooked_patty',
  BurnedFood = 'burned_food',
  Lettuce = 'lettuce',
  ChoppedLettuce = 'chopped_lettuce',
  Tomato = 'tomato',
  ChoppedTomato = 'chopped_tomato',
  RawNoodles = 'raw_noodles',
  CookedNoodles = 'cooked_noodles',
  Sauce = 'sauce',
  Bun = 'bun',
  RawSteak = 'raw_steak',
  CookedSteak = 'cooked_steak',
  RawVeggies = 'raw_veggies',
  ChoppedVeggies = 'chopped_veggies',
  RawPizza = 'raw_pizza',
  CookedPizza = 'cooked_pizza',
  RawBroth = 'raw_broth',
  CookedBroth = 'cooked_broth',
  Plate = 'plate',
}

export const enum StationType {
  Chop = 'chop',
  Cook = 'cook',
  Plate = 'plate',
  Trash = 'trash',
  IngredientShelf = 'ingredient_shelf',
}

export interface PrepStep {
  station: StationType;
  input: ItemType;
  output: ItemType;
  durationMs: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: ItemType[];
  prepSteps: PrepStep[];
  baseScore: number;
  color: number;
}

export interface HoldableItem {
  type: ItemType;
  color: number;
  label: string;
}

export const ITEM_COLORS: Record<string, number> = {
  [ItemType.RawPatty]: 0x993333,
  [ItemType.CookedPatty]: 0x663300,
  [ItemType.BurnedFood]: 0x111111,
  [ItemType.Lettuce]: 0x44cc44,
  [ItemType.ChoppedLettuce]: 0x22aa22,
  [ItemType.Tomato]: 0xff3333,
  [ItemType.ChoppedTomato]: 0xcc2222,
  [ItemType.RawNoodles]: 0xeedd88,
  [ItemType.CookedNoodles]: 0xddcc44,
  [ItemType.Sauce]: 0xcc3300,
  [ItemType.Bun]: 0xddaa55,
  [ItemType.RawSteak]: 0xaa3333,
  [ItemType.CookedSteak]: 0x884422,
  [ItemType.RawVeggies]: 0x66bb66,
  [ItemType.ChoppedVeggies]: 0x44aa44,
  [ItemType.RawPizza]: 0xeecc88,
  [ItemType.CookedPizza]: 0xddaa44,
  [ItemType.RawBroth]: 0xaacc88,
  [ItemType.CookedBroth]: 0x889944,
  [ItemType.Plate]: 0xeeeeee,
};

export const ITEM_LABELS: Record<string, string> = {
  [ItemType.RawPatty]: 'Raw Patty',
  [ItemType.CookedPatty]: 'Patty',
  [ItemType.BurnedFood]: 'Burned!',
  [ItemType.Lettuce]: 'Lettuce',
  [ItemType.ChoppedLettuce]: 'Cut Lettuce',
  [ItemType.Tomato]: 'Tomato',
  [ItemType.ChoppedTomato]: 'Cut Tomato',
  [ItemType.RawNoodles]: 'Noodles',
  [ItemType.CookedNoodles]: 'Cooked Noodles',
  [ItemType.Sauce]: 'Sauce',
  [ItemType.Bun]: 'Bun',
  [ItemType.RawSteak]: 'Raw Steak',
  [ItemType.CookedSteak]: 'Steak',
  [ItemType.RawVeggies]: 'Veggies',
  [ItemType.ChoppedVeggies]: 'Cut Veggies',
  [ItemType.RawPizza]: 'Raw Pizza',
  [ItemType.CookedPizza]: 'Pizza',
  [ItemType.RawBroth]: 'Raw Broth',
  [ItemType.CookedBroth]: 'Broth',
  [ItemType.Plate]: 'Plate',
};

export function makeItem(type: ItemType): HoldableItem {
  return {
    type,
    color: ITEM_COLORS[type] ?? 0xffffff,
    label: ITEM_LABELS[type] ?? type,
  };
}
