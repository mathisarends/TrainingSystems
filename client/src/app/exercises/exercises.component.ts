import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { Exercise } from '../../../../shared/models/exercise/exercise';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [SpinnerComponent, CommonModule],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit {
  onSubmit() {
    throw new Error('Method not implemented.');
  }
  protected isLoading = true;
  exerciseCategories: string[] = [];
  categorizedExercises: { [category: string]: Exercise[] } = {};
  maxFactors: { [exercise: string]: number } = {};
  categoryPauseTimes: { [category: string]: number } = {};
  defaultRepSchemeByCategory: { [category: string]: any } = {};
  maxExercises = 8;

  constructor(private httpClient: HttpClientService) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  private async loadExercises(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'exercise')
      );
      const exercisesData = response.exercisesData;
      this.exerciseCategories = exercisesData.exerciseCategories;
      this.categorizedExercises = exercisesData.categorizedExercises;
      this.maxFactors = exercisesData.maxFactors;
      this.categoryPauseTimes = exercisesData.categoryPauseTimes;
      console.log(
        '🚀 ~ ExercisesComponent ~ loadExercises ~ this.categoryPauseTimes:',
        this.categoryPauseTimes
      );
      this.defaultRepSchemeByCategory =
        exercisesData.defaultRepSchemeByCategory;
      console.log(
        '🚀 ~ ExercisesComponent ~ loadExercises ~ this.defaultRepSchemeByCategory:',
        this.defaultRepSchemeByCategory
      );
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
