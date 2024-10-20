import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents an exercise within a workout routine.
 */
@Schema()
export class Exercise extends Document {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  exercise: string;

  @Prop({ required: true })
  sets: number;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: true })
  weight: string;

  @Prop({ required: true })
  targetRPE: string;

  @Prop({ required: true })
  actualRPE: string;

  @Prop()
  estMax?: number;

  @Prop()
  notes?: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
