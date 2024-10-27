import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';

@Schema()
export class UserExerciseRecord extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ExerciseCategoryType, required: true })
  category: ExerciseCategoryType;

  @Prop({ required: true })
  exerciseName: string;

  @Prop({ required: true })
  sets: number;

  @Prop({ required: true })
  reps: number;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  actualRPE: number;

  @Prop({ required: true })
  estMax: number;

  @Prop({ default: Date.now })
  achievedAt: Date;
}

// Erstellen des Schemas und Hinzufügen des eindeutigen Indexes
export const UserExerciseRecordSchema =
  SchemaFactory.createForClass(UserExerciseRecord);
UserExerciseRecordSchema.index(
  { userId: 1, exerciseName: 1 },
  { unique: true },
);
