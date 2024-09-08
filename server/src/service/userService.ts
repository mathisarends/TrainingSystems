import { MongoGenericDAO } from '../models/dao/mongo-generic.dao.js';
import { User } from '../models/collections/user/user.js';
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
} from '../ressources/exercises/exerciseCatalog.js';
import { Request, Response } from 'express';
import { ExerciseCategoryType } from '../models/training/exercise-category-type.js';
import { encrypt } from '../utils/cryption.js';
import { NewUserParams } from './new-user-params.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerUser(userDAO: MongoGenericDAO<User>, userDetails: Record<string, string>): Promise<User> {
  const { username, email, password, confirmPassword } = userDetails;

  if (password !== confirmPassword) throw new Error('Die angegebenen Passwörter stimmen nicht überein');

  const existingUser = await userDAO.findOne({ email });

  if (existingUser) throw new Error('Es existiert bereits ein Benutzer mit diesem Namen');

  if (!validateUsername(username)) {
    throw new Error('Der Nutzername muss mindestens 3 Zeichen lang sein');
  }

  const userObj = await createNewUser({ username, email, password });
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

  const { email, name } = payload;
  let user = await userDAO.findOne({ email: email });

  if (!user && name && email) {
    const userObj = await createNewUser({ username: name, email: email });

    user = await userDAO.create(userObj);
  }

  return user!;
}

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

function validateUsername(username: string): boolean {
  return username.length >= 3;
}

async function createNewUser(userDetails: NewUserParams): Promise<Omit<User, 'id' | 'createdAt'>> {
  const { username, email, password } = userDetails;

  const userObj: Omit<User, 'id' | 'createdAt'> = {
    username,
    email,
    trainingPlans: [],
    trainingDayNotifications: [],
    gymtTicket: encrypt('noGymTicketAvailable'),
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

export function createResetPasswordEmail(user: User, email: string, redirectUrl: string) {
  const username = user.username;
  const emailContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
      <h3 style="color: #000"><b>Hallo ${username},</b></h3>
      <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt.</p>
      <p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p>
      <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; font-size: 16px; color: #fff; background-color: #000; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a>
      <br />
      <p>Diesen Link bitte nicht weitergeben.</p>
      <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren.</p>
      <br />
      <p>Mit freundlichen Grüßen,<br />Ihr TYR-TS Team</p>
      <hr />
      <p style="font-size: 12px; color: #888">Wenn der obige Link nicht funktioniert, kopiere ihn bitte manuell in die Adressleiste deines Browsers:</p>
      <p style="font-size: 12px; color: #888">${redirectUrl}</p>
    </div>
  `;

  return {
    from: 'trainingSystems@no-reply.com',
    to: email,
    subject: 'Passwort zurücksetzen',
    html: emailContent
  };
}
