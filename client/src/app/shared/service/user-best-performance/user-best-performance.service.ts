import { Injectable } from '@angular/core';
// @ts-ignore
import confetti from 'canvas-confetti';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/services/http-client.service';
import { TrainingPlanDataService } from '../../../features/training-plans/training-view/services/training-plan-data.service';
import { Exercise } from '../../../features/training-plans/training-view/training-exercise';
import { ToastService } from '../../components/toast/toast.service';
import { ExerciseName } from './exercise-name.type';
import { UserBestPerformanceDto } from './user-best-performance.dto';

@Injectable({
  providedIn: 'root',
})
export class UserBestPerformanceService {
  userBestPerformanceMap: Map<ExerciseName, UserBestPerformanceDto> = new Map();

  constructor(
    private httpService: HttpService,
    private trainingPlanDataService: TrainingPlanDataService,
    private toastService: ToastService,
  ) {
    this.fetchUserBestPerformanceData().subscribe((response) => {
      this.userBestPerformanceMap = new Map<ExerciseName, UserBestPerformanceDto>(
        Object.entries(response) as [ExerciseName, UserBestPerformanceDto][],
      );
    });
  }

  determineExerciseBasedOnFieldName(fieldName: string): Exercise | undefined {
    const exerciseNumber = Number(fieldName.charAt(13));

    if (!this.trainingPlanDataService.exercises()) {
      return undefined;
    }

    return this.trainingPlanDataService.exercises()[exerciseNumber - 1];
  }

  isNewBestPerformance(exerciseCategory: string, newEstMax: number): boolean {
    const existingEntry = this.userBestPerformanceMap.get(exerciseCategory);

    if (!existingEntry) {
      return true;
    }

    return newEstMax > existingEntry.estMax;
  }

  makeNewBestPerformanceEntry(exercise: Exercise) {
    this.httpService
      .put<UserBestPerformanceDto>('/user-best-performance', exercise)
      .subscribe((userBestPerformanceDto) => {
        this.userBestPerformanceMap.set(userBestPerformanceDto.exerciseName, userBestPerformanceDto);

        this.startConfetti();
      });
  }

  fetchUserBestPerformanceData(): Observable<{ [key: string]: UserBestPerformanceDto }> {
    return this.httpService.get<{ [key: string]: UserBestPerformanceDto }>('/user-best-performance');
  }

  private async startConfetti() {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.9 },
      });
    }, 300);

    this.toastService.achievement('New PR');

    const prAudio = new Audio('./audio/new_pr.mp3');
    await prAudio.play();
  }
}
