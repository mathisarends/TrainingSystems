import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toDropDownOptions',
  standalone: true,
})
export class ToDropDownOptionsPipe implements PipeTransform {
  /**
   * Transforms a list of objects into a list of dropdown options.
   * @param items - The list of items to be transformed.
   * @param valueField - The field to use as the value.
   * @param labelField - The field to use as the label.
   * @returns A new array of objects with value and label fields.
   */
  transform<T>(items: T[], valueField: keyof T, labelField: keyof T): { value: any; label: any }[] {
    if (!items || !valueField || !labelField) {
      return [];
    }

    return items.map((item) => ({
      value: item[valueField],
      label: item[labelField],
    }));
  }
}
