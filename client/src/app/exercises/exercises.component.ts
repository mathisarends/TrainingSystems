import { Component } from '@angular/core';

interface ExerciseData {
  exerciseCategories: string[];
  categorizedExercises: { [key: string]: string[] };
  maxFactors: { [key: string]: number };
  categoryPauseTimes: { [key: string]: number };
  defaultRepSchemeByCategory: {
    [key: string]: {
      defaultSets: number;
      defaultReps: number;
      defaultRPE: number;
    };
  };
}

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.scss',
})
export class ExercisesComponent {}
