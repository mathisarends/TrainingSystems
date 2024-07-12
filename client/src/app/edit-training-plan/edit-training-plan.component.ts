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
import { ModalService } from '../../service/modalService';
import { TrainingPlanService } from '../training-plan.service';

@Component({
  selector: 'app-edit-training-plan',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SpinnerComponent],
  templateUrl: './edit-training-plan.component.html',
  styleUrls: ['./edit-training-plan.component.scss'],
})
export class EditTrainingPlanComponent implements OnInit, OnDestroy {
  @Input() id!: string;
  private subscription: Subscription = new Subscription();
  trainingForm: FormGroup;

  protected loading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private modalEventsService: ModalEventsService,
    private modalService: ModalService,
    private trainingPlanService: TrainingPlanService,
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
    if (this.id) {
      this.fetchTrainingPlan(this.id);
    }

    this.subscription.add(
      this.modalEventsService.confirmClick$.subscribe(() => this.onSubmit())
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async fetchTrainingPlan(id: string) {
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, `training/edit/${id}`)
      );

      console.log(
        '🚀 ~ EditTrainingPlanComponent ~ fetchTrainingPlan ~ response:',
        response
      );

      this.loading = false;

      this.trainingForm.patchValue({
        title: response.trainingPlanEditView.title,
        trainingFrequency: response.trainingPlanEditView.trainingFrequency,
        trainingWeeks: response.trainingPlanEditView.trainingWeeks.length,
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

  async onSubmit() {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      try {
        const response: any = await firstValueFrom(
          this.httpClient.request<any>(
            HttpMethods.PATCH,
            `training/edit/${this.id}`,
            formData
          )
        );

        this.trainingPlanService.trainingPlanChanged();
        this.modalService.close();
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
