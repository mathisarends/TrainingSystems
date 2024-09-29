import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  /**
   * Transforms a date into a formatted string.
   * Format: 'Wochentag, dd.mm.yyyy hh:mm'
   *
   * @param value - The date to format.
   * @returns A string representing the formatted date.
   */
  transform(value: Date | string): string {
    const date = new Date(value);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };

    // Format: "Wochentag, dd.mm.yyyy hh:mm"
    return date.toLocaleDateString('de-DE', options).replace(',', '');
  }
}
