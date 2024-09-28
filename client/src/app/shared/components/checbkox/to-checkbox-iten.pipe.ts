import { Pipe, PipeTransform } from '@angular/core';
import { CheckboxItem } from './checkbox-item';

@Pipe({
  name: 'toCheckboxItem',
  standalone: true,
})
export class ToCheckboxItemPipe implements PipeTransform {
  /**
   * Transforms the filtered items into an array of CheckboxItem objects.
   *
   * @param items - The filtered items to transform.
   * @param selectedItems - The currently selected items to determine isChecked state.
   * @returns Array of CheckboxItem objects.
   */
  transform(items: string[], selectedItems: string[]): CheckboxItem[] {
    return items.map((item) => ({
      label: item,
      isChecked: selectedItems.includes(item),
    }));
  }
}
