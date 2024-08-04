import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customLowercaseReplace',
  standalone: true,
})
export class LowerCaseReplacePipe implements PipeTransform {
  transform(value: string): string {
    return value.toLowerCase().replace(/ /g, '-');
  }
}