import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daySelected',
  standalone: true,
})
export class DaySelectedPipe implements PipeTransform {
  transform(day: string, trainingDays: Set<string>): boolean {
    return trainingDays.has(day);
  }
}
