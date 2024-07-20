import { Entity } from "./entity.js";
import { InviteStatus } from "routes/inviteStatus.js";

export interface Friendship extends Entity {
  userId: string;
  friendId: string;
  inviteStatus: InviteStatus;
}
