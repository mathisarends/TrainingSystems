import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ExerciseCategoryType } from 'src/exercise/types/exercise-category-type.enum';

@Schema()
export class UserBestPerformance extends Document {
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

  @Prop({
    type: [
      {
        sets: { type: Number, required: true },
        reps: { type: Number, required: true },
        weight: { type: Number, required: true },
        actualRPE: { type: Number, required: true },
        estMax: { type: Number, required: true },
        achievedAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  previousRecords: {
    sets: number;
    reps: number;
    weight: number;
    actualRPE: number;
    estMax: number;
    achievedAt: Date;
  }[];
}

export const UserBestPerformanceSchema = SchemaFactory.createForClass(UserBestPerformance);
UserBestPerformanceSchema.index({ userId: 1, exerciseName: 1 }, { unique: true });
