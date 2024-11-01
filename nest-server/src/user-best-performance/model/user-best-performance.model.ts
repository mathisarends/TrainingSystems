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

  // Array to store up to two previous records
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

export const UserExerciseRecordSchema =
  SchemaFactory.createForClass(UserExerciseRecord);

/**
 * Middleware to manage the `previousRecords` history.
 *
 * This pre-save hook ensures only the last two performance records are kept.
 * If there are already two records, the oldest one is removed before adding
 * the current performance details. This keeps the history concise and always
 * up to date, allowing for easy restoration of previous states.
 */
UserExerciseRecordSchema.pre('save', function (next) {
  const record = this as UserExerciseRecord;

  if (record.previousRecords.length >= 2) {
    record.previousRecords.shift();
  }

  record.previousRecords.push({
    sets: record.sets,
    reps: record.reps,
    weight: record.weight,
    actualRPE: record.actualRPE,
    estMax: record.estMax,
    achievedAt: record.achievedAt,
  });

  next();
});

UserExerciseRecordSchema.index(
  { userId: 1, exerciseName: 1 },
  { unique: true },
);
