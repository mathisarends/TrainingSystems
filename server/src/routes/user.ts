import express from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao.js';
import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { authService } from '../service/authService.js';

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
      password: await bcrypt.hash(req.body.password!, 10)
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

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
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

export default router;

function validateUsername(username: string): boolean {
  return username.length >= 3;
}
