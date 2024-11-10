import { Component, effect, input, signal } from '@angular/core';
import { CircularIconButtonComponent } from '../../../../shared/components/circular-icon-button/circular-icon-button.component';
import { MoreOptionListItem } from '../../../../shared/components/more-options-button/more-option-list-item';
import { MoreOptionsButtonComponent } from '../../../../shared/components/more-options-button/more-options-button.component';
import { IconName } from '../../../../shared/icon/icon-name';
import { IconComponent } from '../../../../shared/icon/icon.component';
import { TrainingPlanCardView } from '../../training-view/models/exercise/training-plan-card-view-dto';

@Component({
  selector: 'app-training-plan-card-2',
  standalone: true,
  imports: [IconComponent, CircularIconButtonComponent, MoreOptionsButtonComponent],
  templateUrl: './training-plan-card-2.component.html',
  styleUrls: ['./training-plan-card-2.component.scss'],
})
export class TrainingPlanCard2Component {
  protected readonly IconName = IconName;

  options: MoreOptionListItem[] = [
    {
      label: 'Statistiken',
      icon: IconName.BAR_CHART,
      callback: () => console.log('0'),
    },
    {
      label: 'Bearbeiten',
      icon: IconName.Edit,
      callback: () => console.log('1'),
    },
    {
      label: 'Löschen',
      icon: IconName.Trash,
      callback: () => console.log('2'),
    },
  ];

  trainingPlan = input.required<TrainingPlanCardView>();

  currentPercentage = signal(0);

  constructor() {
    effect(() => {
      console.log('🚀 ~ TrainingPlanCard2Component ~ effect ~ trainingPlan().:', this.trainingPlan());

      if (this.trainingPlan().percentageFinished) {
        this.animateProgress(this.trainingPlan().percentageFinished!);
      }
    });
  }

  private animateProgress(target: number) {
    const startTime = performance.now();
    const duration = 1000;

    const step = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      this.currentPercentage.set(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }
}
