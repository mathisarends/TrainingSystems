import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';
import { HttpClientService } from '../../../service/http-client.service';
import { HttpMethods } from '../../types/httpMethods';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [],
  templateUrl: './training-plans.component.html',
  styleUrl: './training-plans.component.scss',
})
export class TrainingPlansComponent implements OnInit {
  constructor(
    private modalService: ModalService,
    private httpClient: HttpClientService
  ) {}

  ngOnInit(): void {
    this.httpClient
      .request<any>(HttpMethods.GET, 'training/plans')
      .subscribe((response) => {
        console.log('GET response', response);
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
