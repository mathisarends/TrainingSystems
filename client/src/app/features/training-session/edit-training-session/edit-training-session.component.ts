import { Component, DestroyRef, effect, ElementRef, Injector, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { AbstractImageCropperComponent } from '../../../shared/components/abstract-image-cropper/abstract-image-cropper.component';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ImageUploadService } from '../../../shared/service/image-upload.service';
import { TrainingPlanService } from '../../training-plans/training-view/services/training-plan.service';
import { TrainingSession } from '../training-session';
import { TrainingSessionService } from '../training-session-service';

@Component({
  standalone: true,
  imports: [SkeletonComponent, ImageCropperComponent, FloatingLabelInputComponent],
  selector: 'app-edit-training-session',
  templateUrl: './edit-training-session.component.html',
  styleUrls: ['./edit-training-session.component.scss'],
  providers: [TrainingSessionService],
})
export class EditTrainingSessionComponent extends AbstractImageCropperComponent implements OnInit, OnConfirm {
  protected readonly placeholderCoverImage = '/images/training/training_3.png';
  @ViewChild('coverImage') coverImageElement!: ElementRef<HTMLImageElement>;

  /**
   * The unique identifier for the training plan passed as a signal via the modal service.
   */
  id = signal('');

  trainingSession = signal<TrainingSession | null>(null);

  /**
   * Signal indicating whether the training plan is loading.
   */
  loading = signal(true);

  constructor(
    private injector: Injector,
    private trainingSessionService: TrainingSessionService,
    private trainingPlanService: TrainingPlanService,
    private destroyRef: DestroyRef,
    imageUploadService: ImageUploadService,
    toastService: ToastService,
  ) {
    super(imageUploadService, toastService);
  }

  override async ngOnInit(): Promise<void> {
    effect(
      () => {
        this.fetchTrainingPlan();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  override onConfirm(): void {
    const sessionMetadataDto = this.trainingSession()!.toSessionMetadataDto();

    this.trainingSessionService.editTrainingSession(sessionMetadataDto).subscribe((response) => {
      this.trainingPlanService.trainingPlanChanged();
      this.toastService.success(response.message);
    });
  }

  /**
   * Fetches the training plan details to edit and initializes the TrainingPlan class with values.
   */
  private fetchTrainingPlan(): void {
    this.trainingSessionService
      .getTrainingSessionById(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((trainingSessionDto) => {
        const trainingSession = TrainingSession.fromDto(trainingSessionDto);
        this.trainingSession.set(trainingSession);
        this.loading.set(false);
      });
  }

  /**
   * Handles image upload and updates the cover image signal.
   * @param event - The file input change event.
   */
  protected async handleImageUpload(event: any): Promise<void> {
    const uploadedImageBase64Str = await this.imageUploadService.handleImageUpload(event);

    if (uploadedImageBase64Str) {
      this.trainingSession()!.coverImageBase64.set(uploadedImageBase64Str);
      this.image.set(uploadedImageBase64Str);
    }
  }

  uploadImage(image: string | null): void {}
}
