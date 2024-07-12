import { MongoGenericDAO } from 'models/mongo-generic.dao.js';
import { User } from '@shared/models/user.js';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {
  placeHolderExercises,
  squatExercises,
  benchExercises,
  deadliftExercises,
  overheadpressExercises,
  chestExercises,
  backExercises,
  shoulderExercises,
  tricepExercises,
  bicepsExercises,
  legExercises
} from '../ressources/exerciseCatalog.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface UserClaimsSet {
  id: string;
}

export async function registerUser(userDAO: MongoGenericDAO<User>, userDetails: Record<string, string>): Promise<User> {
  const { username, email, password, confirmPassword } = userDetails;

  if (password !== confirmPassword) {
    throw new Error('Die angegebenen Passwörter stimmen nicht überein');
  }

  const existingUser = await userDAO.findOne({ email });
  if (existingUser) {
    throw new Error('Es existiert bereits ein Benutzer mit diesem Namen');
  }

  if (!validateUsername(username)) {
    throw new Error('Der Nutzername muss mindestens 3 Zeichen lang sein');
  }

  const userObj: Omit<User, 'id' | 'createdAt'> = {
    username,
    email,
    password: await bcrypt.hash(password, 10),
    trainingPlans: [],
    placeholderExercises: placeHolderExercises,
    squatExercises: squatExercises,
    benchExercises: benchExercises,
    deadliftExercises: deadliftExercises,
    overheadpressExercises: overheadpressExercises,
    chestExercises: chestExercises,
    backExercises: backExercises,
    shoulderExercises: shoulderExercises,
    tricepsExercises: tricepExercises,
    bicepsExercises: bicepsExercises,
    legExercises: legExercises
  };

  return userDAO.create(userObj);
}

export async function loginUser(userDAO: MongoGenericDAO<User>, email: string, password: string): Promise<User | null> {
  const user = await userDAO.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password!))) {
    return user;
  }
  return null;
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

  const { email, name, picture } = payload;
  let user = await userDAO.findOne({ email });

  if (!user && name && email) {
    const userObj: Omit<User, 'id' | 'createdAt'> = {
      username: name,
      email: email,
      pictureUrl: picture,
      trainingPlans: [],
      placeholderExercises: placeHolderExercises,
      squatExercises: squatExercises,
      benchExercises: benchExercises,
      deadliftExercises: deadliftExercises,
      overheadpressExercises: overheadpressExercises,
      chestExercises: chestExercises,
      backExercises: backExercises,
      shoulderExercises: shoulderExercises,
      tricepsExercises: tricepExercises,
      bicepsExercises: bicepsExercises,
      legExercises: legExercises
    };
    user = await userDAO.create(userObj);
  }

  return user!;
}

export async function getUserProfile(userDAO: MongoGenericDAO<User>, userClaimsSet: UserClaimsSet): Promise<User> {
  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    throw new Error('Benutzer nicht gefunden');
  }
  return user;
}

function validateUsername(username: string): boolean {
  return username.length >= 3;
}
