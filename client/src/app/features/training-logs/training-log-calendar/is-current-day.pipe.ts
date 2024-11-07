import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isCurrentDay',
  standalone: true,
})
export class IsCurrentDayPipe implements PipeTransform {
  transform(day: number, currentMonth: number, currentYear: number): boolean {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  }
}
