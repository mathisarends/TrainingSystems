import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../shared/dto/basic-confirmation-response';
import { ExerciseDataDTO } from '../training-plans/training-view/exerciseDataDto';
import { TrainingDay } from '../training-plans/training-view/training-day';
import { StartTrainingVersionDto } from './model/start-training-session-dto';
import { TrainingSessionDto } from './model/training-session-dto';
import { TrainingSessionMetaDataDto } from './training-session-meta-data-dto';

/**
 * Service to handle training session operations.
 * This service interacts with the backend API to retrieve, create, edit, delete,
 * and manage training sessions for a user.
 */
@Injectable()
export class TrainingSessionService {
  constructor(private httpService: HttpService) {}

  /**
   * Retrieves a specific training session by ID.
   */
  getTrainingSessionById(id: string): Observable<TrainingSessionDto> {
    return this.httpService.get(`/training-session/${id}`);
  }

  /**
   * Loads the exercise data for the application.
   */
  loadExerciseData(): Observable<ExerciseDataDTO> {
    return this.httpService.get<ExerciseDataDTO>('/exercise');
  }

  /**
   * Creates a new training session.
   */
  createNewTrainingSession(
    trainingSessionMetaDataDto: TrainingSessionMetaDataDto,
  ): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/training-session/create', trainingSessionMetaDataDto);
  }

  /**
   * Edits an existing training session by sending updated metadata.
   */
  editTrainingSession(
    id: string,
    trainingSessionEditDto: TrainingSessionMetaDataDto,
  ): Observable<BasicConfirmationResponse> {
    return this.httpService.put(`/training-session/edit/${id}`, trainingSessionEditDto);
  }

  /**
   * Deletes a specific training session by ID.
   */
  deleteTrainingSession(id: string): Observable<BasicConfirmationResponse> {
    return this.httpService.delete(`/training-session/${id}`);
  }

  getLatestVersionOfSession(id: string): Observable<number> {
    return this.httpService.get(`/training-session/${id}/latest-version`);
  }

  /**
   * Starts a new training session by its ID.
   */
  startNewTrainingSession(id: string): Observable<StartTrainingVersionDto> {
    return this.httpService.delete(`/training-session/start/${id}`);
  }

  /**
   * Retrieves a specific version of a training session by ID and version number.
   */
  getTrainingSessionVersionData(id: string, version: number): Observable<TrainingDay> {
    return this.httpService.get(`/training-session/${id}/${version}`);
  }

  /**
   * Updates the data of a specific version of a training session.
   */
  updateTrainingSessionVersionData(id: string, version: number): Observable<BasicConfirmationResponse> {
    return this.httpService.delete(`/training-session/${id}/${version}`);
  }
}
