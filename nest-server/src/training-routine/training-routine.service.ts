import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { CreateTrainingRoutineDto } from './dto/create-training-routine.dto';
import { TrainingRoutine } from './model/training-routine.model';
import { TrainingRoutineCardViewDto } from './model/training.-routine-card-view';

@Injectable()
export class TrainingRoutineService {
  constructor(
    @InjectModel(TrainingRoutine.name)
    private readonly trainingRoutineModel: Model<TrainingRoutine>,
    private readonly userService: UsersService,
  ) {}

  async geTrainingRoutineCardViews(
    userId: string,
  ): Promise<TrainingRoutineCardViewDto[]> {
    const trainingRoutines = await this.trainingRoutineModel.find({ userId });
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

  async getTrainingRoutineByUserAndRoutineId(
    userId: string,
    trainingRoutineId: string,
  ) {
    return await this.trainingRoutineModel.findOne({
      userId: userId,
      _id: trainingRoutineId,
    });
  }

  async createTrainingRoutine(
    userId: string,
    createTrainingRoutineDto: CreateTrainingRoutineDto,
  ) {
    const newTrainingRoutine = new this.trainingRoutineModel({
      userId: userId,
      title: createTrainingRoutineDto.title,
      lastUpdated: new Date(),
      weightRecommandationBase:
        createTrainingRoutineDto.weightRecommandationBase,
      coverImageBase64: createTrainingRoutineDto.coverImageBase64 ?? '',
      versions: [
        {
          exercises: [],
        },
      ],
    });

    return await newTrainingRoutine.save();
  }
}
