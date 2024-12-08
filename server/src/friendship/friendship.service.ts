// friendship.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/user.model';
import { UsersService } from 'src/users/users.service';
import { Friendship } from './model/friendship.model';
import { InviteStatus } from './model/invite-status.enum';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectModel(Friendship.name) private friendshipModel: Model<Friendship>,
    private readonly userService: UsersService,
  ) {}
  // Erstellen einer Freundschaftsanfrage
  async createFriendRequest(userId: string, friendId: string) {
    const newFriendRequest = new this.friendshipModel({
      userId,
      friendId,
      inviteStatus: InviteStatus.PENDING,
    });
    return newFriendRequest.save();
  }

  async acceptFriendRequest(userId: string, friendId: string) {
    return this.friendshipModel.findOneAndUpdate(
      { userId, friendId, inviteStatus: InviteStatus.PENDING },
      { inviteStatus: InviteStatus.ACCEPTED },
      { new: true },
    );
  }

  async deleteFriend(userId: string, friendId: string) {
    const result = await this.friendshipModel.findOneAndDelete({
      userId,
      friendId,
    });
    if (!result) {
      throw new NotFoundException('Friendship not found');
    }
    return result;
  }

  async getAllFriends(userId: string) {
    return this.friendshipModel.find({ userId, inviteStatus: InviteStatus.ACCEPTED }).exec();
  }

  async getFriendRequests(userId: string, status: InviteStatus) {
    return this.friendshipModel.find({ userId, inviteStatus: status }).exec();
  }

  async getFriendshipsByStatus(userId: string, status: InviteStatus): Promise<Friendship[]> {
    return this.friendshipModel
      .find({
        userId,
        inviteStatus: status,
      })
      .exec();
  }

  async getFriendSuggestions(userId: string): Promise<User[]> {
    const allUsers = await this.userService.getUsers();
    const usersFriends = await this.getFriendshipsByStatus(userId, InviteStatus.ACCEPTED);
    const usersFriendsIds = usersFriends.map((friend) => friend.friendId);

    const friendSuggestions = allUsers.filter((user) => !usersFriendsIds.includes(user.id) && user.id !== userId);

    return friendSuggestions;
  }
}
