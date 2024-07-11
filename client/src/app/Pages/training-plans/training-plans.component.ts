import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { EditTrainingPlanComponent } from '../../edit-training-plan/edit-training-plan.component';
import { DeleteConfirmationComponent } from '../../delete-confirmation/delete-confirmation.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';
import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { TrainingCardsComponent } from '../../components/training-card/training-card.component';
import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../../service/modal-events.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [AlertComponent, SpinnerComponent, TrainingCardsComponent],
  templateUrl: './training-plans.component.html',
  styleUrls: ['./training-plans.component.scss'],
})
export class TrainingPlansComponent implements OnInit {
  protected trainingPlans!: BasicTrainingPlanView[];
  protected isLoading: boolean = true;
  private deleteIndex: number = -1;

  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService,
    private modalEventsService: ModalEventsService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'training/plans')
      );
      this.trainingPlans = response.trainingPlanDtos;
    } catch (error) {
      console.error('Error loading training plans:', error);
    } finally {
      this.isLoading = false;
    }

    // Listen for confirm event
    this.modalEventsService.confirmClick$.subscribe(() => {
      this.handleDelete(this.deleteIndex);
    });
  }

  createNewPlan() {
    this.modalService.open(
      CreateTrainingFormComponent,
      'Trainingsplan erstellen',
      'Erstellen'
    );
  }

  deleteTrainingPlan(index: number) {
    this.deleteIndex = index;
    this.modalService.open(
      DeleteConfirmationComponent,
      'Trainingsplan wirklich löschen?',
      'Löschen'
    );
  }

  viewTrainingPlan(index: number) {}

  editTrainingPlan(index: number) {
    console.log(
      '🚀 ~ TrainingPlansComponent ~ editTrainingPlan ~ index:',
      index
    );
    this.modalService.open(
      EditTrainingPlanComponent,
      'Trainingsplan bearbeiten',
      'Übernehmen',
      { index }
    );
  }

  private async handleDelete(index: number): Promise<void> {
    if (index >= 0) {
      try {
        const response: any = await firstValueFrom(
          this.httpClient.request<any>(
            HttpMethods.DELETE,
            `training/delete/${index}`
          )
        );
        this.trainingPlans.splice(index, 1);
        this.modalService.close();
      } catch (error) {
        console.error('Error deleting training plan:', error);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          console.log('Route oder Nutzer nicht gefunden');
        }
      }
    }
  }
}
