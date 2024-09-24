import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, Injector, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modalService';
import { AbstractImageCropperComponent } from '../../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../shared/service/image-upload.service';
import { TrainingPlan } from '../model/training-plan-edit-view';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { EditTrainingPlanService } from './edit-training-plan.service';

/**
 * Component for editing a training plan using signals.
 */
@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  providers: [EditTrainingPlanService],
  imports: [CommonModule, SkeletonComponent, FormsModule, FloatingLabelInputComponent, ImageCropperComponent],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent extends AbstractImageCropperComponent implements OnInit, OnConfirm {
  protected readonly placeholderCoverImage = '/images/training/training_3.png';
  @ViewChild('coverImage') coverImageElement!: ElementRef<HTMLImageElement>;

  /**
   * The unique identifier for the training plan passed as a signal via the modal service.
   */
  id = signal('');

  /**
   * The training plan object that contains the form fields using Angular signals.
   */
  trainingPlan!: TrainingPlan;

  /**
   * Signal indicating whether the training plan is loading.
   */
  loading = signal(true);

  constructor(
    private injector: Injector,
    private modalService: ModalService,

    private trainingPlanService: TrainingPlanService,
    private renderer: Renderer2,
    private editTrainingPlanService: EditTrainingPlanService,
    imageUploadService: ImageUploadService,
    toastService: ToastService,
  ) {
    super(imageUploadService, toastService);
  }

  override async ngOnInit(): Promise<void> {
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
  override onConfirm(): void {
    if (this.isFormValid()) {
      const formData = this.trainingPlan.toDto();

      this.editTrainingPlanService.editTrainingPlan(this.trainingPlan.id(), formData).subscribe((response) => {
        this.trainingPlanService.trainingPlanChanged();
        this.modalService.close();
        this.toastService.success(response.message);
      });
    }
  }

  uploadImage(image: string | null): void {}

  /**
   * Fetches the training plan details to edit and initializes the TrainingPlan class with values.
   */
  private async fetchTrainingPlan(): Promise<void> {
    const response = await firstValueFrom(this.editTrainingPlanService.getPlanForEdit(this.id()));

    this.trainingPlan = new TrainingPlan(response);
    this.image.set(this.trainingPlan.coverImageBase64());

    this.loading.set(false);
  }

  /**
   * Checks the overall form validity by verifying all individual field signals.
   * @returns true if the form is valid; false otherwise.
   */
  private isFormValid(): boolean {
    return (
      this.trainingPlan.title().trim().length > 0 &&
      !!this.trainingPlan.trainingFrequency() &&
      !!this.trainingPlan.trainingBlockLength() &&
      !!this.trainingPlan.weightRecommendationBase()
    );
  }

  /**
   * Handles image upload and updates the cover image signal.
   * @param event - The file input change event.
   */
  protected async handleImageUpload(event: any): Promise<void> {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (uploadedImageBase64Str) {
      this.trainingPlan.coverImageBase64.set(uploadedImageBase64Str);
      this.image.set(uploadedImageBase64Str);
    }
  }
}
