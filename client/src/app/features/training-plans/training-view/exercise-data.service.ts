import { Injectable } from '@angular/core';
import { ExerciseDataDTO } from './exerciseDataDto';
import { RepSchemeByCategory } from './models/default-rep-scheme-by-category';

@Injectable()
export class ExerciseDataService {
  private _exerciseCategories: string[] = [];
  private _categoryPauseTimes: { [key: string]: number } = {};
  private _categorizedExercises: { [key: string]: string[] } = {};
  private _defaultRepSchemeByCategory: RepSchemeByCategory = {};

  setExerciseData(data: Partial<ExerciseDataDTO>): void {
    this.exerciseCategories = data.exerciseCategories || [];
    this.categoryPauseTimes = data.categoryPauseTimes || {};
    this.categorizedExercises = data.categorizedExercises || {};
    this.defaultRepSchemeByCategory = data.defaultRepSchemeByCategory || {};
  }
  get exerciseCategories(): string[] {
    return this._exerciseCategories;
  }

  set exerciseCategories(value: string[]) {
    this._exerciseCategories = value;
  }

  get categoryPauseTimes(): { [key: string]: number } {
    return this._categoryPauseTimes;
  }

  set categoryPauseTimes(value: { [key: string]: number }) {
    this._categoryPauseTimes = value;
  }

  get categorizedExercises(): { [key: string]: string[] } {
    return this._categorizedExercises;
  }

  set categorizedExercises(value: { [key: string]: string[] }) {
    this._categorizedExercises = value;
  }

  get defaultRepSchemeByCategory(): {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  } {
    return this._defaultRepSchemeByCategory;
  }

  set defaultRepSchemeByCategory(value: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  }) {
    this._defaultRepSchemeByCategory = value;
  }
}
