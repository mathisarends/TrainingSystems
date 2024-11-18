import { Component, signal } from '@angular/core';
import { TrainingPlanTypeCard } from '../training-plan-type-card/training-plan-type-card.component';

@Component({
  selector: 'app-training-plan-type-selection',
  standalone: true,
  imports: [TrainingPlanTypeCard],
  templateUrl: './training-plan-type-selection.component.html',
  styleUrls: ['./training-plan-type-selection.component.scss'],
})
export class TrainingPlanTypeSelectionComponent {
  options = [
    {
      id: 'plan',
      title: 'Trainingsplan',
      description: 'Plane ein Training über mehrere Wochen.',
      cardPicture: '/images/training_plan_card.webp',
      selected: true,
    },
    {
      id: 'session',
      title: 'Trainingseinheit',
      description: 'Definiere eine wiederholbare, einzelne Trainingseinheit.',
      cardPicture: '/images/training_session_card.webp',
      selected: false,
    },
  ];

  // Signal to store the currently selected card ID
  selectedCard = signal<string | undefined>(undefined);

  // Method to handle card selection
  onCardSelected(cardId: string): void {
    this.options.forEach((option) => {
      option.selected = option.id === cardId;
    });
    this.selectedCard.set(cardId);
  }
}
