import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ModalOptionsBuilder } from '../../../core/services/modal/modal-options-builder';
import { ModalService } from '../../../core/services/modal/modalService';
import { IconButtonComponent } from '../../../shared/components/icon-button/icon-button.component';
import { ModalTab } from '../../../shared/components/modal/types/modal-tab';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { IconName } from '../../../shared/icon/icon-name';
import { IconComponent } from '../../../shared/icon/icon.component';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { TrainingSessionService } from '../../training-session/training-session-service';
import { TrainingPlanEditView } from '../model/training-plan-edit-view';
import { TrainingPlanEditViewDto } from '../model/training-plan-edit-view-dto';
import { CreateTrainingComponent } from '../training-plans/create-training/create-training.component';
import { TrainingSchedulingComponent } from '../training-plans/training-scheduling/training-scheduling.component';
import { TrainingPlanCardView } from '../training-view/models/exercise/training-plan-card-view-dto';
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
export class TrainingPlanCardComponent {
  protected readonly IconName = IconName;

  /**
   * The training plan data that will be displayed in the card.
   */
  trainingPlan = input.required<TrainingPlanCardView>();

  /**
   * Output: Emits an event when the training plan's constellation has changed.
   */
  changedPlanConstellation = output<void>();

  constructor(
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanCardService: TrainingPlanCardService,
    private trainingPlanService: TrainingPlanService,
    private trainingSessionService: TrainingSessionService,
  ) {}

  /**
   * Navigates to the view page of the training plan.
   * @param id - The ID of the training plan to view.
   */
  viewTrainingPlan(id: string): void {
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

  /**
   * Opens the modal to edit a training plan.
   * @param index - The index of the training plan to edit.
   */
  async showEditTrainingPlanModal(): Promise<void> {
    const trainingPlanEditViewDto = await firstValueFrom(
      this.trainingPlanService.getPlanForEdit(this.trainingPlan().id),
    );
    const trainingPlanEditView = TrainingPlanEditView.fromDto(trainingPlanEditViewDto);
    const providerMap = new Map().set(TrainingPlanEditView, trainingPlanEditView);

    const modalTabs: ModalTab[] = [
      {
        label: 'Allgemein',
        component: CreateTrainingComponent,
      },
      {
        label: 'Kalendar',
        component: TrainingSchedulingComponent,
      },
    ];

    const modalOptions = new ModalOptionsBuilder()
      .setTabs(modalTabs)
      .setTitle('Trainingsplan bearbeiten')
      .setButtonText('Speichern')
      .setProviderMap(providerMap)
      .setOnSubmitCallback(() => this.editTrainingPlan(trainingPlanEditView.toDto()))
      .build();

    await this.modalService.openModalTabs(modalOptions);
  }

  editTrainingPlan(trainingPlanEditViewDto: TrainingPlanEditViewDto): void {
    this.trainingPlanService.editTrainingPlan(this.trainingPlan().id, trainingPlanEditViewDto).subscribe((response) => {
      this.toastService.success(response.message);
    });
  }

  viewStatistics(id: string): void {
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
    const confirmed = await this.modalService.openDeletionModal({
      title: 'Trainingsplan löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      infoText:
        'Bist du dir sicher, dass du diesen Trainingsplan löschen willst? Diese Änderung kann nicht mehr rückgängig gemacht werden!',
      deletionKeyWord: this.trainingPlan().title,
    });

    if (!confirmed) {
      return;
    }

    // Call the appropriate delete handler based on the type
    this.handleDeleteForTrainingPlan();
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
}
