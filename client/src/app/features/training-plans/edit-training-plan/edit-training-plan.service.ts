import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/http-client.service';
import { TrainingPlanEditViewDto } from './training-plan-edit-view-dto';

@Injectable()
export class EditTrainingPlanService {
  constructor(private httpService: HttpService) {}

  getPlanForEdit(id: string): Observable<TrainingPlanEditViewDto> {
    return this.httpService.get<TrainingPlanEditViewDto>(`/training/edit/${id}`);
  }
}
