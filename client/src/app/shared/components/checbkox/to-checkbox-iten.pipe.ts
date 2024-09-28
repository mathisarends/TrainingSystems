import { Pipe, PipeTransform } from '@angular/core';
import { isSelectOptionItem, SelectOption } from '../select/select-option-item';
import { CheckboxItem } from './checkbox-item';

@Pipe({
  name: 'toCheckboxItem',
  standalone: true,
})
export class ToCheckboxItemPipe implements PipeTransform {
  /**
   * Transforms the filtered items into an array of CheckboxItem objects.
   * If the items are strings, both `id` and `label` will be the string.
   * If the items are `SelectOptionItem` objects, the `id` and `label` are taken
   * from the object properties.
   *
   * @param items - The filtered items to transform (could be string[] or SelectOptionItem[]).
   * @param selectedItems - The currently selected items to determine isChecked state.
   * @returns Array of CheckboxItem objects.
   */
  transform(items: SelectOption[], selectedItems: SelectOption[]): CheckboxItem[] {
    return items.map((item) => {
      if (isSelectOptionItem(item)) {
        return {
          id: item.id,
          label: item.label,
          isChecked: selectedItems.includes(item.id),
        };
      } else {
        return {
          label: item,
          isChecked: selectedItems.includes(item),
        };
      }
    });
  }
}
