import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalEventsService } from '../../service/modal-events.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientService } from '../../service/http-client.service';
import { HttpMethods } from '../types/httpMethods';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(
    private fb: FormBuilder,
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

  ngOnInit() {
    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() => this.onSubmit())
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;
      console.log(
        '🚀 ~ CreateTrainingFormComponent ~ onSubmit ~ formData:',
        formData
      );
      this.httpClient
        .request<any>(HttpMethods.POST, 'training/create', formData)
        .subscribe({
          next: (response: Response) => {
            console.log('Training plan sucessfully created:', response);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Login error:', error);
            if (error.status === 404) {
              console.log('Nutzer nicht angemeldet');
            }
          },
        });
    } else {
      this.trainingForm.markAllAsTouched(); // Show validation errors
    }
  }

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
