import { Entity } from "./entity.js";

export interface Friendship extends Entity {
  userId: string;
  friendId: string;
  createdAt: number;
}
