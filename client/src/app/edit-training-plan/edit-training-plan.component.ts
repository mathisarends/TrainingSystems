import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
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
import { ImageUploadService } from '../image-upload.service';

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

  @ViewChild('coverImage') coverImageElement!: ElementRef<HTMLImageElement>;

  constructor(
    private fb: FormBuilder,
    private modalEventsService: ModalEventsService,
    private modalService: ModalService,
    private trainingPlanService: TrainingPlanService,
    private httpClient: HttpClientService,
    private renderer: Renderer2,
    private el: ElementRef,
    private imageUploadService: ImageUploadService
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

  ngAfterViewChecked() {
    console.log(
      '🚀 ~ EditTrainingPlanComponent ~ ngAfterViewChecked ~ this.coverImageElement:',
      this.coverImageElement
    );
    if (this.coverImageElement) {
      this.setCoverImage(this.trainingForm.get('coverImage')?.value || '');
    }
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
        coverImage: response.trainingPlanEditView.coverImageBase64 || '',
      });
      console.log(
        '🚀 ~ EditTrainingPlanComponent ~ fetchTrainingPlan ~  response.trainingPlanEditView.coverImageBase64:',
        response.trainingPlanEditView.coverImageBase64
      );

      this.setCoverImage(response.trainingPlanEditView.coverImageBase64 || '');
    } catch (error) {
      console.error('Error fetching training plan:', error);
      if (error instanceof HttpErrorResponse && error.status === 404) {
        console.log('Training plan not found');
      }
    }
  }

  setCoverImage(imageUrl: string) {
    const coverImageElement =
      this.el.nativeElement.querySelector('#cover-image');
    console.log(
      '🚀 ~ EditTrainingPlanComponent ~ setCoverImage ~ coverImageElement:',
      coverImageElement
    );
    if (coverImageElement) {
      this.renderer.setAttribute(
        coverImageElement,
        'src',
        imageUrl || 'https://via.placeholder.com/150'
      );
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
    this.imageUploadService.handleImageUpload(event, (result: string) => {
      const coverImage = document.getElementById(
        'cover-image'
      ) as HTMLImageElement;
      coverImage.src = result;
      this.trainingForm.patchValue({ coverImage: result });
    });
  }
}
