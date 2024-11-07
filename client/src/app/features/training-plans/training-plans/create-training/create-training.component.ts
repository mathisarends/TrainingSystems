import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { HttpService } from '../../../../core/services/http-client.service';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingSessionService } from '../../../training-session/training-session-service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingDaySelectionComponent } from '../../training-day-selection/training-day-selection.component';
import { TrainingPlanType } from '../../training-view/models/training-plan-type';
import { TrainingPlanService } from '../../training-view/services/training-plan.service';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [
    CommonModule,
    FloatingLabelInputComponent,
    ToDropDownOptionsPipe,
    TrainingBannerComponent,
    TrainingDaySelectionComponent,
  ],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
  providers: [TrainingSessionService],
})
export class CreateTrainingComponent implements OnInit, OnConfirm {
  protected readonly TrainingPlanType = TrainingPlanType;

  /**
   * The training plan object that contains the form fields using Angular signals.
   */
  trainingPlanEditView!: TrainingPlanEditView;

  /**
   * Signal indicating whether the training plan is loading.
   */
  loading = signal(true);

  selectedPlanId = signal<string>('');

  constructor(
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.trainingPlanEditView = TrainingPlanEditView.fromDto();
  }

  /**
   * Handles form submission using signals.
   */
  onConfirm(): void {
    if (!this.trainingPlanEditView.isValid()) {
      return;
    }

    this.httpClient.post('/training', this.trainingPlanEditView.toDto()).subscribe(() => {
      this.toastService.success('Plan erstellt');
      this.trainingPlanService.trainingPlanChanged();
    });
  }

  /**
   * Handles image upload and updates the corresponding signal.
   */
  async handleImageUpload(event: any) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (uploadedImageBase64Str) {
      this.trainingPlanEditView.coverImageBase64.set(uploadedImageBase64Str);
    }
  }
}
