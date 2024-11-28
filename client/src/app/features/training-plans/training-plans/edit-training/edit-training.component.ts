import { Component, DestroyRef, effect, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { FormInputComponent } from '../../../../shared/components/form-input/form-input.component';
import { ModalValidationService } from '../../../../shared/components/modal/modal-validation.service';
import { Validatable } from '../../../../shared/components/modal/validatable';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { IconName } from '../../../../shared/icon/icon-name';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [ToDropDownOptionsPipe, TrainingBannerComponent, FormInputComponent],
  templateUrl: './edit-training.component.html',
  styleUrls: ['./edit-training.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, Validatable {
  protected readonly IconName = IconName;

  markInputFieldsAsTouched = signal(false);

  constructor(
    protected trainingPlanEditView: TrainingPlanEditView,
    private modalValidationService: ModalValidationService,
    private imageUploadService: ImageUploadService,
    private destroyRef: DestroyRef,
  ) {
    effect(
      () => {
        this.validate();
      },
      { allowSignalWrites: true },
    );
  }

  ngOnInit(): void {
    this.modalValidationService.triggerFormValidation$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.markInputFieldsAsTouched.set(true);
    });
  }

  ngOnDestroy(): void {
    this.modalValidationService.updateValidationState(true);
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
    if (this.trainingPlanEditView.title() && this.trainingPlanEditView.isTrainingBlockLengthValid()) {
      this.modalValidationService.updateValidationState(true);
    } else {
      this.modalValidationService.updateValidationState(false);
    }
  }

  protected makeTrainingPlanTitleSuggestion(): void {
    const randomSuggestion = this.trainingPlanEditView.getRandomTrainingPlanTitle();
    this.trainingPlanEditView.title.set(randomSuggestion);
  }
}
