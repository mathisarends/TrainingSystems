import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingPlanCardView } from '../../../../shared/models/dtos/training/trainingDto.types';

@Component({
  selector: 'app-training-plan-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-plan-card.component.html',
  styleUrls: ['./training-plan-card.component.scss'],
})
export class TrainingPlanCardComponent {
  @Input() trainingPlan!: TrainingPlanCardView;
  @Input() columnClass!: string;

  viewTrainingPlan(id: string): void {
    // Implement navigation logic or emit an event
  }

  editTrainingPlan(id: string): void {
    // Implement edit logic or emit an event
  }

  deleteTrainingPlan(id: string): void {
    // Implement delete logic or emit an event
  }
}
