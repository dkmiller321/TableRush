import Phaser from 'phaser';
import { COLORS } from '../../config';
import { StationType, ItemType, HoldableItem, makeItem } from '../../types/Recipe';
import { WorkStation } from '../WorkStation';
import { RecipeBook } from '../../systems/RecipeBook';

export class PlateStation extends WorkStation {
  private _plateItems: ItemType[] = [];
  private _recipeBook: RecipeBook;
  private _availableRecipeIds: string[];
  private _itemDots: Phaser.GameObjects.Rectangle[] = [];

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    recipeBook: RecipeBook,
    availableRecipeIds: string[],
  ) {
    super(
      scene, x, y,
      StationType.Plate,
      [
        ItemType.ChoppedLettuce, ItemType.ChoppedTomato, ItemType.CookedPatty,
        ItemType.Bun, ItemType.CookedNoodles, ItemType.Sauce,
        ItemType.CookedSteak, ItemType.ChoppedVeggies, ItemType.CookedPizza,
        ItemType.CookedBroth,
      ],
      COLORS.PLATE_STATION,
      'PLATE',
    );
    this._recipeBook = recipeBook;
    this._availableRecipeIds = availableRecipeIds;
  }

  setAvailableRecipes(ids: string[]): void {
    this._availableRecipeIds = ids;
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (heldItem && this.acceptsInput(heldItem.type)) {
      this._plateItems.push(heldItem.type);
      this._isOccupied = true;
      this._updateItemDots();

      const matched = this._recipeBook.checkPlate(this._plateItems, this._availableRecipeIds);
      if (matched) {
        this._clearPlate();
        return {
          type: ItemType.Plate,
          color: matched.color,
          label: matched.name,
        };
      }

      this._label.setText(`${this._plateItems.length} items`);
      return null;
    }

    if (!heldItem && this._plateItems.length > 0) {
      this._clearPlate();
      this._label.setText('PLATE');
      return null;
    }

    return heldItem ?? null;
  }

  update(_time: number, _delta: number): void {
    // Plate station has no timed behavior
  }

  private _updateItemDots(): void {
    for (const dot of this._itemDots) {
      dot.destroy();
    }
    this._itemDots = [];

    const startX = -(this._plateItems.length - 1) * 7;
    for (let i = 0; i < this._plateItems.length; i++) {
      const dot = this.scene.add.rectangle(
        startX + i * 14, 20, 10, 10,
        0x44ff44,
      );
      dot.setStrokeStyle(1, 0xffffff);
      this.add(dot);
      this._itemDots.push(dot);
    }
  }

  private _clearPlate(): void {
    this._plateItems = [];
    this._isOccupied = false;
    for (const dot of this._itemDots) {
      dot.destroy();
    }
    this._itemDots = [];
    this._label.setText('PLATE');
  }
}
