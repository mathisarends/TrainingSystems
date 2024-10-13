import { Component, DestroyRef, effect, Injector, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FloatingLabelInputComponent } from '../../../shared/components/floating-label-input/floating-label-input.component';
import { OnConfirm } from '../../../shared/components/modal/on-confirm';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { TrainingBannerComponent } from '../../../shared/components/training-banner/training-banner.component';
import { TrainingPlanService } from '../../training-plans/training-view/services/training-plan.service';
import { TrainingSession } from '../training-session';
import { TrainingSessionService } from '../training-session-service';

@Component({
  standalone: true,
  imports: [SkeletonComponent, TrainingBannerComponent, FloatingLabelInputComponent],
  selector: 'app-edit-training-session',
  templateUrl: './edit-training-session.component.html',
  styleUrls: ['./edit-training-session.component.scss'],
  providers: [TrainingSessionService],
})
export class EditTrainingSessionComponent implements OnInit, OnConfirm {
  /**
   * The unique identifier for the training plan passed as a signal via the modal service.
   */
  id = signal('');

  trainingSession!: TrainingSession;

  constructor(
    private injector: Injector,
    private trainingSessionService: TrainingSessionService,
    private trainingPlanService: TrainingPlanService,
    private destroyRef: DestroyRef,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    effect(
      () => {
        this.fetchTrainingPlan();
      },
      { injector: this.injector, allowSignalWrites: true },
    );
  }

  onConfirm(): void {
    const sessionMetadataDto = this.trainingSession.toSessionMetadataDto();

    this.trainingSessionService.editTrainingSession(this.id(), sessionMetadataDto).subscribe((response) => {
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
        console.log('🚀 ~ EditTrainingSessionComponent ~ .subscribe ~ trainingSessionDto:', trainingSessionDto);
        const trainingSession = TrainingSession.fromDto(trainingSessionDto);
        this.trainingSession = trainingSession;
      });
  }
}
