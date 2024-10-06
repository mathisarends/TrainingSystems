import { Response } from 'express';
import { NotFoundError } from '../errors/notFoundError.js';
import { User } from '../models/collections/user/user.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao';

class UserManager {
  private userDAO!: MongoGenericDAO<User>;

  setUserGenericDAO(userDAO: MongoGenericDAO<User>) {
    this.userDAO = userDAO;
  }

  async getUser(res: Response): Promise<User> {
    const userClaimsSet = res.locals.user;

    return this.getUserById(userClaimsSet.id);
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userDAO.findOne({ id: userId });

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
