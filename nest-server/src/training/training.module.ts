import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreateTrainingPlanService } from './create-training-plan.service';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { TrainingPlanCardViewService } from './training-plan-card-view.service';
import { TrainingPlanUtilsService } from './training-plan-utils.service';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
  ],
  controllers: [TrainingController],
  providers: [
    TrainingPlanUtilsService,
    CreateTrainingPlanService,
    TrainingPlanCardViewService,
    TrainingService,
  ],
})
export class TrainingModule {}
