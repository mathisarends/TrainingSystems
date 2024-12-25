import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toDropdownOptionsFromStrings',
  standalone: true,
})
export class ToDropDownStringOptionsPipe implements PipeTransform {
  /**
   * Transforms a list of strings or numbers into a list of dropdown options.
   * @param items - The list of strings or numbers to be transformed.
   * @returns A new array of objects with value and label fields.
   */
  transform(items: (string | number)[]): { value: string | number; label: string }[] {
    if (!items || !Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      value: item,
      label: item.toString(),
    }));
  }
}
