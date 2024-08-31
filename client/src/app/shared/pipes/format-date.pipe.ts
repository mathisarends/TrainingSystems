import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe to format Date objects into the 'dd. MMMM yyyy, HH:mm' format.
 * If the input is undefined, it returns an empty string.
 */
@Pipe({
  name: 'formatDate',
  standalone: true,
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date | undefined): string {
    if (!value) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat('de-DE', options).format(value);
  }
}
