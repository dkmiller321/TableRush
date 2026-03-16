import Phaser from 'phaser';
import { COLORS, TILE_SIZE } from '../../config';
import { StationType, ItemType, HoldableItem, makeItem, ITEM_LABELS } from '../../types/Recipe';
import { WorkStation } from '../WorkStation';

export class IngredientShelf extends WorkStation {
  private _ingredientType: ItemType;

  constructor(scene: Phaser.Scene, x: number, y: number, ingredientType: ItemType) {
    super(
      scene, x, y,
      StationType.IngredientShelf,
      [],
      COLORS.INGREDIENT_SHELF,
      ITEM_LABELS[ingredientType] ?? ingredientType,
    );
    this._ingredientType = ingredientType;
    this._label.setFontSize(8);
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (!heldItem) {
      return makeItem(this._ingredientType);
    }
    return heldItem;
  }

  update(_time: number, _delta: number): void {
    // Shelves have no timed behavior
  }
}
