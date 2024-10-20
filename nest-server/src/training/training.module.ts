import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingPlanEditController } from './controller/training-plan-edit.controller';
import { TrainingPlanViewController } from './controller/training-plan-view.controller';
import { TrainingController } from './controller/training.controller';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { CreateTrainingPlanService } from './service/create-training-plan.service';
import { EditTrainingPlanService } from './service/edit-training-plan.service';
import { TrainingPlanCardViewService } from './service/training-plan-card-view.service';
import { TrainingPlanUtilsService } from './service/training-plan-utils.service';
import { TrainingService } from './training.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
  ],
  controllers: [
    TrainingController,
    TrainingPlanEditController,
    TrainingPlanViewController,
  ],
  providers: [
    TrainingPlanUtilsService,
    CreateTrainingPlanService,
    TrainingPlanCardViewService,
    EditTrainingPlanService,
    TrainingService,
  ],
})
export class TrainingModule {}
