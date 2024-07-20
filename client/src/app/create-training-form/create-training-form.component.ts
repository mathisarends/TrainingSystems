import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { ModalEventsService } from '../../service/modal-events.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../../service/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { HttpErrorResponse } from '@angular/common/http';
import { TrainingPlanService } from '../training-plan.service';
import { ImageUploadService } from '../image-upload.service';
import { ModalService } from '../../service/modalService';

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
export class CreateTrainingFormComponent implements OnInit, OnDestroy {
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
    private httpClient: HttpClientService,
    private imageUploadService: ImageUploadService,
    private modalService: ModalService
  ) {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      trainingFrequency: ['4', Validators.required],
      trainingWeeks: ['4', Validators.required],
      weightPlaceholders: ['max', Validators.required],
      coverImage: [''],
    });
  }

  /**
   * Lifecycle hook to handle initialization tasks.
   */
  ngOnInit() {
    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() => this.onSubmit())
    );
  }

  /**
   * Lifecycle hook to handle cleanup tasks.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Handles form submission.
   */
  async onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      try {
        const response = await firstValueFrom(
          this.httpClient.request<any>(
            HttpMethods.POST,
            'training/create',
            formData
          )
        );

        this.trainingPlanService.trainingPlanChanged();
        this.modalService.close(); // Close modal on successful submission
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          // Handle error (show user feedback)
        }
      }
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
