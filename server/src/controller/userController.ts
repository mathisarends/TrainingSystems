import { Request, Response } from 'express';
import { MongoGenericDAO } from '../models/mongo-generic.dao';
import * as userService from '../service/userService.js';
import { authService } from '../service/authService.js';
import { User } from '@shared/models/user.js';

export async function register(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  try {
    const user = await userService.registerUser(userDAO, req.body);
    authService.createAndSetToken({ id: user.id }, res);
    res.status(200).json({ message: 'Dein Account wurde erfolgreich erstellt' });
  } catch (error) {
    res.status(400).json({ error: (error as unknown as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  try {
    const user = await userService.loginUser(userDAO, req.body.email, req.body.password);
    if (!user) {
      authService.removeToken(res);
      return res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
    }
    authService.createAndSetToken({ id: user.id }, res);
    res.status(200).json({ message: 'Erfolgreich eingeloggt' });
  } catch (error) {
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function loginOAuth2(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;

  try {
    const user = await userService.loginOAuth2User(userDAO, req.body.credential);
    authService.createAndSetToken({ id: user.id }, res);
    res.redirect('http://localhost:4200?login=success');
  } catch (error) {
    res.status(500).json({ error: (error as unknown as Error).message });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userDAO: MongoGenericDAO<User> = req.app.locals.userDAO;
  const userClaimsSet = res.locals.user;

  try {
    const user = await userService.getUserProfile(userDAO, userClaimsSet);
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
  } catch (error) {
    res.status(404).json({ error: (error as unknown as Error).message });
  }
}
