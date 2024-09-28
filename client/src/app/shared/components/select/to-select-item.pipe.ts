import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toSelectItem',
  standalone: true,
})
export class ToSelectItemPipe implements PipeTransform {
  /**
   * Transforms an array of objects into a simplified format with id and label.
   *
   * @param items - The array of objects to transform.
   * @param idKey - The key of the object to use as id.
   * @param labelKey - The key of the object to use as label.
   * @returns Array of objects with `id` and `label` properties.
   */
  transform<T>(items: T[], idKey: keyof T, labelKey: keyof T): { id: any; label: any }[] {
    return items.map((item) => ({
      id: item[idKey],
      label: item[labelKey],
    }));
  }
}
