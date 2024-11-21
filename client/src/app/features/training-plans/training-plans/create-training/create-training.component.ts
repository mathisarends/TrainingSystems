import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingSessionService } from '../../../training-session/training-session-service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingPlanType } from '../../training-view/models/training-plan-type';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [
    CommonModule,
    FloatingLabelInputComponent,
    ToDropDownOptionsPipe,
    TrainingBannerComponent,
    FormInputComponent,
  ],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
  providers: [TrainingSessionService],
})
export class CreateTrainingComponent {
  protected readonly TrainingPlanType = TrainingPlanType;

  /**
   * Signal indicating whether the training plan is loading.
   */
  loading = signal(true);

  selectedPlanId = signal<string>('');

  constructor(
    protected trainingPlanEditView: TrainingPlanEditView,
    private imageUploadService: ImageUploadService,
  ) {}

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
