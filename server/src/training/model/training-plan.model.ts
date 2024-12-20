import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { MostRecentTrainingDayLocator } from './most-recent-training-day-locator';
import { TrainingWeek, TrainingWeekSchema } from './training-week.schema';

@Schema()
export class TrainingPlan extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  trainingDays: string[];

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  lastUpdated: Date;

  @Prop({ type: [TrainingWeekSchema], default: [] })
  trainingWeeks: TrainingWeek[];

  @Prop()
  coverImageBase64?: string;

  @Prop({
    type: { weekIndex: Number, dayIndex: Number },
    default: { weekIndex: 0, dayIndex: 0 },
  })
  mostRecentTrainingDayLocator: MostRecentTrainingDayLocator;

  @Prop({
    type: [String],
    enum: Object.values(ExerciseCategoryType),
    default: [
      ExerciseCategoryType.SQUAT,
      ExerciseCategoryType.BENCH,
      ExerciseCategoryType.DEADLIFT,
    ],
  })
  recentlyViewedCategoriesInStatisticSection?: ExerciseCategoryType[];
}

export const TrainingPlanSchema = SchemaFactory.createForClass(TrainingPlan);
