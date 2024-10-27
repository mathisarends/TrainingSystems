import { Injectable } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

@Injectable()
export class ExerciseDataService {
  exerciseData!: ExerciseDataDTO;

  getDefaultRepSchemeByCategory(): RepSchemeByCategory {
    return this.exerciseData.defaultRepSchemeByCategory;
  }
}
