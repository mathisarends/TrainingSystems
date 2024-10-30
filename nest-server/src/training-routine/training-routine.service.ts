import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { TrainingRoutine } from './model/training-routine.model';
import { TrainingRoutineCardViewDto } from './model/training.-routine-card-view';

@Injectable()
export class TrainingRoutineService {
  constructor(
    @InjectModel(TrainingRoutine.name)
    private readonly trainingRoutineModel: Model<TrainingRoutine>,
    private readonly userService: UsersService,
  ) {}

  async geTrainingRoutineCardViews(userId: string) {
    const trainingRoutines = await this.getTrainingRoutinesForUser(userId);
    const userProfilePicture = (await this.userService.getUserById(userId))
      .profilePicture;

    const trainingSessionCardViewDto: TrainingRoutineCardViewDto[] =
      trainingRoutines.map((trainingSession) => {
        return {
          id: trainingSession.id,
          title: trainingSession.title,
          lastUpdated: trainingSession.lastUpdated,
          coverImageBase64: trainingSession.coverImageBase64 ?? '',
          userProfilePicture: userProfilePicture,
        };
      });

    return trainingSessionCardViewDto;
  }

  private async getTrainingRoutinesForUser(
    userId: string,
  ): Promise<TrainingRoutine[]> {
    return await this.trainingRoutineModel.find({ userId });
  }
}
