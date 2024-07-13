import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryPlaceholderService {
  constructor(private renderer: Renderer2) {}

  handlePlaceholderCategory(selectors: NodeListOf<HTMLSelectElement>): void {
    selectors.forEach((categorySelector) => {
      const category = categorySelector.value;
      if (category === '- Bitte Auswählen -' || category === undefined) {
        this.renderer.setStyle(categorySelector, 'opacity', '0');
      }
    });
  }

  updatePlaceholderVisibility(target: HTMLSelectElement): void {
    if (target.value !== '- Bitte Auswählen -') {
      this.renderer.setStyle(target, 'opacity', '1');
    } else {
      this.renderer.setStyle(target, 'opacity', '0');
    }
  }

  onCategoryChange(
    event: Event,
    exerciseCategories: string[],
    defaultRepSchemeByCategory: { [key: string]: any },
    formService: any
  ): void {
    const target = event.target as HTMLSelectElement;
    const category = target.value;
    const tableRow = target.closest('tr');

    if (tableRow) {
      const exerciseNameSelectors = tableRow.querySelectorAll(
        '.exercise-name-selector'
      ) as NodeListOf<HTMLSelectElement>;

      if (category === '- Bitte Auswählen -') {
        this.renderer.setStyle(target, 'opacity', '0');
        exerciseNameSelectors.forEach((selector) => {
          this.renderer.setStyle(selector, 'display', 'none');
          selector.disabled = false;
        });
      } else {
        this.renderer.setStyle(target, 'opacity', '1');
        const index = exerciseCategories.indexOf(category);
        exerciseNameSelectors.forEach((selector, i) => {
          this.renderer.setStyle(
            selector,
            'display',
            i === index ? 'block' : 'none'
          );
          this.renderer.setStyle(selector, 'opacity', i === index ? '1' : '0');
          selector.disabled = i !== index;
        });
      }

      const displaySelector = tableRow.querySelector(
        '.exercise-name-selector:not([style*="display: none"])'
      ) as HTMLSelectElement;
      if (displaySelector) {
        displaySelector.dispatchEvent(new Event('change', { bubbles: true }));
      }

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

      formService.addChange(setsInput.name, setsInput.value);
      formService.addChange(repsInput.name, repsInput.value);
      formService.addChange(targetRPEInput.name, targetRPEInput.value);
    }
  }
}
