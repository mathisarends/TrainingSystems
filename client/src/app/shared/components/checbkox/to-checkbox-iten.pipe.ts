import { Pipe, PipeTransform } from '@angular/core';
import { CheckboxItem } from './checkbox-item';

@Pipe({
  name: 'toCheckboxItem',
  standalone: true,
})
export class ToCheckboxItemPipe implements PipeTransform {
  /**
   * Transforms the filtered items into an array of CheckboxItem objects.
   * Uses the string as both the `id` and `label` for simplicity,
   * and determines whether the checkbox should be checked based on the selectedItems.
   *
   * @param items - The filtered items to transform.
   * @param selectedItems - The currently selected items to determine isChecked state.
   * @returns Array of CheckboxItem objects.
   */
  transform(items: string[], selectedItems: string[]): CheckboxItem[] {
    return items.map((item, index) => ({
      id: item,
      label: item,
      isChecked: selectedItems.includes(item),
    }));
  }
}
