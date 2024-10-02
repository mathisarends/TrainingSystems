import { Request, Response } from 'express';
import { NotFoundError } from '../errors/notFoundError.js';
import { User } from '../models/collections/user/user.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao';

class UserManager {
  private userDAO!: MongoGenericDAO<User>;

  setUserGenericDAO(userDAO: MongoGenericDAO<User>) {
    this.userDAO = userDAO;
  }

  getUserGenericDAO(): MongoGenericDAO<User> {
    return this.userDAO;
  }

  async getUser(req: Request, res: Response): Promise<User> {
    const userClaimsSet = res.locals.user;

    const user = await this.userDAO.findOne({ id: userClaimsSet.id });

    if (!user) {
      throw new NotFoundError('Benutzer nicht gefunden');
    }

    return user;
  }
}

export default new UserManager();
