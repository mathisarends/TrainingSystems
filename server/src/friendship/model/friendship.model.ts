import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { InviteStatus } from './invite-status.enum';

@Schema({ timestamps: true })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  friendId: Types.ObjectId;

  @Prop({ type: String, enum: InviteStatus, default: InviteStatus.PENDING })
  inviteStatus: InviteStatus;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);
