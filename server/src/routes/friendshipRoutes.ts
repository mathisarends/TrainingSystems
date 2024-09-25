import express from 'express';
import {
  acceptFriendRequest,
  deleteFriend,
  getAllFriendRequests,
  getAllFriends,
  getFriendSuggestions,
  sendFriendRequest
} from '../controller/friendShipController.js';
import { authService } from '../service/authService.js';

import { asyncHandler } from '../middleware/error-handler.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, asyncHandler(getAllFriends));

router.post('/request/:friendId', authService.authenticationMiddleware, asyncHandler(sendFriendRequest));

router.delete('/:friendId', authService.authenticationMiddleware, asyncHandler(deleteFriend));

router.post('/accept/:friendId', authService.authenticationMiddleware, asyncHandler(acceptFriendRequest));

router.get('/requests', authService.authenticationMiddleware, asyncHandler(getAllFriendRequests));

router.get('/suggestions', authService.authenticationMiddleware, asyncHandler(getFriendSuggestions));

export default router;
