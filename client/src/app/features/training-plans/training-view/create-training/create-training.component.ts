import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { ModalService } from '../../../../core/services/modal/modalService';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { OnToggleView } from '../../../../shared/components/modal/on-toggle-view';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../services/training-plan.service';

/**
 * Component for creating a training form.
 */
@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
})
export class CreateTrainingComponent implements OnConfirm, OnToggleView {
  private readonly placeholderCoverImage = '/images/training/training_3.jpg';

  @ViewChild('coverImage') coverImage!: ElementRef<HTMLImageElement>;

  @Input() existingPlans: TrainingPlanCardView[] = [];

  showCreatePlanBasedOnExistingOne = signal(false);
  selectedPlan = signal<TrainingPlanCardView | undefined>(undefined);

  trainingForm!: FormGroup;

  /**
   * Constructor to initialize the form and inject dependencies.
   * @param fb - FormBuilder to create the form group.
   * @param modalEventsService - Service to handle modal events.
   * @param httpClient - Service to handle HTTP requests.
   * @param trainingPlanService - Service to manage training plans.
   * @param imageUploadService - Service to handle image uploads.
   */
  constructor(
    private fb: FormBuilder,
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {
    this.initializeForm();
  }

  /**
   * Initializes the form with empty/default values.
   */
  initializeForm(): void {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      trainingFrequency: ['4', Validators.required],
      trainingWeeks: ['4', Validators.required],
      weightPlaceholders: ['lastWeek', Validators.required],
      coverImage: [this.placeholderCoverImage],
      referencePlanId: undefined,
    });
  }

  /**
   * Populates the form with data from an existing plan.
   * @param plan - The training plan to pre-fill the form with.
   */
  populateFormWithPlan(plan: TrainingPlanCardView): void {
    this.trainingForm.patchValue({
      title: plan.title + ' RE',
      trainingFrequency: plan.trainingFrequency,
      trainingWeeks: plan.blockLength,
      weightPlaceholders: plan.weightRecomamndationBase,
      coverImage: plan.coverImageBase64 ?? this.placeholderCoverImage,
      referencePlanId: plan.id,
    });

    if (this.coverImage) {
      this.coverImage.nativeElement.src = plan.coverImageBase64 ?? this.placeholderCoverImage;
    }
  }

  /**
   * Handles form submission.
   */
  async onConfirm() {
    if (!this.trainingForm.valid) {
      this.trainingForm.markAllAsTouched();
      return;
    }

    const formData = this.trainingForm.value;

    await firstValueFrom(this.httpClient.post('/training/create', formData));

    this.toastService.success('Plan erstellt!');

    this.trainingPlanService.trainingPlanChanged();
    this.modalService.close(); // Close modal on successful submission
  }

  onToggleView() {
    if (this.showCreatePlanBasedOnExistingOne()) {
      this.showCreatePlanBasedOnExistingOne.set(false);
      this.initializeForm();
      return;
    }

    this.showCreatePlanBasedOnExistingOne.set(true);
    this.selectedPlan.set(this.existingPlans[0] ?? undefined);

    if (this.selectedPlan() !== undefined) {
      this.populateFormWithPlan(this.selectedPlan()!);
    }
  }

  selectTrainingPlan(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedPlanId = selectElement.value;

    const selectedPlan = this.existingPlans.find((plan) => plan.id === selectedPlanId);
    this.selectedPlan.set(selectedPlan);

    this.populateFormWithPlan(selectedPlan!);
  }

  /**
   * Handles image upload and updates the form control.
   * @param event - The file input change event.
   */
  async handleImageUpload(event: any) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (!uploadedImageBase64Str) {
      return;
    }

    if (this.coverImage) {
      this.coverImage.nativeElement.src = uploadedImageBase64Str;
    }
    this.trainingForm.patchValue({ coverImage: uploadedImageBase64Str });
  }
}
