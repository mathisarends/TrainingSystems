import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { HttpService } from '../../../../core/services/http-client.service';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingSessionService } from '../../../training-session/training-session-service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingPlanType } from '../../training-view/models/training-plan-type';
import { TrainingPlanService } from '../../training-view/services/training-plan.service';

@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [CommonModule, FloatingLabelInputComponent, ToDropDownOptionsPipe, TrainingBannerComponent],
  templateUrl: './create-training.component.html',
  styleUrls: ['./create-training.component.scss'],
  providers: [TrainingSessionService],
})
export class CreateTrainingComponent implements OnConfirm {
  protected readonly TrainingPlanType = TrainingPlanType;

  /**
   * Signal indicating whether the training plan is loading.
   */
  loading = signal(true);

  selectedPlanId = signal<string>('');

  constructor(
    protected trainingPlanEditView: TrainingPlanEditView,
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
  ) {}

  /**
   * Handles form submission using signals.
   * Returns an Observable that completes when the submission is done.
   */
  onConfirm(): Observable<void> {
    if (!this.trainingPlanEditView.isValid()) {
      return of();
    }

    return this.httpClient.post<void>('/training', this.trainingPlanEditView.toDto()).pipe(
      tap(() => {
        this.trainingPlanService.trainingPlanChanged();
      }),
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
}
