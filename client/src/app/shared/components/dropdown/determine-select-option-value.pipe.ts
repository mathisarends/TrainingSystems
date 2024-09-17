import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that maps option values to their corresponding labels.
 * If no labels are provided, the value itself is returned as the label.
 */
@Pipe({
  name: 'determineSelectOptionValue',
  standalone: true,
})
export class DetermineSelectOptionValuePipe implements PipeTransform {
  transform(value: string | number, labels?: (string | number)[], index?: number): string | number {
    if (labels && labels.length > index!) {
      return labels[index!];
    }
    return value;
  }
}
