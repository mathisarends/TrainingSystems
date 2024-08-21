import { Injectable } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepScheme, RepSchemeByCategory } from './default-rep-scheme-by-category';

@Injectable({
  providedIn: 'root',
})
export class ExerciseDataService {
  private _exerciseData!: ExerciseDataDTO;

  set exerciseData(exerciseData: ExerciseDataDTO) {
    this._exerciseData = exerciseData;
  }

  getExerciseCategories(): string[] {
    return this._exerciseData.exerciseCategories;
  }

  getDefaultRepSchemeByCategory(): RepSchemeByCategory {
    return this._exerciseData.defaultRepSchemeByCategory;
  }
}
