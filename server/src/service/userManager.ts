import { Response } from 'express';
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

  async getUser(res: Response): Promise<User> {
    const userClaimsSet = res.locals.user;

    const user = await this.userDAO.findOne({ id: userClaimsSet.id });

    if (!user) {
      throw new NotFoundError('Benutzer nicht gefunden');
    }

    return user;
  }

  async update(user: User): Promise<void> {
    await this.userDAO.update(user);
  }

  async deleteById(userId: string): Promise<void> {
    await this.userDAO.delete(userId);
  }
}

export default new UserManager();
