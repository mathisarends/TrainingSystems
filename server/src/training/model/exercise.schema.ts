import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents an exercise within a workout routine.
 */
@Schema()
export class Exercise extends Document {
  @Prop()
  id: string;

  @Prop()
  category: string;

  @Prop()
  exercise: string;

  @Prop()
  sets: number;

  @Prop()
  reps: number;

  @Prop()
  weight: string;

  @Prop()
  targetRPE: number;

  @Prop()
  actualRPE: string;

  @Prop()
  estMax?: number;

  @Prop()
  notes?: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

export class ExerciseDto {
  category: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: string;
  targetRPE: number;
  actualRPE: string;
  estMax?: number;
  notes?: string;
}
