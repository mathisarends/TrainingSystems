import { Request, Response } from 'express';
import { authService } from '../service/authService.js';
import * as emailService from '../service/emailService.js';
import * as userService from '../service/userService.js';

import bcrypt from 'bcryptjs';
import transporter from '../config/mailerConfig.js';
import { LoginDto } from '../interfaces/loginDto.js';
import { RegisterUserDto } from '../interfaces/registerUserDto.js';

/**
 * Verifies the user's authentication state by checking the token.
 */
export async function getAuthState(req: Request, res: Response): Promise<Response> {
  await userService.getUser(req, res);
  return res.status(200).json({ message: 'auth verified' });
}

/**
 * Logs in a user using email and password.
 * If the login is successful, a token is created and set in the response.
 */
export async function login(req: Request, res: Response) {
  const userDAO = userService.getUserGenericDAO(req);

  const { email, password }: LoginDto = req.body;

  const user = await userDAO.findOne({ email: email });
  if (!user || !(await bcrypt.compare(password, user.password!))) {
    return res.status(401).json({ error: 'Keine gültige Email und Passwort Kombination' });
  }

  authService.createAndSetToken({ id: user.id }, res);

  res.status(200).json({ message: 'Erfolgreich eingeloggt' });
}

/**
 * Logs in a user using OAuth2 credentials.
 * After successful authentication, a token is created and set in the response cookies.
 * This token is used by the frontend to maintain the user's authentication state.
 */
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

/**
 * Sends a password reset email to the user.
 * Generates a token and includes it in the password reset URL.
 */
export function logOut(req: Request, res: Response): void {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreich entfernt' });
}

/**
 * Registers a new user and creates a token after successful registration.
 */
export async function register(req: Request, res: Response): Promise<Response> {
  const userDAO = userService.getUserGenericDAO(req);
  const { username, email, password, confirmPassword }: RegisterUserDto = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwörter stimmen nicht überein! ' });
  }

  const existingUser = await userDAO.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ error: 'Email bereits vergeben' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Der Name muss mindestens 3 Zeichen haben' });
  }

  const userObj = await userService.createNewUser({ username, email, password });
  const user = await userDAO.create(userObj);

  authService.createAndSetToken({ id: user.id }, res);
  return res.status(200).json({ message: 'Account erfolgreich erstellt' });
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
  const mailOptions = emailService.createResetPasswordEmail(user, email, resetUrl);

  await transporter.sendMail(mailOptions);

  user.passwordResetToken = token;
  await userDAO.update(user);

  res.status(200).json({ message: 'Die Email wurde versandt' });
}

/**
 * Authenticates the password reset page using a token.
 * Verifies if the token is valid and if the user has requested a password reset.
 */
export async function authenticatePasswordResetPage(req: Request, res: Response): Promise<Response> {
  const token = req.params.token;

  res.locals.user = authService.verifyToken(token);

  const user = await userService.getUser(req, res);

  if (user.passwordResetToken !== token) {
    return res.status(403).json({ error: 'Invalid password resetToken' });
  }

  return res.status(200).json({ success: 'Du kannst dein Passwort jetzt zurücksetzen!' });
}

/**
 * Resets the user's password using a valid reset token.
 * Validates the provided password and updates it in the system.
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
