import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { ModalEventsService } from '../../service/modal-events.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../../service/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { HttpErrorResponse } from '@angular/common/http';
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
  private subscription: Subscription = new Subscription();
  trainingForm: FormGroup;

  /**
   * Constructor to initialize the form and inject dependencies.
   * @param fb - FormBuilder to create the form group.
   * @param modalEventsService - Service to handle modal events.
   * @param httpClient - Service to handle HTTP requests.
   */
  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private modalEventsService: ModalEventsService,
    private httpClient: HttpClientService
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

        this.modalService.close(); // Close the modal on success
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          console.error('Error creating training plan:', error);
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
  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const coverImage = document.getElementById(
          'cover-image'
        ) as HTMLImageElement;
        coverImage.src = e.target.result;
        this.trainingForm.patchValue({ coverImage: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }
}
