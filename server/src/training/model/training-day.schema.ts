import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exercise, ExerciseSchema } from './exercise.schema';

@Schema()
export class TrainingDay extends Document {
  @Prop({ required: true })
  id: string;

  @Prop()
  durationInMinutes?: number;

  @Prop()
  startTime?: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  recording?: boolean;

  @Prop({ type: [ExerciseSchema], default: [] })
  exercises: Exercise[];
}

export const TrainingDaySchema = SchemaFactory.createForClass(TrainingDay);
