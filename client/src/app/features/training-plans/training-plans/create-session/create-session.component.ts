import { Component, OnInit } from '@angular/core';
import { FloatingLabelInputComponent } from '../../../../shared/components/floating-label-input/floating-label-input.component';
import { ToDropDownOptionsPipe } from '../../../../shared/components/floating-label-input/to-dropdown-options.pipe';
import { OnConfirm } from '../../../../shared/components/modal/on-confirm';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { TrainingBannerComponent } from '../../../../shared/components/training-banner/training-banner.component';
import { ImageUploadService } from '../../../../shared/service/image-upload.service';
import { TrainingSessionMetaDataDto } from '../../../training-session/training-session-meta-data-dto';
import { TrainingSessionService } from '../../../training-session/training-session-service';
import { TrainingPlanEditView } from '../../model/training-plan-edit-view';
import { TrainingPlanService } from '../../training-view/services/training-plan.service';

// TODO: Session hier implementieren und erstellen lassen innerhalb einer eigenen Komponente (dann auch die Session-API im Backend implementieren)
@Component({
  selector: 'app-create-session',
  standalone: true,
  imports: [FloatingLabelInputComponent, ToDropDownOptionsPipe, TrainingBannerComponent],
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss'],
  providers: [TrainingSessionService],
})
export class CreateSessionComponent implements OnInit, OnConfirm {
  /**
   * The training plan object that contains the form fields using Angular signals.
   */
  trainingPlanEditView!: TrainingPlanEditView;

  constructor(
    private trainingSessionService: TrainingSessionService,
    private trainingPlanService: TrainingPlanService,
    private imageUploadService: ImageUploadService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.trainingPlanEditView = TrainingPlanEditView.fromDto();
  }

  onConfirm(): void {
    if (!this.trainingPlanEditView.title()) {
      return;
    }

    const trainingSessionCreateDto: TrainingSessionMetaDataDto = {
      title: this.trainingPlanEditView.title(),
      weightRecommandationBase: this.trainingPlanEditView.weightRecommendationBase(),
      coverImageBase64: this.trainingPlanEditView.coverImageBase64(),
    };

    this.trainingSessionService.createNewTrainingSession(trainingSessionCreateDto).subscribe(() => {
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
}
