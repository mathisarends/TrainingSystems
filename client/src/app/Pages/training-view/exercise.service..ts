import { Injectable } from '@angular/core';
import { HttpMethods } from '../../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ExerciseService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Loads the exercise data from the server.
   *
   * @returns An `Observable` that emits the exercise data when the request completes.
   */
  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpClient.request<ExerciseDataDTO>(HttpMethods.GET, 'exercise');
  }

  /**
   * Resets all exercises to their default state.
   *
   * @returns An `Observable` that completes when the reset operation is finished.
   */
  resetExercises(): Observable<void> {
    return this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset');
  }

  /**
   * Updates exercises with the provided changes.
   *
   * @param changes - An object representing the changes to be applied to the exercises.
   * @returns An `Observable` that completes when the update operation is finished.
   */
  updateExercises(changes: { [key: string]: any }): Observable<void> {
    return this.httpClient.request<any>(HttpMethods.PATCH, 'exercise', changes);
  }
}
