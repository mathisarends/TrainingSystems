import { Injectable } from '@angular/core';

/**
 * Service for parsing and validating input strings containing numeric values,
 * and calculating rounded averages based on a specified step.
 *
 * This service is designed to process input strings where numeric values are separated
 * by spaces, clean up any unnecessary spaces, and handle decimal inputs with a configurable step for rounding.
 * It ensures that the input is valid and returns only properly formatted numeric values.
 */
@Injectable({
  providedIn: 'root',
})
export class InputParsingService {
  private delimiter: string = ' ';

  /**
   * Parses the input string into an array of numeric values.
   */
  parseInputValues(input: string): number[] {
    const cleanedValue = input.replace(/\s+/g, ' ').trim();

    return cleanedValue
      .split(' ')
      .map((value) => parseFloat(value.trim().replace(',', '.')))
      .filter((value) => !isNaN(value));
  }

  /**
   * Calculates the rounded average of the input values using a specified step.
   */
  calculateRoundedAverage(values: number[], step: number): number {
    const sum = values.reduce((acc, curr) => acc + curr, 0);
    const average = sum / values.length;
    return Math.round(average / step) * step;
  }

  validateInput(input: string): string {
    return input
      .split(this.delimiter)
      .map((value) => value.trim().replace(',', '.'))
      .filter((value) => !isNaN(parseFloat(value)))
      .join(this.delimiter);
  }
}
