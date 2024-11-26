import { Component, effect } from '@angular/core';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { ModalValidationService } from '../../../../shared/components/modal/modal-validation.service';
import { Validatable } from '../../../../shared/components/modal/validatable';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [ToDropDownOptionsPipe, TrainingBannerComponent, FormInputComponent],
  templateUrl: './edit-training.component.html',
  styleUrls: ['./edit-training.component.scss'],
})
export class EditTrainingPlanComponent implements Validatable {
  constructor(
    protected trainingPlanEditView: TrainingPlanEditView,
    private modalValidationService: ModalValidationService,
    private imageUploadService: ImageUploadService,
  ) {
    effect(
      () => {
        this.validate();
      },
      { allowSignalWrites: true },
    );
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

  validate(): void {
    if (this.trainingPlanEditView.title() && this.trainingPlanEditView.trainingBlockLength()) {
      this.modalValidationService.updateValidationState(true);
    } else {
      this.modalValidationService.updateValidationState(false);
    }
  }

  ngOnDestroy(): void {
    this.modalValidationService.updateValidationState(true);
  }
}
