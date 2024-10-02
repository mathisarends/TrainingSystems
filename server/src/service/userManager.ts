import { Request, Response } from 'express';
import { User } from '../models/collections/user/user.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao';

class UserManager {
  private userDAO!: MongoGenericDAO<User>;

  setUserGenericDAO(userDAO: MongoGenericDAO<User>) {
    this.userDAO = userDAO;
  }

  async getUser(req: Request, res: Response): Promise<User | null> {
    const userClaimsSet = res.locals.user;

    const user = await this.userDAO.findOne({ id: userClaimsSet.id });

    if (!user) {
      res.status(404).json({ message: 'Benutzer nicht gefunden' });
      return null;
    }

    return user;
  }
}

export default new UserManager();
