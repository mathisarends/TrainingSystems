import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserExercise } from 'src/exercise/model/user-exercise.model';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  profilePicture: string;

  @Prop()
  password?: string;

  /**
   * A record of exercises categorized by exercise type.
   * Organizes the user's exercises by category.
   */
  @Prop({
    type: Map,
    of: [{ type: Object, required: true }],
    required: true,
    default: {},
  })
  exercises: Record<ExerciseCategoryType, UserExercise[]>;
}

export const UserSchema = SchemaFactory.createForClass(User);
