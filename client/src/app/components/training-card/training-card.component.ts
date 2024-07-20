import { Component, Input } from '@angular/core';

import { BasicTrainingPlanView } from '../../../../../shared/models/dtos/training/trainingDto.types.js';

@Component({
  selector: 'app-training-card',
  standalone: true,
  imports: [],
  templateUrl: './training-card.component.html',
  styleUrl: './training-card.component.scss',
})
export class TrainingCardsComponent {
  @Input() trainingPlan!: BasicTrainingPlanView;
}
