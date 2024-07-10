import { Component } from '@angular/core';
import { ModalService } from '../../../service/modalService';
import { CreateTrainingFormComponent } from '../../create-training-form/create-training-form.component';

@Component({
  selector: 'app-training-plans',
  standalone: true,
  imports: [],
  templateUrl: './training-plans.component.html',
  styleUrl: './training-plans.component.scss',
})
export class TrainingPlansComponent {
  constructor(private modalService: ModalService) {}

  createNewPlan() {
    this.modalService.open(
      CreateTrainingFormComponent,
      'Trainingsplan erstellen',
      'Erstellen'
    );
  }
}
