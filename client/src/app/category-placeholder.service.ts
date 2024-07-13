import { Injectable } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { FormService } from './form.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryPlaceholderService {
  constructor(private formService: FormService) {}

  handlePlaceholderCategory(
    selectors: NodeListOf<HTMLSelectElement>,
    renderer: Renderer2
  ): void {
    selectors.forEach((categorySelector) => {
      const category = categorySelector.value;
      if (category === '- Bitte Auswählen -' || category === undefined) {
        renderer.setStyle(categorySelector, 'opacity', '0');
      }
    });
  }

  updatePlaceholderVisibility(
    target: HTMLSelectElement,
    renderer: Renderer2
  ): void {
    renderer.setStyle(
      target,
      'opacity',
      target.value !== '- Bitte Auswählen -' ? '1' : '0'
    );
  }

  onCategoryChange(
    event: Event,
    exerciseCategories: string[],
    defaultRepSchemeByCategory: { [key: string]: any },
    renderer: Renderer2
  ): void {
    const target = event.target as HTMLSelectElement;
    const category = target.value;
    const tableRow = target.closest('tr');

    if (tableRow) {
      this.formService.addChange(target.name, target.value);

      const exerciseNameSelectors = tableRow.querySelectorAll(
        '.exercise-name-selector'
      ) as NodeListOf<HTMLSelectElement>;

      this.updateCategoryStyles(
        target,
        category,
        exerciseNameSelectors,
        exerciseCategories,
        renderer
      );

      const displaySelector = tableRow.querySelector(
        '.exercise-name-selector:not([style*="display: none"])'
      ) as HTMLSelectElement;
      if (displaySelector) {
        displaySelector.dispatchEvent(new Event('change', { bubbles: true })); // this might be necessary depending on your logic
      }

      this.updateInputValues(tableRow, category, defaultRepSchemeByCategory);
    }
  }

  private updateCategoryStyles(
    target: HTMLSelectElement,
    category: string,
    exerciseNameSelectors: NodeListOf<HTMLSelectElement>,
    exerciseCategories: string[],
    renderer: Renderer2
  ): void {
    if (category === '- Bitte Auswählen -') {
      renderer.setStyle(target, 'opacity', '0');
      exerciseNameSelectors.forEach((selector) => {
        renderer.setStyle(selector, 'display', 'none');
        selector.disabled = false;
      });
    } else {
      renderer.setStyle(target, 'opacity', '1');
      const index = exerciseCategories.indexOf(category);
      exerciseNameSelectors.forEach((selector, i) => {
        renderer.setStyle(selector, 'display', i === index ? 'block' : 'none');
        renderer.setStyle(selector, 'opacity', i === index ? '1' : '0');
        selector.disabled = i !== index;
      });
    }
  }

  private updateInputValues(
    tableRow: Element,
    category: string,
    defaultRepSchemeByCategory: { [key: string]: any }
  ): void {
    const setsInput = tableRow.querySelector('.sets') as HTMLInputElement;
    const repsInput = tableRow.querySelector('.reps') as HTMLInputElement;
    const targetRPEInput = tableRow.querySelector(
      '.targetRPE'
    ) as HTMLInputElement;

    if (category !== '- Bitte Auswählen -') {
      const defaultValues = defaultRepSchemeByCategory[category];
      if (defaultValues) {
        setsInput.value = defaultValues.defaultSets.toString();
        repsInput.value = defaultValues.defaultReps.toString();
        targetRPEInput.value = defaultValues.defaultRPE.toString();
      }
    } else {
      setsInput.value = '';
      repsInput.value = '';
      targetRPEInput.value = '';
    }

    this.formService.addChange(setsInput.name, setsInput.value);
    this.formService.addChange(repsInput.name, repsInput.value);
    this.formService.addChange(targetRPEInput.name, targetRPEInput.value);
  }
}
