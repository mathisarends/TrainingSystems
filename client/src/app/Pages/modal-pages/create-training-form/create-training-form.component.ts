import { Component, ViewChild, ElementRef, input, signal, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../../service/http/http-client.service';
import { TrainingPlanService } from '../../../../service/training/training-plan.service';
import { ImageUploadService } from '../../../../service/util/image-upload.service';
import { ModalService } from '../../../../service/modal/modalService';
import { ToastService } from '../../../components/toast/toast.service';
import { TrainingPlanCardView } from '../../../../types/exercise/training-plan-card-view-dto';
import { AlertComponent } from '../../../components/alert/alert.component';

/**
 * Component for creating a training form.
 */
@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AlertComponent],
  templateUrl: './create-training-form.component.html',
  styleUrls: ['./create-training-form.component.scss'],
})
export class CreateTrainingFormComponent {
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
  async onSubmit() {
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

  onSecondaryButtonClick() {
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
  handleImageUpload(event: any) {
    this.imageUploadService.handleImageUpload(event, (result: string) => {
      if (this.coverImage) {
        this.coverImage.nativeElement.src = result;
      }
      this.trainingForm.patchValue({ coverImage: result });
    });
  }
}
