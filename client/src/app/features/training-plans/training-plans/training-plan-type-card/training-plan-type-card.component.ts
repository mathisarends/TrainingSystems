import { Component, HostBinding, HostListener, input, model } from '@angular/core';

@Component({
  selector: 'app-training-plan-type-card',
  standalone: true,
  templateUrl: './training-plan-type-card.component.html',
  styleUrls: ['./training-plan-type-card.component.scss'],
})
export class TrainingPlanTypeCard {
  title = input.required<string>();
  description = input.required<string>();
  cardPicture = input.required<string>();

  isSelected = model(false);

  @HostBinding('class.selected')
  get selectedClass(): boolean {
    return this.isSelected();
  }

  @HostListener('click')
  toggleSelected(): void {
    this.isSelected.set(!this.isSelected());
  }
}
