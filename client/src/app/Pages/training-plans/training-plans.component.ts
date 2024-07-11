import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { DeleteConfirmationComponent } from '../../delete-confirmation/delete-confirmation.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

import { TrainingCardsComponent } from '../../components/training-card/training-card.component';

import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../../service/modal-events.service';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [AlertComponent, SpinnerComponent, TrainingCardsComponent],
  templateUrl: './training-plans.component.html',
  styleUrl: './training-plans.component.scss',
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

  ngOnInit(): void {
    this.httpClient
      .request<any>(HttpMethods.GET, 'training/plans')
      .subscribe((response) => {
        this.trainingPlans = response.trainingPlanDtos;
        this.isLoading = false;
      });

    // Listen for confirm event
    this.modalEventsService.confirmClick$.subscribe(() => {
      console.log('ist was passiert');
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
    // Store the index of the training plan to be deleted

    this.deleteIndex = index;

    this.modalService.open(
      DeleteConfirmationComponent,
      'Trainingsplan wirklich löschen?',
      'Löschen'
    );
  }

  private handleDelete(index: number) {
    if (index >= 0) {
      this.httpClient
        .request<any>(HttpMethods.DELETE, `training/delete/${index}`)
        .subscribe({
          next: (response: any) => {
            this.trainingPlans.splice(index, 1);
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 404) {
              console.log('Route oder Nutzer nicht gefunden');
            }
          },
        });
    }
  }
}
