import { Injectable } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { FormService } from '../form/form.service';
import { table } from 'console';

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

      this.updateInputValues(tableRow, category, defaultRepSchemeByCategory);

      // Neue Logik: Überprüfen und Nach-Oben-Kopieren
      if (category === '- Bitte Auswählen -') {
        this.fillCategoryGaps(tableRow, renderer);
      }
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
    const exerciseSelect = tableRow.querySelector(
      '.exercise-name-selector'
    ) as HTMLSelectElement;
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
      exerciseSelect.value = '';
      setsInput.value = '';
      repsInput.value = '';
      targetRPEInput.value = '';
    }

    this.formService.addChange(exerciseSelect.name, exerciseSelect.value);
    this.formService.addChange(setsInput.name, setsInput.value);
    this.formService.addChange(repsInput.name, repsInput.value);
    this.formService.addChange(targetRPEInput.name, targetRPEInput.value);
  }

  /**
   * Fills the category gaps by copying valid values from subsequent rows.
   * @param tableRow The current table row element.
   * @param renderer The Angular renderer to manipulate DOM elements.
   */
  private fillCategoryGaps(tableRow: Element, renderer: Renderer2): void {
    let nextRow = tableRow.nextElementSibling;

    while (nextRow) {
      const nextCategorySelector = nextRow.querySelector(
        '.exercise-category-selector'
      ) as HTMLSelectElement;

      if (
        nextCategorySelector &&
        nextCategorySelector.value !== '- Bitte Auswählen -' &&
        nextCategorySelector.value !== ''
      ) {
        const exerciseCategorySelector = tableRow.querySelector(
          '.exercise-category-selector'
        ) as HTMLSelectElement;

        if (exerciseCategorySelector) {
          // current row (to be deleted)
          const exerciseNameSelect = tableRow.querySelector(
            '.exercise-name-selector'
          ) as HTMLSelectElement;
          const setsInput = tableRow.querySelector('.sets') as HTMLInputElement;
          const repsInput = tableRow.querySelector('.reps') as HTMLInputElement;
          const targetRPEInput = tableRow.querySelector(
            '.targetRPE'
          ) as HTMLInputElement;
          const weightInput = tableRow.querySelector(
            '.weight'
          ) as HTMLInputElement;
          const actualRPEInput = tableRow.querySelector(
            '.actualRPE'
          ) as HTMLInputElement;
          const estMaxInput = tableRow.querySelector(
            '.estMax'
          ) as HTMLInputElement;

          // next row (copy values)
          const nextExerciseNameSelect = nextRow.querySelector(
            '.exercise-name-selector'
          ) as HTMLSelectElement;
          const nextSetsInput = nextRow.querySelector(
            '.sets'
          ) as HTMLInputElement;
          const nextRepsInput = nextRow.querySelector(
            '.reps'
          ) as HTMLInputElement;
          const nextTargetRPEInput = nextRow.querySelector(
            '.targetRPE'
          ) as HTMLInputElement;
          const nextWeightInput = nextRow.querySelector(
            '.weight'
          ) as HTMLInputElement;
          const nextActualRPEInput = nextRow.querySelector(
            '.actualRPE'
          ) as HTMLInputElement;
          const nextEstMaxInput = nextRow.querySelector(
            '.estMax'
          ) as HTMLInputElement;

          // copy values to row above
          exerciseCategorySelector.value = nextCategorySelector.value;
          exerciseNameSelect.value = nextExerciseNameSelect.value;

          // dispatch events to update display before updating specific values
          exerciseCategorySelector.dispatchEvent(new Event('change'));
          exerciseNameSelect.dispatchEvent(new Event('change'));

          setsInput.value = nextSetsInput.value;
          repsInput.value = nextRepsInput.value;
          targetRPEInput.value = nextTargetRPEInput.value;
          weightInput.value = nextWeightInput.value;
          actualRPEInput.value = nextActualRPEInput.value;
          estMaxInput.value = nextEstMaxInput.value;

          this.formService.addChange(
            exerciseCategorySelector.name,
            exerciseCategorySelector.value
          );

          this.formService.addChange(
            exerciseNameSelect.name,
            exerciseNameSelect.value
          );

          this.formService.addChange(setsInput.name, setsInput.value);
          this.formService.addChange(repsInput.name, repsInput.value);
          this.formService.addChange(targetRPEInput.name, targetRPEInput.value);
          this.formService.addChange(weightInput.name, weightInput.value);
          this.formService.addChange(actualRPEInput.name, actualRPEInput.value);
          this.formService.addChange(estMaxInput.name, estMaxInput.value);

          // reset values in next row (das dispatchen vom event reicht weil sich ein anderer service dann um das Ändern der werte kümmet)
          nextCategorySelector.value = '- Bitte Auswählen -';
          nextCategorySelector.dispatchEvent(new Event('change'));
          nextWeightInput.value = '';
          nextActualRPEInput.value = '';
          nextEstMaxInput.value = '';

          this.formService.addChange(
            nextWeightInput.name,
            nextWeightInput.value
          );
          this.formService.addChange(
            nextActualRPEInput.name,
            nextActualRPEInput.value
          );
          this.formService.addChange(
            nextActualRPEInput.name,
            nextActualRPEInput.value
          );
          this.formService.addChange(
            nextEstMaxInput.name,
            nextEstMaxInput.value
          );

          break; // Bricht die Schleife ab, sobald eine gültige Kategorie gefunden und kopiert wurde
        }
      }

      nextRow = nextRow.nextElementSibling;
    }
  }
}
