import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { authService } from '../service/authService.js';
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

import dotenv from 'dotenv';
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

/**
 * POST /register
 * Registers a new user.
 */
router.post('/register', async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  console.log('test');

  console.log(req.body);

  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({ error: 'Die angegebenen Passwörter stimmen nicht überein' });
  }

  try {
    const filter: Partial<User> = { email: req.body.email };
    const user = await userDAO.findOne(filter);

    if (user) {
      return res.status(409).json({ error: 'Es existiert bereits ein Benutzer mit diesem Namen' });
    }

    if (!validateUsername(req.body.username!)) {
      return res.status(400).json({ error: 'Der Nutzername muss mindestens 3 Zeichen lang sein' });
    }

    const userObj: Omit<User, 'id' | 'createdAt'> = {
      username: req.body.username!,
      email: req.body.email!,
      password: await bcrypt.hash(req.body.password!, 10),
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

    const createdUser = await userDAO.create(userObj);
    authService.createAndSetToken({ id: createdUser.id }, res);

    return res.status(200).json({ message: 'Dein Account wurde erfolgreich erstellt' });
  } catch (error) {
    console.error(`Error while trying to register ${error}`);
    res.status(500).json({ error: error });
  }
});

/**
 * POST /login
 * Logs in an existing user.
 */
router.post('/login', async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  try {
    const filter: Partial<User> = { email: req.body.email };
    const user = await userDAO.findOne(filter);

    if (!user || !(await bcrypt.compare(req.body.password, user.password!))) {
      authService.removeToken(res);
      res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
    }

    authService.createAndSetToken({ id: user!.id }, res);
    res.status(200).json({ message: 'Erfolgreich eingeloggt' });
  } catch (error) {
    console.error(`Error while trying to login ${error}`);
    res.status(500).json({ error: error });
  }
});

router.post('/login/oauth2', async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const token = req.body.credential;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }
    /* const { sub, email, name, picture } = payload; */ // maybe use sub and picture in the future
    const { email, name, picture } = payload;

    const filter: Partial<User> = { email: email };
    const user = await userDAO.findOne(filter);
    console.log('🚀 ~ router.post ~ user:', user);

    if (!user && name && email) {
      // user ist nicht vorhanden hier dann neuen erstellen
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

      const createdUser = await userDAO.create(userObj);
      authService.createAndSetToken({ id: createdUser.id }, res);
    } else if (user) {
      authService.createAndSetToken({ id: user.id }, res);
    } //#endregion
    res.redirect('http://localhost:4200?login=success');
  } catch (error) {
    console.error('Error during Google login', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/profile', authService.authenticationMiddleware, async (req, res) => {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  const user = await userDAO.findOne({ id: userClaimsSet.id });
  if (!user) {
    return res.status(404).json({ error: 'Benutzer nicht gefunden' });
  }

  // Formatieren des createdAt-Felds
  const formattedCreatedAt = new Date(user.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const userDto = {
    username: user.username,
    email: user.email,
    createdAt: formattedCreatedAt,
    pictureUrl: user.pictureUrl
  };

  res.status(200).json({ userDto });
});

export default router;

function validateUsername(username: string): boolean {
  return username.length >= 3;
}
