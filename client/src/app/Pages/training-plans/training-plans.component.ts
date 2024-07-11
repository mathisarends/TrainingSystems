import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

import { AlertComponent } from '../../components/alert/alert.component';
import { SpinnerComponent } from '../../components/spinner/spinner.component';

import { TrainingCardsComponent } from '../../components/training-card/training-card.component';

import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [AlertComponent, SpinnerComponent, TrainingCardsComponent],
  templateUrl: './training-plans.component.html',
  styleUrl: './training-plans.component.scss',
})
export class TrainingPlansComponent implements OnInit {
  /* protected trainingPlans!: BasicTrainingPlanView[]; */
  protected isLoading: boolean = true;

  trainingPlans: BasicTrainingPlanView[] = [
    {
      title: 'Full Body Workout',
      trainingFrequency: 3,
      lastUpdated: new Date('2023-07-11'),
    },
    {
      title: 'Cardio Blast',
      trainingFrequency: 4,
      lastUpdated: new Date('2023-06-20'),
    },
    {
      title: 'Flexibility Routine',
      trainingFrequency: 5,
      lastUpdated: new Date('2023-05-15'),
    },
  ];

  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService
  ) {}

  ngOnInit(): void {
    this.httpClient
      .request<any>(HttpMethods.GET, 'training/plans')
      .subscribe((response) => {
        /* this.trainingPlans = response.trainingPlanDtos; */
        this.isLoading = false;
        console.log(
          '🚀 ~ TrainingPlansComponent ~ .subscribe ~ this.trainingPlans:',
          this.trainingPlans
        );
      });
  }

  createNewPlan() {
    this.modalService.open(
      CreateTrainingFormComponent,
      'Trainingsplan erstellen',
      'Erstellen'
    );
  }
}
