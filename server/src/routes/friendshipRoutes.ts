import express, { Request, Response } from 'express';
import { authService } from '../service/authService.js';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { User } from '../../../shared/models/user.js';
import { Friendship } from '../../../shared/models/friendShip.js';

import { InviteStatus } from './inviteStatus.js';

const router = express.Router();

// Get all friends for a user
router.get('/:userId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const friends = await friendshipDAO.findAll({ userId: user.id, inviteStatus: InviteStatus.ACCEPTED });
    res.status(200).json({ friends });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friends of user: ${err.message}` });
  }
});

// Send a friend request
router.post('/request/:userId/:friendId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const newFriendship = await friendshipDAO.create({
      userId: req.params.userId,
      friendId: req.params.friendId,
      inviteStatus: InviteStatus.PENDING
    });
    res.status(200).json({ message: 'Friend request sent', friendship: newFriendship });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while sending friend request: ${err.message}` });
  }
});

// Delete a friend
router.delete('/:userId/:friendId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'No user found with the given ID' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const friendship = await friendshipDAO.findOne({ userId: req.params.userId, friendId: req.params.friendId });

    if (!friendship) {
      return res.status(404).json({ error: 'No existing friendship relation found' });
    }

    await friendshipDAO.delete(friendship.id);
    res.status(200).json({ message: 'Friend deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `An error occurred while deleting the friend: ${err.message}` });
  }
});

// Accept a friend request
router.post('/accept/:userId/:friendId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const friendship = await friendshipDAO.findOne({ userId: req.params.friendId, friendId: req.params.userId });

    if (!friendship) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    friendship.inviteStatus = InviteStatus.ACCEPTED;
    await friendshipDAO.update(friendship);
    res.status(200).json({ message: 'Friend request accepted', friendship });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while accepting friend request: ${err.message}` });
  }
});

// Get all friend requests for a user
router.get('/requests/:userId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const requests = await friendshipDAO.findAll({ friendId: user.id, inviteStatus: InviteStatus.PENDING });
    res.status(200).json({ requests });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friend requests: ${err.message}` });
  }
});

// Get friend suggestions for a user
router.get('/suggestions/:userId', authService.authenticationMiddleware, async (req, res) => {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  try {
    const users = await userDAO.findAll({});
    const suggestions = users.filter(u => u.id !== user.id);
    res.status(200).json({ suggestions });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friend suggestions: ${err.message}` });
  }
});

// Helper method
async function getUserObj(req: Request, res: Response) {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  return user;
}

export default router;
