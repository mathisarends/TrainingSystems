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
router.get('/', authService.authenticationMiddleware, getAllFriends);

// Send a friend request
router.post('/request/:friendId', authService.authenticationMiddleware, sendFriendRequest);

// Delete a friend
router.delete('/:friendId', authService.authenticationMiddleware, deleteFriend);

// Accept a friend request
router.post('/accept/:friendId', authService.authenticationMiddleware, acceptFriendRequest);

// Get all friend requests for a user
router.get('/requests', authService.authenticationMiddleware, getAllFriendRequests);

// Get friend suggestions for a user
router.get('/suggestions', authService.authenticationMiddleware, getFriendSuggestions);

export default router;
