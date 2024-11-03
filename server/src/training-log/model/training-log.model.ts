import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class TrainingLogNotification extends Document {
  /**
   * A reference to the user who owns this gym ticket.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const TrainingLogNotificationSchema = SchemaFactory.createForClass(
  TrainingLogNotification,
);
