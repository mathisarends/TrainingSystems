import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormService } from '../form/form.service';

@Injectable({
  providedIn: 'root',
})
export class AutoSaveService {
  private renderer: Renderer2;
  private listeners: (() => void)[] = []; // Array to store event listeners

  constructor(
    rendererFactory: RendererFactory2,
    private formService: FormService,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Initializes the auto-save functionality by attaching event listeners to
   * weight input fields.
   */
  initializeAutoSave(): void {
    this.clearEventListeners(); // Ensure no duplicate listeners

    const weightInputs = this.getWeightInputs();
    const form = this.getFormElement();

    weightInputs.forEach((weightInput) => {
      const listener = this.createWeightInputListener(weightInput, form);
      this.listeners.push(listener); // Store the listener for later removal
    });
  }

  /**
   * Retrieves all weight input fields from the document.
   * @returns {NodeListOf<HTMLInputElement>} The list of weight input fields.
   */
  private getWeightInputs(): NodeListOf<HTMLInputElement> {
    return document.querySelectorAll('.weight') as NodeListOf<HTMLInputElement>;
  }

  /**
   * Retrieves the form element from the document.
   * @returns {HTMLFormElement} The form element.
   */
  private getFormElement(): HTMLFormElement {
    return document.getElementById('form') as HTMLFormElement;
  }

  /**
   * Creates an event listener for a given weight input field. This listener
   * calculates the average weight, rounds it, and updates the form.
   *
   * @param {HTMLInputElement} weightInput The weight input field.
   * @param {HTMLFormElement} form The form element to be submitted.
   * @returns {() => void} The function to remove the event listener.
   */
  private createWeightInputListener(weightInput: HTMLInputElement, form: HTMLFormElement): () => void {
    return this.renderer.listen(weightInput, 'change', () => {
      const weightValues = this.parseWeightInputValues(weightInput);
      const tableRow = weightInput.closest('tr');
      const amountOfSets = Number((tableRow?.querySelector('.sets') as HTMLInputElement).value);

      if (weightValues.length === amountOfSets) {
        const roundedWeight = this.calculateRoundedWeight(weightValues);
        weightInput.value = roundedWeight.toString();
        this.formService.addChange(weightInput.name, weightInput.value);
      }
      form.dispatchEvent(new Event('submit'));
    });
  }

  /**
   * Parses the weight input field values into an array of numbers,
   * converting commas to dots before parsing to ensure valid float conversion.
   *
   * @param {HTMLInputElement} weightInput The weight input field.
   * @returns {number[]} The parsed weight values.
   */
  private parseWeightInputValues(weightInput: HTMLInputElement): number[] {
    return weightInput.value.split(';').map((value) => parseFloat(value.trim().replace(',', '.')));
  }

  /**
   * Calculates the rounded average weight from the given weight values.
   *
   * @param {number[]} weightValues The array of weight values.
   * @returns {number} The rounded average weight.
   */
  private calculateRoundedWeight(weightValues: number[]): number {
    const averageWeight = weightValues.reduce((acc, curr) => acc + curr, 0) / weightValues.length;
    return Math.round(averageWeight / 2.5) * 2.5;
  }

  /**
   * Clears all registered event listeners to avoid memory leaks and duplicate event handling.
   */
  clearEventListeners(): void {
    this.listeners.forEach((unlisten) => unlisten()); // Remove each listener
    this.listeners = []; // Clear the listeners array
  }
}
