import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingPlan, TrainingPlanSchema } from './model/training-plan.schema';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TrainingPlan.name, schema: TrainingPlanSchema },
    ]),
  ],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
