import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { HttpService } from '../../../../core/services/http-client.service';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { OnToggleView } from '../../../../shared/components/modal/on-toggle-view';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingPlanCardView } from '../models/exercise/training-plan-card-view-dto';
import { TrainingPlanService } from '../services/training-plan.service';

/**
 * Component for creating a training form using Angular Signals.
 */
@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [CommonModule, FloatingLabelInputComponent, ToDropDownOptionsPipe],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
})
export class CreateTrainingComponent implements OnInit, OnConfirm, OnToggleView {
  @ViewChild('coverImage') coverImage!: ElementRef<HTMLImageElement>;
  protected readonly placeholderCoverImage = '/images/training/training_3.png';

  existingPlans = signal<TrainingPlanCardView[]>([]);

  isExistingPlanMode = signal(false);

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
    private injector: Injector,
  ) {}

  ngOnInit(): void {
    this.trainingPlanEditView = TrainingPlanEditView.fromDto();

    effect(
      () => {
        if (!this.selectedPlanId() && this.isExistingPlanMode()) {
          this.selectedPlanId.set(this.existingPlans()[0]?.id ?? null);
        }

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
    this.trainingPlanEditView.title.set(plan.title + ' RE');
    this.trainingPlanEditView.trainingFrequency.set(plan.trainingFrequency);
    this.trainingPlanEditView.trainingBlockLength.set(plan.blockLength);
    this.trainingPlanEditView.weightRecommendationBase.set(plan.weightRecomamndationBase);
    this.trainingPlanEditView.coverImageBase64.set(plan.coverImageBase64 ?? this.placeholderCoverImage);
  }

  /**
   * Handles form submission using signals.
   */
  onConfirm(): void {
    if (!this.trainingPlanEditView.isValid()) {
      return;
    }

    if (this.isExistingPlanMode()) {
      this.trainingPlanEditView.setReferencePlanId(this.selectedPlanId());
    }

    this.httpClient.post('/training/create', this.trainingPlanEditView.toDto()).subscribe(() => {
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

  onToggleView() {
    this.isExistingPlanMode.set(!this.isExistingPlanMode());

    if (!this.isExistingPlanMode()) {
      this.trainingPlanEditView.resetToDefaults();
    }
  }
}
