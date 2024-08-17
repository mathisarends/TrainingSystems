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
import { BasicInfoComponent } from '../../basic-info/basic-info.component';
import { ExerciseTableSkeletonComponent } from '../../exercise-table-skeleton/exercise-table-skeleton.component';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [SpinnerComponent, CommonModule, ExerciseTableSkeletonComponent],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss', '../../../css/tables.scss'],
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

  momentaryInput!: string;

  constructor(
    private httpClient: HttpClientService,
    private toastService: ToastService,
    private searchService: SearchService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.loadExercises();

    // Subscribe to search input changes
    this.searchSubscription = this.searchService.searchText$.subscribe((searchText) => {
      // Filter categories based on search text
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
      const response: any = await firstValueFrom(this.httpClient.request<any>(HttpMethods.GET, 'exercise'));

      this.exerciseCategories = response?.exerciseCategories;
      this.categorizedExercises = response?.categorizedExercises;
      this.maxFactors = response?.maxFactors;
      this.categoryPauseTimes = response?.categoryPauseTimes;
      this.defaultRepSchemeByCategory = response?.defaultRepSchemeByCategory;

      // Initialize filteredCategories with all categories

      if (this.exerciseCategories) {
        this.filteredCategories = [...this.exerciseCategories];

        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    try {
      await firstValueFrom(this.httpClient.request<any>(HttpMethods.PATCH, 'exercise', this.changedData));
    } catch (error) {
      this.toastService.show('Fehler', 'Soeichern war nicht erfolgreich');
      const httpError = error as HttpErrorResponse;
      console.error('Error updating user exercises:', error);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.changedData[target.name] = target.value;
  }

  onInteractiveElementFocus(event: Event) {
    const interactiveElement = event.target as HTMLInputElement | HTMLSelectElement;

    this.momentaryInput = interactiveElement.value;
  }

  onInteractiveElementBlur(event: Event) {
    const interactiveElement = event.target as HTMLInputElement | HTMLSelectElement;

    if (interactiveElement.value !== this.momentaryInput) {
      this.onSubmit(new Event('submit'));
    }
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
        await firstValueFrom(this.httpClient.request<any>(HttpMethods.POST, 'exercise/reset'));

        await this.loadExercises();
        this.toastService.show('Erfolg', 'Übungskatalog zurückgesetzt!');
      } catch (error) {
        console.error('Error resetting exercises:', error);
      }
    }
  }
}
