import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../service/modal/modalService';
import { ToastService } from '../../components/toast/toast.service';
import { BasicInfoComponent } from '../../basic-info/basic-info.component';
import { ExerciseTableSkeletonComponent } from '../../exercise-table-skeleton/exercise-table-skeleton.component';
import { ExerciseDataDTO } from '../training-view/exerciseDataDto';
import { ExerciseService } from '../training-view/exerciese,service';
import { FormService } from '../../../service/form/form.service';

@Component({
  selector: 'app-exercises',
  standalone: true,
  imports: [SpinnerComponent, CommonModule, ExerciseTableSkeletonComponent],
  providers: [ExerciseService],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.scss', '../../../css/tables.scss'],
})
export class ExercisesComponent implements OnInit {
  protected isLoading = true;

  maxExercises = 8;
  exerciseData: ExerciseDataDTO = new ExerciseDataDTO();

  momentaryInput!: string;

  constructor(
    private toastService: ToastService,
    private modalService: ModalService,
    private exerciseService: ExerciseService,
    private formService: FormService,
  ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  private async loadExercises(): Promise<void> {
    this.isLoading = true;
    try {
      const exerciseData = await firstValueFrom(this.exerciseService.loadExerciseData());

      if (exerciseData) {
        this.exerciseData = exerciseData;
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    try {
      await firstValueFrom(this.exerciseService.updateExercises(this.formService.getChanges()));
    } catch (error) {
      this.toastService.show('Fehler', 'Soeichern war nicht erfolgreich');
      console.error('Error updating user exercises:', error);
    }
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    this.formService.addChange(target.name, target.value);
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
        await firstValueFrom(this.exerciseService.resetExercises());

        await this.loadExercises();
        this.toastService.show('Erfolg', 'Übungskatalog zurückgesetzt!');
      } catch (error) {
        console.error('Error resetting exercises:', error);
      }
    }
  }
}
