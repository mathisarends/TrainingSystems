import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class GymTicket extends Document {
  /**
   * The gym ticket information as a base64-encoded string.
   */
  @Prop({ required: true })
  gymTicket: string;

  /**
   * A reference to the user who owns this gym ticket.
   */
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const GymTicketSchema = SchemaFactory.createForClass(GymTicket);
