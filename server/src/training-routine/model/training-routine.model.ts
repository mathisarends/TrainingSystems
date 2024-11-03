import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  TrainingDay,
  TrainingDaySchema,
} from 'src/training/model/training-day.schema';
import { WeightRecommendation } from 'src/training/model/weight-recommandation.enum';

@Schema()
export class TrainingRoutine extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  lastUpdated: Date;

  @Prop({ enum: WeightRecommendation, required: true })
  weightRecommandationBase: WeightRecommendation;

  @Prop()
  coverImageBase64?: string;

  @Prop({ type: [TrainingDaySchema], default: [] })
  versions: TrainingDay[];
}

export const TrainingRoutineSchema =
  SchemaFactory.createForClass(TrainingRoutine);
