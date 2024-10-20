import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TrainingDay, TrainingDaySchema } from './training-day.schema'; // Import the TrainingDay schema

@Schema()
export class TrainingWeek extends Document {
  @Prop({ type: [TrainingDaySchema], default: [] })
  trainingDays: TrainingDay[];
}

export const TrainingWeekSchema = SchemaFactory.createForClass(TrainingWeek);
