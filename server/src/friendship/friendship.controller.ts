import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { FriendshipService } from './friendship.service';
import { InviteStatus } from './model/invite-status.enum';

@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request/:friendId')
  async sendFriendRequest(@GetUser() userId: string, @Param('friendId') friendId: string) {
    return this.friendshipService.createFriendRequest(userId, friendId);
  }

  @Patch('accept/:friendId')
  async acceptFriendRequest(@GetUser() userId: string, @Param('friendId') friendId: string) {
    return this.friendshipService.acceptFriendRequest(userId, friendId);
  }

  @Delete(':friendId')
  async deleteFriend(@GetUser() userId: string, @Param('friendId') friendId: string) {
    return this.friendshipService.deleteFriend(userId, friendId);
  }

  @Get('requests')
  async getAllFriendRequests(@GetUser() userId: string) {
    return this.friendshipService.getFriendRequests(userId, InviteStatus.PENDING);
  }

  @Get('status/:status')
  async getFriendRequestsByStatus(@GetUser() userId: string, @Param('status') status: InviteStatus) {
    return this.friendshipService.getFriendshipsByStatus(userId, status);
  }

  @Get('suggestions')
  async getFriendSuggestions(@GetUser() userId: string) {
    return this.friendshipService.getFriendSuggestions(userId);
  }

  @Get()
  async getAllFriends(@GetUser() userId: string) {
    return this.friendshipService.getAllFriends(userId);
  }
}
