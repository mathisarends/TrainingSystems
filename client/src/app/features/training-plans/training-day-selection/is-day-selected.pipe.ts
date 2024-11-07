import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isDaySelected',
  standalone: true,
})
export class IsDaySelectedPipe implements PipeTransform {
  transform(day: string, selectedDays: Set<string>): boolean {
    return selectedDays.has(day);
  }
}
