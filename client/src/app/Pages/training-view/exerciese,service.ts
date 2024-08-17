import { Injectable } from '@angular/core';
import { HttpClientService } from '../../../service/http/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { ExerciseDataDTO } from './exerciseDataDto';
import { Observable } from 'rxjs';

@Injectable()
export class ExerciseService {
  constructor(private httpClient: HttpClientService) {}

  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpClient.request<ExerciseDataDTO>(HttpMethods.GET, 'exercise');
  }

  resetExercises(): Observable<void> {
    return this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset');
  }
}
