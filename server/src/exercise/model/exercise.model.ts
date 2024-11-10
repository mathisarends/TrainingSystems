import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';
import { UserExercise } from './user-exercise.model';

@Schema()
export class Exercise extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  /**
   * A record of exercises categorized by exercise type.
   * Organizes the user's exercises by category.
   */
  @Prop({
    type: Object,
    default: {},
  })
  exercises: Record<ExerciseCategoryType, UserExercise[]>;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);
