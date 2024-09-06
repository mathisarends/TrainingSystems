import { Component, ViewChild, ElementRef, input } from '@angular/core';
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
export class CreateTrainingFormComponent {
  @ViewChild('coverImage') coverImage!: ElementRef<HTMLImageElement>;

  existingPlans = input<TrainingPlanCardView[]>([]);

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
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private imageUploadService: ImageUploadService,
    private modalService: ModalService,
    private toastService: ToastService,
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
   * Handles form submission.
   */
  async onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      await firstValueFrom(this.httpClient.post('/training/create', formData));

      this.toastService.success('Plan erstellt!');

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
