import { Component, OnInit, ViewChild, ElementRef, Input, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { ModalEventsService } from '../../../../service/modal/modal-events.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../../service/http/http-client.service';
import { TrainingPlanService } from '../../../../service/training/training-plan.service';
import { ImageUploadService } from '../../../../service/util/image-upload.service';
import { ModalService } from '../../../../service/modal/modalService';
import { ToastService } from '../../../components/toast/toast.service';
import { TrainingPlanCardView } from '../../../../types/exercise/training-plan-card-view-dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Component for creating a training form.
 */
@Component({
  selector: 'app-create-training-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-training-form.component.html',
  styleUrls: ['./create-training-form.component.scss'],
})
export class CreateTrainingFormComponent implements OnInit {
  @Input() existingPlans: TrainingPlanCardView[] = [];

  @ViewChild('coverImage') coverImage!: ElementRef<HTMLImageElement>;
  private subscription: Subscription = new Subscription();
  trainingForm: FormGroup;

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
    private modalEventsService: ModalEventsService,
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
    private destroyRef: DestroyRef,
  ) {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      trainingFrequency: ['4', Validators.required],
      trainingWeeks: ['4', Validators.required],
      weightPlaceholders: ['lastWeek', Validators.required],
      coverImage: [''],
    });
  }

  /**
   * Lifecycle hook to handle initialization tasks.
   */
  ngOnInit() {
    this.subscription.add(
      this.modalEventsService.confirmClick$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.onSubmit()),
    );
  }

  /**
   * Handles form submission.
   */
  async onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      await firstValueFrom(this.httpClient.post('/training/create', formData));

      this.toastService.show('Erfolg', 'Plan erstellt!');

      this.trainingPlanService.trainingPlanChanged();
      this.modalService.close(); // Close modal on successful submission
    } else {
      this.trainingForm.markAllAsTouched();
    }
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
