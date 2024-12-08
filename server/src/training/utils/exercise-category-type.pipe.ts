import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';

@Injectable()
export class ExerciseCategoryTypePipe implements PipeTransform<string, ExerciseCategoryType[]> {
  transform(value: string): ExerciseCategoryType[] {
    if (!value) {
      return [];
    }

    const categories = value.split(',').map((category) => category.trim().toLowerCase());

    const mappedCategories: ExerciseCategoryType[] = categories.map((category) => {
      switch (category) {
        case 'squat':
          return ExerciseCategoryType.SQUAT;
        case 'bench':
          return ExerciseCategoryType.BENCH;
        case 'deadlift':
          return ExerciseCategoryType.DEADLIFT;
        case 'overheadpress':
          return ExerciseCategoryType.OVERHEADPRESS;
        case 'chest':
          return ExerciseCategoryType.CHEST;
        case 'back':
          return ExerciseCategoryType.BACK;
        case 'shoulder':
          return ExerciseCategoryType.SHOULDER;
        case 'triceps':
          return ExerciseCategoryType.TRICEPS;
        case 'biceps':
          return ExerciseCategoryType.BICEPS;
        case 'legs':
          return ExerciseCategoryType.LEGS;
        default:
          throw new BadRequestException(`Invalid exercise category: ${category}`);
      }
    });

    return mappedCategories;
  }
}
