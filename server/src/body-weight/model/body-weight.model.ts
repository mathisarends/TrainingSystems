import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BodyWeightEntry } from './body-weight-entry.model';

@Schema()
export class BodyWeight extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ default: [] })
  weightEntries: BodyWeightEntry[];

  @Prop({
    required: true,
    enum: ['GAIN', 'LOSE', 'MAINTAIN'],
    default: 'MAINTAIN',
  })
  weightGoal: string;

  @Prop({
    required: true,
    type: Number,
  })
  weightGoalRate: number;
}

export const BodyWeightSchema = SchemaFactory.createForClass(BodyWeight);
