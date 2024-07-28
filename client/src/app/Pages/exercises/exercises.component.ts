import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClientService } from '../../../service/http/http-client.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpMethods } from '../../types/httpMethods';
import { Exercise } from '../../../../../shared/models/exercise/exercise';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchService } from '../../../service/util/search.service';
import { ModalService } from '../../../service/modal/modalService';
import { ExerciseService } from '../../../service/exercise/exercise.service';
import { ConfirmExerciseResetComponent } from '../confirm-exercise-reset/confirm-exercise-reset.component';
import { ToastService } from '../../components/toast/toast.service';
import { AuthService } from '../../auth-service.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [SpinnerComponent, CommonModule],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss'],
})
export class ExercisesComponent implements OnInit, OnDestroy {
  protected isLoading = true;
  exerciseCategories: string[] = [];
  categorizedExercises: { [category: string]: Exercise[] } = {};
  maxFactors: { [exercise: string]: number } = {};
  categoryPauseTimes: { [category: string]: number } = {};
  defaultRepSchemeByCategory: { [category: string]: any } = {};
  maxExercises = 8;

  filteredCategories: string[] = [];

  private searchSubscription!: Subscription;
  private preExerciseResetSubscription!: Subscription;
  private resetSuccessfulSubscription!: Subscription;
  changedData: { [key: string]: any } = {};

  constructor(
    private httpClient: HttpClientService,
    private toastService: ToastService,
    private searchService: SearchService,
    private modalService: ModalService,
    private exerciseService: ExerciseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const authenticated = this.authService.isLoggedIn();
    console.log(
      '🚀 ~ ExercisesComponent ~ ngOnInit ~ authenticated:',
      authenticated
    );

    this.loadExercises();

    // Subscribe to search input changes
    this.searchSubscription = this.searchService.searchText$.subscribe(
      (searchText) => {
        // Filter categories based on search text
      }
    );

    // Subscribe to preExerciseReset event
    this.preExerciseResetSubscription =
      this.exerciseService.preExerciseReset$.subscribe(() => {
        this.modalService.close();
        this.isLoading = true;
      });

    // Subscribe to resetSuccessful event
    this.resetSuccessfulSubscription =
      this.exerciseService.resetSuccessful$.subscribe(async () => {
        await this.loadExercises();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.preExerciseResetSubscription) {
      this.preExerciseResetSubscription.unsubscribe();
    }
    if (this.resetSuccessfulSubscription) {
      this.resetSuccessfulSubscription.unsubscribe();
    }
  }

  private async loadExercises(): Promise<void> {
    this.isLoading = true;
    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(HttpMethods.GET, 'exercise')
      );
      const exercisesData = response?.exercisesData;
      this.exerciseCategories = exercisesData?.exerciseCategories;
      this.categorizedExercises = exercisesData?.categorizedExercises;
      this.maxFactors = exercisesData?.maxFactors;
      this.categoryPauseTimes = exercisesData?.categoryPauseTimes;
      this.defaultRepSchemeByCategory =
        exercisesData?.defaultRepSchemeByCategory;

      // Initialize filteredCategories with all categories

      if (this.exerciseCategories) {
        this.filteredCategories = [...this.exerciseCategories];
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    console.log('🚀 ~ ExercisesComponent ~ changedData:', this.changedData);

    try {
      const response: any = await firstValueFrom(
        this.httpClient.request<any>(
          HttpMethods.PATCH,
          'exercise',
          this.changedData
        )
      );

      this.toastService.show(
        'Speichern erfolgreich',
        'Deine Änderungen wurden erfolgreich gespeichert'
      );

      console.log('response', response);
    } catch (error) {
      const httpError = error as HttpErrorResponse;
      console.error('Error updating user exercises:', error);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.changedData[target.name] = target.value;
  }

  async onReset(event: Event): Promise<void> {
    event.preventDefault();
    this.modalService.open({
      component: ConfirmExerciseResetComponent,
      title: 'Übungen zurücksetzen',
      buttonText: 'Zurücksetzen',
    });
  }
}
