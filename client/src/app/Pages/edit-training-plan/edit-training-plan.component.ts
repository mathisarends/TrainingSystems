import { Component, OnInit, OnDestroy, Input, Renderer2, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../../service/modal/modal-events.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpService } from '../../../service/http/http-client.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../../components/loaders/spinner/spinner.component';
import { ModalService } from '../../../service/modal/modalService';
import { TrainingPlanService } from '../../../service/training/training-plan.service';
import { ImageUploadService } from '../../../service/util/image-upload.service';
import { ToastService } from '../../components/toast/toast.service';

/**
 * Component for editing a training plan.
 */
@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() id!: string;
  @ViewChild('coverImage') coverImageElement!: ElementRef<HTMLImageElement>;

  protected trainingForm: FormGroup;
  protected loading: boolean = true;

  private subscription: Subscription = new Subscription();

  /**
   * Constructor to initialize the form and inject dependencies.
   * @param fb - FormBuilder to create the form group.
   * @param modalEventsService - Service to handle modal events.
   * @param modalService - Service to handle modal operations.
   * @param trainingPlanService - Service to manage training plans.
   * @param httpClient - Service to handle HTTP requests.
   * @param renderer - Renderer2 instance to manipulate DOM elements.
   * @param imageUploadService - Service to handle image uploads.
   */
  constructor(
    private fb: FormBuilder,
    private modalEventsService: ModalEventsService,
    private modalService: ModalService,
    private toastService: ToastService,
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpService,
    private renderer: Renderer2,

    private imageUploadService: ImageUploadService,
  ) {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      trainingFrequency: ['', Validators.required],
      trainingWeeks: ['', Validators.required],
      weightPlaceholders: ['', Validators.required],
      coverImage: [''],
    });
  }

  /**
   * Lifecycle hook to handle initialization tasks.
   */
  async ngOnInit(): Promise<void> {
    if (this.id) {
      await this.fetchTrainingPlan(this.id);
    }

    this.subscription.add(this.modalEventsService.confirmClick$.subscribe(() => this.onSubmit()));
  }

  /**
   * Lifecycle hook to handle view checks.
   */
  ngAfterViewChecked(): void {
    this.setCoverImage(this.trainingForm.get('coverImage')?.value || '');
  }

  /**
   * Lifecycle hook to handle cleanup tasks.
   */
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Fetches the training plan details to edit.
   * @param id - The ID of the training plan to fetch.
   */
  private async fetchTrainingPlan(id: string): Promise<void> {
    try {
      const response: any = await firstValueFrom(this.httpClient.get<any>(`/training/edit/${id}`));

      this.loading = false;

      this.trainingForm.patchValue({
        title: response.trainingPlanEditView.title,
        trainingFrequency: response.trainingPlanEditView.trainingFrequency,
        trainingWeeks: response.trainingPlanEditView.trainingWeeks.length,
        weightPlaceholders: response.trainingPlanEditView.weightRecommandationBase,
        coverImage: response.trainingPlanEditView.coverImageBase64 || '',
      });

      this.setCoverImage(response.trainingPlanEditView.coverImageBase64 || '');
    } catch (error) {
      console.error('Error fetching training plan:', error);
      if (error instanceof HttpErrorResponse && error.status === 404) {
        console.log('Training plan not found');
      }
    }
  }

  /**
   * Sets the cover image for the training plan.
   * @param imageUrl - The URL of the cover image.
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
   * Handles form submission.
   */
  protected async onSubmit(): Promise<void> {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      try {
        await firstValueFrom(this.httpClient.patch(`/training/edit/${this.id}`, formData));
        this.trainingPlanService.trainingPlanChanged();
        this.modalService.close();

        this.toastService.show('Erfolg', 'Plan bearbeitet');
      } catch (error) {
        const httpError = error as HttpErrorResponse;

        console.error('Error updating training plan:', error);

        if (httpError.status === 404) {
          console.log('Training plan not found');
        } else {
          console.error('An error occurred:', httpError.message);
        }
      }
    } else {
      this.trainingForm.markAllAsTouched(); // Show validation errors
    }
  }

  /**
   * Handles image upload and updates the form control.
   * @param event - The file input change event.
   */
  protected handleImageUpload(event: any): void {
    this.imageUploadService.handleImageUpload(event, (result: string) => {
      if (this.coverImageElement) {
        this.renderer.setAttribute(this.coverImageElement.nativeElement, 'src', result);
      }
      this.trainingForm.patchValue({ coverImage: result });
    });
  }
}
