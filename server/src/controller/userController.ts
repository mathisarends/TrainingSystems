import { Request, Response } from 'express';
import * as userService from '../service/userService.js';
import { authService } from '../service/authService.js';

import dotenv from 'dotenv';
dotenv.config();

export async function register(req: Request, res: Response): Promise<void> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.registerUser(userDAO, req.body);
  authService.createAndSetToken({ id: user.id }, res);
  res.status(200).json({ message: 'Dein Account wurde erfolgreich erstellt' });
}

export async function login(req: Request, res: Response) {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.loginUser(userDAO, req.body.email, req.body.password);
  if (!user) {
    authService.removeToken(res);
    return res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
  }
  authService.createAndSetToken({ id: user.id }, res);

  res.status(200).json({ message: 'Erfolgreich eingeloggt' });
}

export async function loginOAuth2(req: Request, res: Response): Promise<void> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.loginOAuth2User(userDAO, req.body.credential);
  authService.createAndSetToken({ id: user.id }, res);

  console.log('process.env.NODE_ENV', process.env.NODE_ENV);

  const redirectUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4200?login=success'
      : 'https://trainingsystemsre.onrender.com?login=success';

  console.log('🚀 ~ loginOAuth2 ~ redirectUrl:', redirectUrl);
  res.redirect(redirectUrl);
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);
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
}

export async function updateProfilePicture(req: Request, res: Response): Promise<Response> {
  const userDAO = req.app.locals.userDAO;
  const user = await userService.getUser(req, res);
  const profilePicture = req.body.profilePicture;

  if (!profilePicture) {
    return res.status(404).json({ error: 'Profile picture not found in request body' });
  }

  user.pictureUrl = profilePicture;
  await userDAO.update(user);

  return res.status(200).json({ message: 'Dein Profilbild wurde erfolgreich geupdated' });
}

export function signOut(req: Request, res: Response): void {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreich entfernt' });
}
