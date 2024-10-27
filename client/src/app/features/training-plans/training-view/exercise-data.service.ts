import { Injectable } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

// TODO: Dieser service layer hält eine referenz auf eine ganze klasse. stattdessen sollte er nur eine referenz auf die Daten innerhalb dieser Klasse halten und die logik für das mapping entsprechend selber verwalten
@Injectable()
export class ExerciseDataService {
  exerciseData!: ExerciseDataDTO;

  getDefaultRepSchemeByCategory(): RepSchemeByCategory {
    return this.exerciseData.defaultRepSchemeByCategory;
  }
}
