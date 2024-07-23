import { Request, Response } from 'express';
import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { User } from '../../../shared/models/user.js';
import { Friendship } from '../../../shared/models/friendShip.js';
import { InviteStatus } from '../routes/inviteStatus.js';

export async function getAllFriends(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    // Combine the results
    const allFriendships = await findAllFriendsForUser(friendshipDAO, user);

    // Extract unique friend IDs
    const friendIds = new Set(
      allFriendships.map(friendship => (friendship.userId === user.id ? friendship.friendId : friendship.userId))
    );

    // Fetch friend details
    const friends = await Promise.all(
      Array.from(friendIds).map(async id => {
        const friend = await userDAO.findOne({ id });
        return friend
          ? {
              id: friend.id,
              name: friend.username,
              email: friend.email,
              pictureUrl: friend.pictureUrl
            }
          : null;
      })
    );

    // Filter out null values
    const validFriends = friends.filter(friend => friend !== null);

    res.status(200).json({ friends: validFriends });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friends of user: ${err.message}` });
  }
}
export async function sendFriendRequest(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const newFriendship = await friendshipDAO.create({
      userId: user.id,
      friendId: req.params.friendId,
      inviteStatus: InviteStatus.PENDING
    });

    res.status(200).json({ message: 'Friend request sent', friendship: newFriendship });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while sending friend request: ${err.message}` });
  }
}

export async function deleteFriend(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'No user found with the given ID' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  console.log('userid', user.id);
  console.log('friendid', req.params.friendId);

  try {
    let friendship = await friendshipDAO.findOne({
      userId: user.id,
      friendId: req.params.friendId,
      inviteStatus: InviteStatus.ACCEPTED
    });

    if (!friendship) {
      friendship = await friendshipDAO.findOne({
        userId: req.params.friendId,
        friendId: user.id,
        inviteStatus: InviteStatus.ACCEPTED
      });
    }

    if (!friendship) {
      return res.status(404).json({ error: 'No existing friendship relation found' });
    }

    await friendshipDAO.delete(friendship.id);
    res.status(200).json({ message: 'Friend deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `An error occurred while deleting the friend: ${err.message}` });
  }
}

export async function acceptFriendRequest(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const friendship = await friendshipDAO.findOne({
      userId: req.params.friendId,
      friendId: user.id,
      inviteStatus: InviteStatus.PENDING
    });

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
}

export async function getAllFriendRequests(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    const requests = await friendshipDAO.findAll({ friendId: user.id, inviteStatus: InviteStatus.PENDING });

    const usersFromRequestsPromises = requests.map(async request => {
      const requestUser = await userDAO.findOne({ id: request.userId });
      if (requestUser) {
        return {
          id: requestUser.id,
          name: requestUser.username,
          email: requestUser.email,
          pictureUrl: requestUser.pictureUrl
        };
      }
    });

    const usersFromRequests = await Promise.all(usersFromRequestsPromises);

    res.status(200).json({ usersFromRequests });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friend requests: ${err.message}` });
  }
}

export async function getFriendSuggestions(req: Request, res: Response) {
  const user = await getUserObj(req, res);

  if (!user) {
    return res.status(404).json({ error: 'Found no user with the given id' });
  }

  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const friendshipDAO: MongoGenericDAO<Friendship> = req.app.locals.friendshipDAO;

  try {
    // Get all users
    const users = await userDAO.findAll({});

    const friendships = await friendshipDAO.findAll({
      userId: user.id
    });
    console.log('🚀 ~ getFriendSuggestions ~ friendships:', friendships);
    const friendIds = friendships.map(f => f.friendId);

    const suggestions = users
      .filter((u: User) => u.id !== user.id && !friendIds.includes(u.id))
      .map(u => ({
        id: u.id,
        name: u.username,
        email: u.email,
        pictureUrl: u.pictureUrl
      }));

    res.status(200).json({ suggestions });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Error while getting friend suggestions: ${err.message}` });
  }
}

async function getUserObj(req: Request, res: Response) {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  return user;
}

// beidseitige Freundschaften finden
async function findAllFriendsForUser(friendshipDAO: MongoGenericDAO<Friendship>, user: User) {
  const requestedFriendships = await friendshipDAO.findAll({
    userId: user.id,
    inviteStatus: InviteStatus.ACCEPTED
  });

  // Find friendships where the user is the accepter
  const acceptedFriendships = await friendshipDAO.findAll({
    friendId: user.id,
    inviteStatus: InviteStatus.ACCEPTED
  });

  // Combine the results
  return [...requestedFriendships, ...acceptedFriendships];
}
