import bcrypt from 'bcryptjs';
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
    amountOfTrainingDayNotifications: 0,
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
    },
    pictureUrl: setDefaultProfilePictureBasedOnFirstCharacter(username)
  };

  if (password) {
    userObj.password = await bcrypt.hash(password, 10);
  }

  return userObj;
}

function setDefaultProfilePictureBasedOnFirstCharacter(username: string) {
  const firstLetter = username[0].toUpperCase();

  return `/images/profile/${firstLetter}.webp`;
}
