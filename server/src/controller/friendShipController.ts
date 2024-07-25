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
    const allFriendships = await friendshipDAO.findByCondition({
      $or: [{ userId: user.id }, { friendId: user.id }],
      inviteStatus: InviteStatus.ACCEPTED
    });

    const friendIds = new Set(
      allFriendships.map((friendship: Friendship) =>
        friendship.userId === user.id ? friendship.friendId : friendship.userId
      )
    );

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

  // hier noch prüfen ob es schon eine pending friendsip oder sogar eine bestehende zwischen den beiden nutzern gibt und dann einen entsprehcendne fehler werdfen

  const existingFriendship = await friendshipDAO.findOneWithCondition({
    $or: [
      { userId: user.id, friendId: req.params.friendId },
      { userId: req.params.friendId, friendId: user.id }
    ],
    inviteStatus: { $in: [InviteStatus.PENDING, InviteStatus.ACCEPTED] }
  });

  if (existingFriendship) {
    return res.status(400).json({ error: 'A pending or accepted friendship already exists between these users' });
  }

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

  try {
    const friendship = await friendshipDAO.findByCondition({
      $or: [
        { userId: user.id, friendId: req.params.friendId },
        { userId: req.params.friendId, friendId: user.id }
      ],
      inviteStatus: InviteStatus.ACCEPTED
    });

    if (!friendship.length) {
      return res.status(404).json({ error: 'No existing friendship relation found' });
    }

    await friendshipDAO.delete(friendship[0].id);
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
    const users = await userDAO.findAll({});

    const friendships = await friendshipDAO.findAll({
      userId: user.id
    });

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
