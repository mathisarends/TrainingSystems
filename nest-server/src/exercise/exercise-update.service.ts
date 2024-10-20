import { Injectable } from '@nestjs/common';
import { ApiData } from 'src/types/api-data';
import { User } from 'src/users/user.model';
import { UserExercise } from './model/user-exercise.model';
import { ExerciseCategoryType } from './types/exercise-category-type.enum';
import { UserExerciseCategory } from './types/user-exercise-category';

// TODO: diese Logik hier refactoren, sobald das Frontend angeschlossen ist. (wir kännten ja für jede Übung hier eine id erzeugen)
// identifikation direkt über diese anstatt über die ganze datenstruktur laufen zu müssen
// und dann jeweils auch eine Kennung für die Metadaten Felder einer Kategoerie

@Injectable()
export class ExerciseUpdateService {
  async updateExercisesForUser(user: User, changedData: ApiData) {
    const changedCategoriesMap = this.mapChangedDataToCategories(changedData);

    Object.entries(changedCategoriesMap).forEach(
      ([category, { fieldNames, newValues }]) => {
        const exercisesForCategory = user.exercises[category];

        fieldNames.forEach((fieldName, index) => {
          this.processExerciseChanges(
            fieldName,
            index,
            newValues,
            exercisesForCategory,
          );
        });
      },
    );

    await user.save();
  }

  /**
   * Maps changed data to categories based on the provided API data.
   */
  private mapChangedDataToCategories(changedData: ApiData): {
    [category: string]: { fieldNames: string[]; newValues: unknown[] };
  } {
    const changedCategoriesMap: {
      [category: string]: { fieldNames: string[]; newValues: unknown[] };
    } = {};

    Object.entries(changedData).forEach(([fieldName, newValue]) => {
      const categoryIndex: number = this.isCategoryIndexAboveTen(fieldName)
        ? this.concatenateNumbers(
            Number(fieldName.charAt(0)),
            Number(fieldName.charAt(1)),
          )
        : Number(fieldName.charAt(0));

      const category = this.getAssociatedCategoryByIndex(categoryIndex);

      if (!changedCategoriesMap[category]) {
        changedCategoriesMap[category] = { fieldNames: [], newValues: [] };
      }

      changedCategoriesMap[category].newValues.push(newValue);
      changedCategoriesMap[category].fieldNames.push(fieldName);
    });

    return changedCategoriesMap;
  }

  /**
   * Gets the associated category name based on the provided index.
   */
  private getAssociatedCategoryByIndex(index: number) {
    switch (index) {
      case 0:
        return ExerciseCategoryType.PLACEHOLDER;
      case 1:
        return ExerciseCategoryType.SQUAT;
      case 2:
        return ExerciseCategoryType.BENCH;
      case 3:
        return ExerciseCategoryType.DEADLIFT;
      case 4:
        return ExerciseCategoryType.OVERHEADPRESS;
      case 5:
        return ExerciseCategoryType.BACK;
      case 6:
        return ExerciseCategoryType.CHEST;
      case 7:
        return ExerciseCategoryType.SHOULDER;
      case 8:
        return ExerciseCategoryType.BICEPS;
      case 9:
        return ExerciseCategoryType.TRICEPS;
      case 10:
        return ExerciseCategoryType.LEGS;
      default:
        throw new Error('Category is not valid');
    }
  }

  private isCategoryIndexAboveTen(fieldName: string) {
    const tensPlaces = Number(fieldName.charAt(0));
    const onesPlaces = Number(fieldName.charAt(1));

    return tensPlaces && !isNaN(onesPlaces);
  }

  private concatenateNumbers(num1: number, num2: number) {
    const numeric1 = num1.toString();
    const numeric2 = num2.toString();

    const concatenatedString = numeric1 + numeric2;
    return Number(concatenatedString);
  }
  /**
   * Process changes related to exercises based on the provided field name, index, new values, and user exercise field.
   */
  private processExerciseChanges(
    fieldName: string,
    index: number,
    newValues: unknown[],
    userExerciseField: UserExercise[],
  ) {
    if (this.isExercise(fieldName)) {
      const exerciseIndex: number = this.isCategoryIndexAboveTen(fieldName)
        ? Number(fieldName.charAt(3))
        : Number(fieldName.charAt(2));

      if (exerciseIndex >= userExerciseField.length) {
        const exerciseCategoryMetaInfo =
          this.getCategoryInfoFromList(userExerciseField)!;
        const newUserExercise = this.createExerciseObject(
          exerciseCategoryMetaInfo,
          newValues[index] as string,
          undefined,
        );
        userExerciseField.push(newUserExercise);
      } else {
        console.log(newValues[index]);
        if (newValues[index]) {
          userExerciseField[exerciseIndex].name = newValues[index] as string;
        } else {
          userExerciseField.splice(exerciseIndex, 1);
        }
      }
    } else {
      // means a field which is applied for all exercises of the category
      // was change which means we have to iterate over all fields

      userExerciseField.forEach((exerciseField: UserExercise) => {
        switch (true) {
          case fieldName.endsWith('categoryPauseTimeSelect'):
            exerciseField.category.pauseTime = Number(newValues[index]);
            break;
          case fieldName.endsWith('categoryDefaultSetSelect'):
            exerciseField.category.defaultSets = Number(newValues[index]);
            break;
          case fieldName.endsWith('categoryDefaultRepSelect'):
            exerciseField.category.defaultReps = Number(newValues[index]);
            break;
          case fieldName.endsWith('categoryDefaultRPESelect'):
            exerciseField.category.defaultRPE = Number(newValues[index]);
            break;
          default:
            break;
        }
      });
    }
  }

  /**
   * Creates and returns an exercise object.
   */
  private createExerciseObject(
    category: UserExerciseCategory,
    name: string,
    maxFactor: number | undefined,
  ): UserExercise {
    const object = {
      category: category,
      name,
      maxFactor,
    };

    return object;
  }

  getCategoryInfoFromList(exerciseList: UserExercise[]) {
    if (exerciseList.length === 0) {
      return null;
    }

    const firstExercise = exerciseList[0];
    return firstExercise.category;
  }

  private isExercise(fieldName: string) {
    return fieldName.endsWith('exercise');
  }
}
