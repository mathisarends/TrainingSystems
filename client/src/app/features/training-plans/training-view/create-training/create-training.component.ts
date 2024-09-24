import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { ModalService } from '../../../../core/services/modal/modalService';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { OnToggleView } from '../../../../shared/components/modal/on-toggle-view';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { WeightRecommendationBase } from '../../edit-training-plan/training-plan-edit-view-dto';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../services/training-plan.service';

/**
 * Component for creating a training form using Angular Signals.
 */
@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [CommonModule, FloatingLabelInputComponent],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
})
export class CreateTrainingComponent implements OnInit, OnConfirm, OnToggleView {
  @ViewChild('coverImage') coverImage!: ElementRef<HTMLImageElement>;
  protected readonly placeholderCoverImage = '/images/training/training_3.png';

  existingPlans = signal<TrainingPlanCardView[]>([]);
  showCreatePlanBasedOnExistingOne = signal(false);
  selectedPlan = signal<TrainingPlanCardView | undefined>(undefined);

  // Form Signals
  title = signal<string>('');
  trainingFrequency = signal<number>(4);
  trainingWeeks = signal<number>(4);
  weightPlaceholders = signal<WeightRecommendationBase>(WeightRecommendationBase.LASTWEEK);
  coverImageBase64 = signal<string>(this.placeholderCoverImage);

  // Validation
  isTitleValid = signal(true);
  isTrainingFrequencyValid = signal(true);
  isTrainingWeeksValid = signal(true);

  selectedPlanId = signal<string>('');

  constructor(
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        const selectedPlan = this.existingPlans().find((plan) => plan.id === this.selectedPlanId());
        if (selectedPlan) {
          this.populateFormWithPlan(selectedPlan);
        }
      },
      { allowSignalWrites: true, injector: this.injector },
    );
  }

  /**
   * Populates the signals with data from an existing plan.
   * @param plan - The training plan to pre-fill the form with.
   */
  populateFormWithPlan(plan: TrainingPlanCardView): void {
    this.title.set(plan.title + ' RE');
    this.trainingFrequency.set(plan.trainingFrequency);
    this.trainingWeeks.set(plan.blockLength);
    this.weightPlaceholders.set(plan.weightRecomamndationBase);
    this.coverImageBase64.set(plan.coverImageBase64 ?? this.placeholderCoverImage);
  }

  /**
   * Handles form submission using signals.
   */
  async onConfirm() {
    if (!this.validateForm()) {
      return;
    }

    const formData = {
      title: this.title(),
      trainingFrequency: this.trainingFrequency(),
      trainingWeeks: this.trainingWeeks(),
      weightPlaceholders: this.weightPlaceholders(),
      coverImage: this.coverImageBase64(),
    };

    await firstValueFrom(this.httpClient.post('/training/create', formData));

    this.toastService.success('Plan erstellt!');
    this.trainingPlanService.trainingPlanChanged();
    this.modalService.close();
  }

  /**
   * Validates the form fields using signals.
   */
  private validateForm(): boolean {
    this.isTitleValid.set(this.title().trim().length > 0);
    this.isTrainingFrequencyValid.set(this.trainingFrequency() > 0);
    this.isTrainingWeeksValid.set(this.trainingWeeks() > 0);

    return this.isTitleValid() && this.isTrainingFrequencyValid() && this.isTrainingWeeksValid();
  }

  /**
   * Handles image upload and updates the corresponding signal.
   */
  async handleImageUpload(event: any) {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (uploadedImageBase64Str) {
      this.coverImageBase64.set(uploadedImageBase64Str);
    }
  }

  onToggleView() {
    if (this.showCreatePlanBasedOnExistingOne()) {
      this.showCreatePlanBasedOnExistingOne.set(false);
      this.resetForm();
      return;
    }

    this.showCreatePlanBasedOnExistingOne.set(true);
    const selectedPlan = this.existingPlans()[0] ?? undefined;
    this.selectedPlan.set(selectedPlan);

    if (selectedPlan) {
      this.populateFormWithPlan(selectedPlan);
    }
  }

  /**
   * Resets the form to default values.
   */
  private resetForm() {
    this.title.set('');
    this.trainingFrequency.set(4);
    this.trainingWeeks.set(4);
    this.weightPlaceholders.set(WeightRecommendationBase.LASTWEEK);
    this.coverImageBase64.set(this.placeholderCoverImage);
  }
}
