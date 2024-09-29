import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/collections/user/user.js';
import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';
import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import {
  backExercises,
  benchExercises,
  bicepsExercises,
  chestExercises,
  deadliftExercises,
  legExercises,
  overheadpressExercises,
  placeHolderExercises,
  shoulderExercises,
  squatExercises,
  tricepExercises
} from '../ressources/exercises/exerciseCatalog.js';
import { encrypt } from '../utils/cryption.js';
import { NewUserParams } from './new-user-params.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function getUser(req: Request, res: Response): Promise<User> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }
  return user;
}

export function getUserGenericDAO(req: Request): MongoGenericDAO<User> {
  return req.app.locals.userDAO as MongoGenericDAO<User>;
}

export async function loginOAuth2User(userDAO: MongoGenericDAO<User>, token: string): Promise<User> {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error('Invalid Google token');
  }

  const { email, name } = payload;
  let user = await userDAO.findOne({ email: email });

  if (!user && name && email) {
    const userObj = await createNewUser({ username: name, email: email });

    user = await userDAO.create(userObj);
  }

  return user!;
}

export async function createNewUser(userDetails: NewUserParams): Promise<Omit<User, 'id' | 'createdAt'>> {
  const { username, email, password } = userDetails;

  const userObj: Omit<User, 'id' | 'createdAt'> = {
    username,
    email,
    trainingPlans: [],
    trainingSessions: [],
    trainingDayNotifications: [],
    gymtTicket: encrypt('noGymTicketAvailable'),
    isTrainingSummaryEmailEnabled: true,
    exercises: {
      [ExerciseCategoryType.PLACEHOLDER]: placeHolderExercises,
      [ExerciseCategoryType.SQUAT]: squatExercises,
      [ExerciseCategoryType.BENCH]: benchExercises,
      [ExerciseCategoryType.DEADLIFT]: deadliftExercises,
      [ExerciseCategoryType.OVERHEADPRESS]: overheadpressExercises,
      [ExerciseCategoryType.CHEST]: chestExercises,
      [ExerciseCategoryType.BACK]: backExercises,
      [ExerciseCategoryType.SHOULDER]: shoulderExercises,
      [ExerciseCategoryType.TRICEPS]: tricepExercises,
      [ExerciseCategoryType.BICEPS]: bicepsExercises,
      [ExerciseCategoryType.LEGS]: legExercises
    }
  };

  if (password) {
    userObj.password = await bcrypt.hash(password, 10);
  }

  return userObj;
}
