import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateTrainingPlanService } from './create-training-plan.service';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { MostRecentTrainingPlanService } from './most-recent-training-plan.service';
import { TrainingController } from './training.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
  ],
  controllers: [TrainingController],
  providers: [MostRecentTrainingPlanService, CreateTrainingPlanService],
})
export class TrainingModule {}
