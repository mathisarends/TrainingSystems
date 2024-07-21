import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpMethods } from '../types/httpMethods';
import { HttpClientService } from '../../service/http/http-client.service';
import { ExerciseService } from '../../service/exercise/exercise.service';

@Component({
  selector: 'app-confirm-exercise-reset',
  standalone: true,
  imports: [],
  templateUrl: './confirm-exercise-reset.component.html',
  styleUrl: './confirm-exercise-reset.component.scss',
})
export class ConfirmExerciseResetComponent {
  constructor(
    private httpClient: HttpClientService,
    private exerciseService: ExerciseService
  ) {}

  async onSubmit(): Promise<void> {
    try {
      // Emit an event to indicate that the exercise reset process has started
      this.exerciseService.exerciseResetInitiated();

      // Make the HTTP request to reset exercises
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset')
      );

      console.log('Übungskatalog zurückgesetzt!');

      // Emit an event to indicate that the exercise reset process has completed successfully
      this.exerciseService.exerciseResetSuccessful();
    } catch (error) {
      console.error('Error resetting exercises:', error);
    }
  }
}
