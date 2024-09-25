import { Request, Response } from 'express';
import { authService } from '../service/authService.js';
import * as userService from '../service/userService.js';

import bcrypt from 'bcryptjs';
import transporter from '../config/mailerConfig.js';

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

  const redirectUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:4200?login=success'
      : 'https://trainingsystemsre.onrender.com?login=success';

  res.cookie('authTemp', 'some-temp-value', {
    maxAge: 30000
  });

  res.redirect(redirectUrl);
}

export function logOut(req: Request, res: Response): void {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreich entfernt' });
}

export async function getAuthState(req: Request, res: Response): Promise<Response> {
  await userService.getUser(req, res);
  return res.status(200).json({ message: 'auth verified' });
}

/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(req: Request, res: Response) {
  const userDAO = userService.getUserGenericDAO(req);

  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'Keine Email übergeben' });
  }

  const user = await userDAO.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ error: 'Kein User mit der Email gefunden!' });
  }

  const token = authService.createToken({ id: user.id }, '10min');

  const baseURL = process.env.NODE_ENV === 'development' ? process.env.DEV_BASE_URL : process.env.PROD_BASE_URL;

  const resetUrl = `${baseURL}/user/reset/password/${token}`;
  const mailOptions = userService.createResetPasswordEmail(user, email, resetUrl);

  await transporter.sendMail(mailOptions);

  user.passwordResetToken = token;
  await userDAO.update(user);

  res.status(200).json({ message: 'Die Email wurde versandt' });
}

/**
 * Authenticates the password reset page using the token.
 */
export async function authenticatePasswordResetPage(req: Request, res: Response): Promise<Response> {
  const token = req.params.token;

  try {
    res.locals.user = authService.verifyToken(token);
  } catch (error) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'The token has expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'An internal error occurred' });
    }
  }

  const user = await userService.getUser(req, res);

  if (user.passwordResetToken !== token) {
    return res.status(403).json({ error: 'Invalid password resetToken' });
  }

  return res.status(200).json({ success: 'Du kannst dein Passwort jetzt zurücksetzen!' });
}

/**
 * Resets the user's password using the token.
 */
export async function resetPassword(req: Request, res: Response): Promise<Response> {
  const token = req.params.token;
  res.locals.user = authService.verifyToken(token);

  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  if (req.body.password !== req.body.repeatPassword) {
    return res.status(400).json({ error: 'Die angegebenen Passwörter stimmen nicht überein' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'Google Nutzer können ihre Passwort nicht über diesen Wege zurücksetzen' });
  }

  if (await bcrypt.compare(req.body.password, user.password)) {
    return res.status(400).json({ error: 'Dein neues Passwort darf nicht gleichzeitig dein altes sein.' });
  }

  user.password = await bcrypt.hash(req.body.password, 10);
  user.passwordResetToken = undefined;
  await userDAO.update(user);

  authService.removeToken(res);

  return res.status(200).json({ message: 'Dein Passwort wurde erfolgreich zurückgesetzt' });
}
