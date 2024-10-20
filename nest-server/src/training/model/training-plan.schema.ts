import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TrainingWeek, TrainingWeekSchema } from './training-week.schema';
import { WeightRecommendation } from './weight-recommandation.enum';

@Schema()
export class TrainingPlan extends Document {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  trainingFrequency: number;

  @Prop()
  lastUpdated: Date;

  @Prop({ enum: WeightRecommendation, required: true })
  weightRecommandationBase: WeightRecommendation;

  @Prop({ type: [TrainingWeekSchema], default: [] })
  trainingWeeks: TrainingWeek[];

  @Prop()
  coverImageBase64?: string;

  @Prop({ type: [String], default: [] })
  recentlyViewedCategoriesInStatisticSection?: string[];
}

export const TrainingPlanSchema = SchemaFactory.createForClass(TrainingPlan);
