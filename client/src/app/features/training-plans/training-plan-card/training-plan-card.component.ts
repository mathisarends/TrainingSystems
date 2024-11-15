import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, Injector, input, OnInit, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal/modalService';
import { ModalSize } from '../../../core/services/modal/modalSize';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { EditTrainingSessionComponent } from '../../training-session/edit-training-session/edit-training-session.component';
import { TrainingSessionService } from '../../training-session/training-session-service';
import { EditTrainingPlanComponent } from '../edit-training-plan/edit-training-plan.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
import { isTrainingPlanCardView, TrainingPlanType } from '../training-view/models/training-plan-type';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { TrainingPlanCardService } from './training-plan-card.service';
import { TrainingWeekDayDto } from './training-week-day-dto';

/**
 * Component for displaying and managing a single training plan card.
 */
@Component({
  selector: 'app-training-plan-card',
  standalone: true,
  imports: [CommonModule, TooltipDirective, IconButtonComponent, IconComponent, FormatDatePipe],
  templateUrl: './training-plan-card.component.html',
  styleUrls: ['./training-plan-card.component.scss'],
  providers: [TrainingPlanCardService, TrainingSessionService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPlanCardComponent implements OnInit {
  protected readonly IconName = IconName;
  protected readonly TrainingPlanType = TrainingPlanType;

  /**
   * The training plan data that will be displayed in the card.
   */
  trainingPlan = input.required<TrainingPlanCardView>();

  /**
   * Output: Emits an event when the training plan's constellation has changed.
   */
  changedPlanConstellation = output<void>();

  trainingPlanType = signal(TrainingPlanType.PLAN);

  constructor(
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanCardService: TrainingPlanCardService,
    private trainingPlanService: TrainingPlanService,
    private trainingSessionService: TrainingSessionService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        if (isTrainingPlanCardView(this.trainingPlan())) {
          this.trainingPlanType.set(TrainingPlanType.PLAN);
        } else {
          this.trainingPlanType.set(TrainingPlanType.SESSION);
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Navigates to the view page of the training plan.
   * @param id - The ID of the training plan to view.
   */
  viewTrainingPlan(id: string): void {
    if (this.isTrainingSessionCard()) {
      this.trainingSessionService.getLatestVersionOfSession(id).subscribe((version) => {
        this.router.navigate(['/session/view'], {
          queryParams: {
            sessionId: id,
            version: version,
          },
        });
      });
    } else {
      this.trainingPlanCardService.getLatestTrainingPlan(id).subscribe((response: TrainingWeekDayDto) => {
        this.router.navigate(['/training/view'], {
          queryParams: {
            planId: id,
            week: response.weekIndex,
            day: response.dayIndex,
          },
        });
      });
    }
  }

  /**
   * Opens the modal to edit a training plan.
   * @param index - The index of the training plan to edit.
   */
  async showEditTrainingPlanModal(id: string): Promise<void> {
    if (this.isTrainingSessionCard()) {
      await this.modalService.open({
        component: EditTrainingSessionComponent,
        title: 'Session bearbeiten',
        buttonText: 'Speichern',
        size: ModalSize.LARGE,
        componentData: {
          id: id,
        },
      });
    } else {
      await this.modalService.open({
        component: EditTrainingPlanComponent,
        title: 'Trainingsplan bearbeiten',
        buttonText: 'Speichern',
        size: ModalSize.LARGE,
        componentData: {
          id: id,
        },
      });
    }
  }

  viewStatistics(id: string): void {
    const redirectUrl = this.isTrainingSessionCard() ? `statistics/session` : `statistics`;
    this.router.navigate([redirectUrl]);

    this.router.navigate(['/statistics'], {
      queryParams: {
        planId: id,
      },
    });
  }

  /**
   * Handles deletion depending on the type of the training plan.
   */
  async showDeleteTrainingPlanModal(): Promise<void> {
    const inputedKeyword = '123312';

    const confirmed = await this.modalService.openDeletionModal({
      title: 'Trainingsplan löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du dieses Element löschen willst? Diese Änderung kann nicht mehr rückgängig gemacht werden!',
      deletionKeyWord: this.trainingPlan().title,
      deletionKeyWordUserInput: inputedKeyword,
    });

    if (!confirmed) {
      return;
    }

    // Call the appropriate delete handler based on the type
    if (this.trainingPlanType() === TrainingPlanType.PLAN) {
      this.handleDeleteForTrainingPlan();
    } else {
      this.handleDeleteForTrainingSession();
    }
  }

  /**
   * Deletes a training plan.
   */
  private handleDeleteForTrainingPlan(): void {
    this.trainingPlanCardService.deleteTrainingPlan(this.trainingPlan().id).subscribe(() => {
      this.toastService.success('Plan gelöscht');
      this.emitChanges();
    });
  }

  /**
   * Deletes a training session.
   */
  private handleDeleteForTrainingSession(): void {
    this.trainingSessionService.deleteTrainingSession(this.trainingPlan().id).subscribe(() => {
      this.toastService.success('Session gelöscht');
      this.emitChanges();
    });
  }

  /**
   * Common method to handle changes after deletion or modification.
   */
  private emitChanges(): void {
    this.trainingPlanService.trainingPlanChanged();
    this.changedPlanConstellation.emit();
  }

  private isTrainingSessionCard() {
    return this.trainingPlanType() === TrainingPlanType.SESSION;
  }
}
