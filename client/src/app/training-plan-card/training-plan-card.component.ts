import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingPlanCardView } from '../../../../shared/models/dtos/training/trainingDto.types';
import { firstValueFrom } from 'rxjs';
import { HttpClientService } from '../../service/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { Router } from '@angular/router';
import { ModalService } from '../../service/modalService';
import { EditTrainingPlanComponent } from '../edit-training-plan/edit-training-plan.component';
import { ModalSize } from '../../service/modalSize';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../service/modal-events.service';
import { TrainingPlanService } from '../training-plan.service';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';

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
  @Output() changedPlanConstellation = new EventEmitter<void>();

  constructor(
    private httpClient: HttpClientService,
    private router: Router,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private trainingPlanService: TrainingPlanService
  ) {}

  async ngOnInit() {
    // Subscribe to the confirmClick$ event to handle deletion confirmation
    this.modalEventsService.confirmClick$.subscribe((id) => {
      if (id === this.trainingPlan.id) {
        this.deleteTrainingPlan(this.trainingPlan.id);
      }
    });
  }

  async viewTrainingPlan(id: string): Promise<void> {
    const response = await firstValueFrom(
      this.httpClient.request<any>(
        HttpMethods.GET,
        `training/plan/${id}/latest`
      )
    );
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
    this.modalService.open(
      EditTrainingPlanComponent,
      'Trainingsplan bearbeiten',
      'Übernehmen',
      ModalSize.LARGE,
      { id }
    );
  }

  /**
   * Opens the modal to delete a training plan.
   * @param index - The index of the training plan to delete.
   */
  showDeleteTrainingPlanModal(): void {
    this.modalService.open(
      DeleteConfirmationComponent,
      'Trainingsplan wirklich löschen?',
      'Löschen',
      ModalSize.MEDIUM,
      { id: this.trainingPlan.id }
    );
  }

  async deleteTrainingPlan(id: string): Promise<void> {
    if (id) {
      try {
        const response: any = await firstValueFrom(
          this.httpClient.request<any>(
            HttpMethods.DELETE,
            `training/delete/${id}`
          )
        );

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
