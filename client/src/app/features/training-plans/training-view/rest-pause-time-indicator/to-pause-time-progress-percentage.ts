import { Pipe, PipeTransform } from '@angular/core';

/**
 * A pipe that transforms the current pause time into a progress percentage.
 * It calculates the percentage of time passed based on the current time and the total time.
 */
@Pipe({
  name: 'toPauseTimeProgressPercentage',
  standalone: true,
})
export class ToPauseTimeProgressPercentagePipe implements PipeTransform {
  transform(currentTime: number, totalTime: number): number {
    if (!totalTime || totalTime === 0) {
      return 0;
    }
    return (currentTime / totalTime) * 100;
  }
}
