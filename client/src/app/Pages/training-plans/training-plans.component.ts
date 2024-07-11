import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

import { TrainingCardsComponent } from '../../components/training-card/training-card.component';

import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService
  ) {}

  ngOnInit(): void {
    this.httpClient
      .request<any>(HttpMethods.GET, 'training/plans')
      .subscribe((response) => {
        this.trainingPlans = response.trainingPlanDtos;
        this.isLoading = false;
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
    // hier den modalService drauf werfen
    if (
      confirm('Bist du sicher, dass du diesen Trainingsplan löschen möchtest?')
    ) {
      this.httpClient
        .request<any>(HttpMethods.DELETE, `training/delete/${index}`)
        .subscribe({
          next: (response: Response) => {
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
