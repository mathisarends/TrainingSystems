import { Injectable } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

@Injectable({
  providedIn: 'root',
})
export class ExerciseDataService {
  private _exerciseData!: ExerciseDataDTO;

  set exerciseData(exerciseData: ExerciseDataDTO) {
    this._exerciseData = exerciseData;
  }

  getExerciseData(): ExerciseDataDTO {
    return this._exerciseData;
  }

  getExerciseCategories(): string[] {
    return this._exerciseData.exerciseCategories;
  }

  getDefaultRepSchemeByCategory(): RepSchemeByCategory {
    return this._exerciseData.defaultRepSchemeByCategory;
  }
}
