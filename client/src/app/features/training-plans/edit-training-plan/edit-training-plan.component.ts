import { CommonModule } from '@angular/common';
import { Component, effect, Injector, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { firstValueFrom } from 'rxjs';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TrainingBannerComponent } from '../../../shared/components/training-banner/training-banner.component';
import { TrainingPlanEditView } from '../model/training-plan-edit-view';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { EditTrainingPlanService } from './edit-training-plan.service';

/**
 * Component for editing a training plan using signals.
 */
@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  providers: [EditTrainingPlanService],
  imports: [
    CommonModule,
    SkeletonComponent,
    FormsModule,
    FloatingLabelInputComponent,
    ImageCropperComponent,
    TrainingBannerComponent,
  ],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, OnConfirm {
  /**
   * The unique identifier for the training plan passed as a signal via the modal service.
   */
  id = signal('');

  /**
   * The training plan object that contains the form fields using Angular signals.
   */
  trainingPlanEditView!: TrainingPlanEditView;

  constructor(
    private injector: Injector,
    private trainingPlanService: TrainingPlanService,
    private editTrainingPlanService: EditTrainingPlanService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    effect(
      async () => {
        await this.fetchTrainingPlan();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Handles form submission, checking the validity of all form fields.
   */
  onConfirm(): void {
    if (this.trainingPlanEditView.isValid()) {
      const formData = this.trainingPlanEditView.toDto();

      this.editTrainingPlanService.editTrainingPlan(this.trainingPlanEditView.id(), formData).subscribe((response) => {
        this.trainingPlanService.trainingPlanChanged();
        this.toastService.success('Plan bearbeitet');
      });
    }
  }

  /**
   * Fetches the training plan details to edit and initializes the TrainingPlan class with values.
   */
  private async fetchTrainingPlan(): Promise<void> {
    const response = await firstValueFrom(this.editTrainingPlanService.getPlanForEdit(this.id()));

    this.trainingPlanEditView = TrainingPlanEditView.fromDto(response);
  }
}
