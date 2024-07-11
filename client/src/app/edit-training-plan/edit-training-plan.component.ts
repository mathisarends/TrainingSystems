import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { HttpMethods } from '../types/httpMethods';
import { HttpErrorResponse } from '@angular/common/http';
import { ModalEventsService } from '../../service/modal-events.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpClientService } from '../../service/http-client.service';
import { CommonModule } from '@angular/common';

import { SpinnerComponent } from '../components/spinner/spinner.component';

@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, OnDestroy {
  @Input() index!: number;
  private subscription: Subscription = new Subscription();
  trainingForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalEventsService: ModalEventsService,
    private httpClient: HttpClientService
  ) {
    this.trainingForm = this.fb.group({
      title: ['', Validators.required],
      trainingFrequency: ['', Validators.required],
      trainingWeeks: ['', Validators.required],
      weightPlaceholders: ['', Validators.required],
      coverImage: [''],
    });
  }

  ngOnInit() {
    if (this.index !== undefined) {
      this.fetchTrainingPlan(this.index);
    }

    console.log('index', this.index);

    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() => this.onSubmit())
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async fetchTrainingPlan(index: number) {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, `training/edit/${index}`)
      );

      console.log(
        '🚀 ~ EditTrainingPlanComponent ~ fetchTrainingPlan ~ response:',
        response
      );

      this.trainingForm.patchValue({
        title: response.trainingPlanEditView.title,
        trainingFrequency: response.trainingPlanEditView.trainingFrequency,
        trainingWeeks: response.trainingPlanEditView.trainingWeeks,
        weightPlaceholders:
          response.trainingPlanEditView.weightRecommandationBase,
        coverImage: response.trainingPlanEditView.coverImage || '',
      });

      const coverImageElement = document.getElementById(
        'cover-image'
      ) as HTMLImageElement;
      coverImageElement.src =
        response.trainingPlanEditView.coverImage ||
        'https://via.placeholder.com/150';
    } catch (error) {
      console.error('Error fetching training plan:', error);
      if (error instanceof HttpErrorResponse && error.status === 404) {
        console.log('Training plan not found');
      }
    }
  }

  onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;
      console.log(
        '🚀 ~ EditTrainingPlanComponent ~ onSubmit ~ formData:',
        formData
      );

      // Here you can make a PUT request to update the training plan
      // this.httpClient.request<any>(HttpMethods.PUT, `update/${this.index}`, formData).subscribe();
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
