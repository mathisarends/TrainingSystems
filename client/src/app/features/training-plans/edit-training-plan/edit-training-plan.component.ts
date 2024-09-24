import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, Injector, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modalService';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../shared/service/image-upload.service';
import { TrainingPlanService } from '../training-view/services/training-plan.service';
import { EditTrainingPlanService } from './edit-training-plan.service';

/**
 * Component for editing a training plan using signals.
 */
@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  providers: [EditTrainingPlanService],
  imports: [CommonModule, SkeletonComponent, FormsModule, FloatingLabelInputComponent],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, OnConfirm {
  protected readonly placeholderCoverImage = '/images/training/training_3.png';
  @ViewChild('coverImage') coverImageElement!: ElementRef<HTMLImageElement>;

  id = signal('');

  title = signal('');
  trainingFrequency = signal<number>(0);
  trainingWeeks = signal<number>(0);
  weightPlaceholders = signal<'lastWeek' | 'off'>('lastWeek');
  coverImage = signal('');

  isTitleValid = computed(() => this.title().trim().length > 0);
  isTrainingFrequencyValid = computed(() => !!this.trainingFrequency());
  isTrainingWeeksValid = computed(() => !!this.trainingWeeks());
  isWeightPlaceholdersValid = computed(() => !!this.weightPlaceholders());

  loading = signal(true);

  constructor(
    private injector: Injector,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanService: TrainingPlanService,
    private renderer: Renderer2,
    private editTrainingPlanService: EditTrainingPlanService,
    private imageUploadService: ImageUploadService,
  ) {}

  async ngOnInit(): Promise<void> {
    effect(
      () => {
        this.fetchTrainingPlan();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  /**
   * Fetches the training plan details to edit and updates signals with values.
   */
  private async fetchTrainingPlan(): Promise<void> {
    const response = await firstValueFrom(this.editTrainingPlanService.getPlanForEdit(this.id()));

    this.title.set(response.title);
    this.trainingFrequency.set(response.trainingFrequency);
    this.trainingWeeks.set(response.trainingBlockLength);
    this.weightPlaceholders.set(response.weightRecommandationBase);
    this.coverImage.set(response.coverImageBase64 || '');

    this.setCoverImage(response.coverImageBase64 || '');

    this.loading.set(false);
  }

  /**
   * Sets the cover image for the training plan.
   * @param imageUrl - The URL or Base64 of the cover image.
   */
  private setCoverImage(imageUrl: string): void {
    if (this.coverImageElement) {
      this.renderer.setAttribute(
        this.coverImageElement.nativeElement,
        'src',
        imageUrl || 'https://via.placeholder.com/150',
      );
    }
  }

  /**
   * Handles form submission, checking the validity of all form fields.
   */
  onConfirm(): void {
    if (this.isFormValid()) {
      const formData = {
        title: this.title(),
        trainingFrequency: this.trainingFrequency(),
        trainingWeeks: this.trainingWeeks(),
        weightPlaceholders: this.weightPlaceholders(),
        coverImage: this.coverImage(),
      };

      this.editTrainingPlanService.editTrainingPlan(this.id(), formData).subscribe((response) => {
        this.trainingPlanService.trainingPlanChanged();
        this.modalService.close();
        this.toastService.success(response.message);
      });
    }
  }

  /**
   * Checks the overall form validity by verifying all individual field signals.
   * @returns true if the form is valid; false otherwise.
   */
  private isFormValid(): boolean {
    return (
      this.isTitleValid() &&
      this.isTrainingFrequencyValid() &&
      this.isTrainingWeeksValid() &&
      this.isWeightPlaceholdersValid()
    );
  }

  /**
   * Handles image upload and updates the cover image signal.
   * @param event - The file input change event.
   */
  protected async handleImageUpload(event: any): Promise<void> {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (uploadedImageBase64Str) {
      this.coverImage.set(uploadedImageBase64Str);
      this.setCoverImage(uploadedImageBase64Str);
    }
  }
}
