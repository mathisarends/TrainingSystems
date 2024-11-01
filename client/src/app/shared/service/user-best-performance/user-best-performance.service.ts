import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';
import { HttpService } from '../../../core/services/http-client.service';
import { TrainingPlanDataService } from '../../../features/training-plans/training-view/services/training-plan-data.service';
import { Exercise } from '../../../features/training-plans/training-view/training-exercise';
import { ToastService } from '../../components/toast/toast.service';
import { ExerciseName } from './exercise-name.type';
import { UserBestPerformanceDto } from './user-best-performance.dto';

@Injectable()
export class UserBestPerformanceService {
  userBestPerformanceMap: Map<ExerciseName, UserBestPerformanceDto> = new Map();

  constructor(private httpService: HttpService,  private trainingPlanDataService: TrainingPlanDataService, private toastService: ToastService) {
    this.fetchAndSetUserBestPerformanceMap();
  }

  determineExerciseBasedOnFieldName(fieldName: string): Exercise | undefined {
    const exerciseNumber = Number(fieldName.charAt(13));
  
    if (
      !this.trainingPlanDataService.trainingDay()
    ) {
      return undefined;
    }
  
    return this.trainingPlanDataService.trainingDay()!.exercises[exerciseNumber - 1];
  }

  isNewBestPerformance(exercise: Exercise): boolean {
    const existingEntry = this.userBestPerformanceMap.get(exercise.category);
    console.log("🚀 ~ UserBestPerformanceService ~ isNewBestPerformance ~ existingEntry:", existingEntry)

    if (!existingEntry) {
      return true;
    }

    console.log("🚀 ~ UserBestPerformanceService ~ isNewBestPerformance ~ exercise:", exercise)

    if (exercise.estMax > existingEntry.estMax) {
      console.log("aber shcon hier?")
      return true;
    }

    return false;
  }

  makeNewBestPerformanceEntry(exercise: Exercise) {
    this.httpService.put<UserBestPerformanceDto>("/user-best-performance", {exercise}).subscribe(userBestPerformanceDto => {
      this.userBestPerformanceMap.set(userBestPerformanceDto.exerciseName, userBestPerformanceDto);
  
      this.startConfetti();
    });
  }

  private fetchAndSetUserBestPerformanceMap() {
    this.httpService.get<{ [key: string]: UserBestPerformanceDto }>("/user-best-performance")
      .subscribe((response) => {
        this.userBestPerformanceMap = new Map<ExerciseName, UserBestPerformanceDto>(
          Object.entries(response) as [ExerciseName, UserBestPerformanceDto][]
        );
  
      });
  }

  private startConfetti() {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.9 },
      });
    }, 125);

    this.toastService.success('New PR');

    new Audio('./audio/new_pr.mp3').play();
  }
}
