import express from 'express';
import { authService } from '../service/authService.js';
import {
  getAllFriends,
  sendFriendRequest,
  deleteFriend,
  acceptFriendRequest,
  getAllFriendRequests,
  getFriendSuggestions
} from '../controller/friendShipController.js';

const router = express.Router();

// Get all friends for a user
router.get('/:userId', authService.authenticationMiddleware, getAllFriends);

// Send a friend request
router.post('/request/:userId/:friendId', authService.authenticationMiddleware, sendFriendRequest);

// Delete a friend
router.delete('/:userId/:friendId', authService.authenticationMiddleware, deleteFriend);

// Accept a friend request
router.post('/accept/:userId/:friendId', authService.authenticationMiddleware, acceptFriendRequest);

// Get all friend requests for a user
router.get('/requests/:userId', authService.authenticationMiddleware, getAllFriendRequests);

// Get friend suggestions for a user
router.get('/suggestions/:userId', authService.authenticationMiddleware, getFriendSuggestions);

export default router;
