import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExerciseTableRowService {
  /**
   * Findet das `HTMLSelectElement` für die Übungskategorie innerhalb der Tabellenzeile.
   *
   * @param element Das Ausgangselement innerhalb der Tabellenzeile.
   * @returns Das gefundene `HTMLSelectElement` oder null, falls nicht gefunden.
   */
  static getExerciseCategorySelector(element: HTMLElement): HTMLSelectElement | null {
    return this.findClosestElementInRow(element, '.exercise-category-selector') as HTMLSelectElement | null;
  }

  /**
   * Findet das `HTMLInputElement` für die Gewichtseingabe innerhalb der Tabellenzeile.
   *
   * @param element Das Ausgangselement innerhalb der Tabellenzeile.
   * @returns Das gefundene `HTMLInputElement` oder null, falls nicht gefunden.
   */
  static getWeightInput(element: HTMLElement): HTMLInputElement | null {
    return this.findClosestElementInRow(element, '.weight') as HTMLInputElement | null;
  }

  /**
   * Findet das `HTMLInputElement` für die Anzahl der Sätze innerhalb der Tabellenzeile.
   *
   * @param element Das Ausgangselement innerhalb der Tabellenzeile.
   * @returns Das gefundene `HTMLInputElement` oder null, falls nicht gefunden.
   */
  static getSetInput(element: HTMLElement): HTMLInputElement | null {
    return this.findClosestElementInRow(element, '.sets') as HTMLInputElement | null;
  }

  private static findClosestElementInRow(element: HTMLElement, selector: string): HTMLElement | null {
    return element.closest('tr')?.querySelector(selector) as HTMLElement | null;
  }
}
