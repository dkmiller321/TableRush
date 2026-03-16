import Phaser from 'phaser';
import { COLORS } from '../../config';
import { StationType, ItemType, HoldableItem } from '../../types/Recipe';
import { WorkStation } from '../WorkStation';

const ALL_ITEM_TYPES: ItemType[] = [
  ItemType.RawPatty, ItemType.CookedPatty, ItemType.BurnedFood,
  ItemType.Lettuce, ItemType.ChoppedLettuce, ItemType.Tomato, ItemType.ChoppedTomato,
  ItemType.RawNoodles, ItemType.CookedNoodles, ItemType.Sauce, ItemType.Bun,
  ItemType.RawSteak, ItemType.CookedSteak, ItemType.RawVeggies, ItemType.ChoppedVeggies,
  ItemType.RawPizza, ItemType.CookedPizza, ItemType.RawBroth, ItemType.CookedBroth,
  ItemType.Plate,
];

export class TrashStation extends WorkStation {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(
      scene, x, y,
      StationType.Trash,
      ALL_ITEM_TYPES,
      COLORS.TRASH_STATION,
      'TRASH',
    );
  }

  onInteract(heldItem: HoldableItem | null): HoldableItem | null {
    if (heldItem) {
      return null;
    }
    return null;
  }

  update(_time: number, _delta: number): void {
    // Trash station has no timed behavior
  }
}
