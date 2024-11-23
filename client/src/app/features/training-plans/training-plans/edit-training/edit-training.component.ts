import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [CommonModule, ToDropDownOptionsPipe, TrainingBannerComponent, FormInputComponent],
  templateUrl: './edit-training.component.html',
  styleUrls: ['./edit-training.component.scss'],
})
export class EditTrainingPlanComponent {
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
