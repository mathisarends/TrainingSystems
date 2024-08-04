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

import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

// Get all friends for a user
router.get('/', authService.authenticationMiddleware, asyncHandler(getAllFriends));

// Send a friend request
router.post('/request/:friendId', authService.authenticationMiddleware, asyncHandler(sendFriendRequest));

// Delete a friend
router.delete('/:friendId', authService.authenticationMiddleware, asyncHandler(deleteFriend));

// Accept a friend request
router.post('/accept/:friendId', authService.authenticationMiddleware, asyncHandler(acceptFriendRequest));

// Get all friend requests for a user
router.get('/requests', authService.authenticationMiddleware, asyncHandler(getAllFriendRequests));

// Get friend suggestions for a user
router.get('/suggestions', authService.authenticationMiddleware, asyncHandler(getFriendSuggestions));

export default router;
