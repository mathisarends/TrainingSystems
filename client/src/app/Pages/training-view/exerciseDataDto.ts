export class ExerciseDataDTO {
  private _exerciseCategories: string[] = [];
  private _categoryPauseTimes: { [key: string]: number } = {};
  private _categorizedExercises: { [key: string]: string[] } = {};
  private _defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  } = {};

  constructor(data?: Partial<ExerciseDataDTO>) {
    if (data) {
      this._exerciseCategories = data.exerciseCategories || [];
      this._categoryPauseTimes = data.categoryPauseTimes || {};
      this._categorizedExercises = data.categorizedExercises || {};
      this._defaultRepSchemeByCategory = data.defaultRepSchemeByCategory || {};
    }
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
