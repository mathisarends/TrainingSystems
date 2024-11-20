import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { BasicConfirmationResponse } from '../../../shared/dto/basic-confirmation-response';
import { TrainingPlanEditViewDto } from '../model/training-plan-edit-view-dto';

@Injectable()
export class EditTrainingPlanService {
  constructor(private httpService: HttpService) {}

  getPlanForEdit(id: string): Observable<TrainingPlanEditViewDto> {
    return this.httpService.get<TrainingPlanEditViewDto>(`/training-plan/edit/${id}`);
  }

  editTrainingPlan(id: string, formData: TrainingPlanEditViewDto): Observable<BasicConfirmationResponse> {
    return this.httpService.patch(`/training-plan/edit/${id}`, formData);
  }
}
