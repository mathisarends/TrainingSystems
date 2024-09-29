import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../shared/dto/basic-confirmation-response';
import { TrainingDay } from '../training-plans/training-view/training-day';
import { StartTrainingVersionDto } from './model/start-training-session-dto';
import { TrainingSession } from './model/training-session';
import { TrainingSessionCardViewDto } from './model/training-session-card-view-dto';
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
   * Retrieves all training sessions in a card format.
   */
  getTrainingSessionCardViews(): Observable<TrainingSessionCardViewDto[]> {
    return this.httpService.get('/training-session/edit');
  }

  /**
   * Retrieves a specific training session by ID.
   */
  getTrainingSessionCardViewById(id: string): Observable<TrainingSession> {
    return this.httpService.get(`/training-session/${id}`);
  }

  /**
   * Creates a new training session.
   */
  createNewTrainingSession(): Observable<BasicConfirmationResponse> {
    return this.httpService.post('/training-session/create');
  }

  /**
   * Edits an existing training session by sending updated metadata.
   */
  editTrainingSession(trainingSessionEditDto: TrainingSessionMetaDataDto): Observable<BasicConfirmationResponse> {
    return this.httpService.put('/training-session/create', { trainingSessionEditDto });
  }

  /**
   * Deletes a specific training session by ID.
   */
  deleteTrainingSession(id: string): Observable<BasicConfirmationResponse> {
    return this.httpService.delete(`/training-session/${id}`);
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
