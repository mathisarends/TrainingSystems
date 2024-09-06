import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingPlanCardView } from '../../../types/exercise/training-plan-card-view-dto';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ModalService } from '../../../service/modal/modalService';
import { EditTrainingPlanComponent } from '../../Pages/edit-training-plan/edit-training-plan.component';
import { ModalSize } from '../../../service/modal/modalSize';
import { HttpErrorResponse } from '@angular/common/http';

import { TooltipDirective } from '../../../service/tooltip/tooltip.directive';
import { ToastService } from '../toast/toast.service';
import { BasicInfoComponent } from '../../Pages/modal-pages/basic-info/basic-info.component';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { HttpService } from '../../../service/http/http-client.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { IconName } from '../../shared/icon/icon-name';
import {} from '../../percentage-circle-visualisation/percentage-circle-visualisation.component';

/**
 * Component for displaying and managing a single training plan card.
 */
@Component({
  selector: 'app-training-plan-card',
  standalone: true,
  imports: [CommonModule, TooltipDirective, IconButtonComponent, IconComponent],
  templateUrl: './training-plan-card.component.html',
  styleUrls: ['./training-plan-card.component.scss'],
})
export class TrainingPlanCardComponent {
  protected readonly IconName = IconName;

  @Input() trainingPlan!: TrainingPlanCardView;
  @Input() columnClass!: string;
  @Output() changedPlanConstellation = new EventEmitter<void>();

  constructor(
    private httpService: HttpService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanService: TrainingPlanService,
  ) {}

  /**
   * Navigates to the view page of the training plan.
   * @param id - The ID of the training plan to view.
   */
  async viewTrainingPlan(id: string): Promise<void> {
    const response = await firstValueFrom(this.httpService.get<any>(`/training/plan/${id}/latest`));
    const latestWeek = response.weekIndex;
    const latestDay = response.dayIndex;

    this.router.navigate(['/training/view'], {
      queryParams: {
        planId: id,
        week: latestWeek,
        day: latestDay,
      },
    });
  }

  /**
   * Opens the modal to edit a training plan.
   * @param index - The index of the training plan to edit.
   */
  showEditTrainingPlanModal(id: string): void {
    this.modalService.open({
      component: EditTrainingPlanComponent,
      title: 'Trainingsplan bearbeiten',
      buttonText: '*Übernehmen',
      size: ModalSize.LARGE,
      componentData: { id },
    });
  }

  viewStatistics(id: string): void {
    console.log('id', id);
    this.router.navigate([`statistics/${id}`]);
  }

  /**
   * Opens the modal to delete a training plan.
   * @param index - The index of the training plan to delete.
   */
  async showDeleteTrainingPlanModal(): Promise<void> {
    const confirmed = await this.modalService.open({
      component: BasicInfoComponent,
      title: 'Trainingsplan löschen',
      buttonText: 'Löschen',
      isDestructiveAction: true,
      componentData: {
        text: 'Bist du dir sicher, dass du dieses Element löschen willst? Diese Änderung kann nicht mehr rückgängig gemacht werden!',
      },
    });

    if (confirmed) {
      await this.handleDelete(this.trainingPlan.id);
    }
  }

  /**
   * Deletes the training plan.
   * @param id - The ID of the training plan to delete.
   */
  private async handleDelete(id: string): Promise<void> {
    if (id) {
      try {
        await firstValueFrom(this.httpService.delete(`/training/delete/${id}`));

        this.modalService.close();
        this.toastService.success('Plan gelöscht');

        this.trainingPlanService.trainingPlanChanged();

        this.changedPlanConstellation.emit();
      } catch (error) {
        console.error('Error deleting training plan:', error);
        if (error instanceof HttpErrorResponse && error.status === 404) {
          console.log('Route oder Nutzer nicht gefunden');
        }
      }
    }
  }
}
