import { Component, OnInit } from '@angular/core';
import { HttpClientService } from '../../service/http-client.service';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { Exercise } from '../../../../shared/models/exercise/exercise';
import { SpinnerComponent } from '../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [SpinnerComponent, CommonModule],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit {
  protected isLoading = true;
  exerciseCategories: string[] = [];
  categorizedExercises: { [category: string]: Exercise[] } = {};
  maxFactors: { [exercise: string]: number } = {};
  categoryPauseTimes: { [category: string]: number } = {};
  defaultRepSchemeByCategory: { [category: string]: any } = {};
  maxExercises = 8;

  changedData: { [key: string]: any } = {};

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
      this.defaultRepSchemeByCategory =
        exercisesData.defaultRepSchemeByCategory;
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    console.log('🚀 ~ ExercisesComponent ~ changedData:', this.changedData);

    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          'exercise',
          this.changedData
        )
      );
      console.log('resonse', response);
    } catch (error) {
      const httpError = error as HttpErrorResponse;

      console.error('Error updating updating user exercises:', error);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.changedData[target.name] = target.value;
  }

  async onReset(event: Event): Promise<void> {
    event.preventDefault();
    this.isLoading = true;
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset')
      );
      console.log('Übungskatalog zurückgesetzt!');
      await this.loadExercises();
    } catch (error) {
      console.error('Error resetting exercises:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
