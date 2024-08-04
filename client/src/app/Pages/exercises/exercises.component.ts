import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClientService } from '../../../service/http/http-client.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { HttpMethods } from '../../types/httpMethods';
import { UserExercise } from '../../../types/exercise/user-exercise';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SearchService } from '../../../service/util/search.service';
import { ModalService } from '../../../service/modal/modalService';
import { ToastService } from '../../components/toast/toast.service';
import { AuthService } from '../../auth-service.service';
import { BasicInfoComponent } from '../../basic-info/basic-info.component';

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
  categorizedExercises: { [category: string]: UserExercise[] } = {};
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

      this.exerciseCategories = response?.exerciseCategories;
      this.categorizedExercises = response?.categorizedExercises;
      this.maxFactors = response?.maxFactors;
      this.categoryPauseTimes = response?.categoryPauseTimes;
      this.defaultRepSchemeByCategory = response?.defaultRepSchemeByCategory;

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
    const confirmed = await this.modalService.open({
      component: BasicInfoComponent,
      title: 'Übungen zurücksetzen',
      buttonText: 'Zurücksetzen',
      componentData: {
        text: '  Bist du dir sicher, dass du die Übungen auf die Standarteinstellungen zurücksetzen willst? Die Änderungen können danach nicht weider rückgängig gemacht werden!',
      },
    });

    if (confirmed) {
      try {
        await firstValueFrom(
          this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset')
        );

        await this.loadExercises();
        this.toastService.show('Erfolg', 'Übungskatalog zurückgesetzt!');
      } catch (error) {
        console.error('Error resetting exercises:', error);
      }
    }
  }
}
