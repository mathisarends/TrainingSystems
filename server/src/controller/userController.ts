import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { authService } from '../service/authService.js';
import * as userService from '../service/userService.js';

import dotenv from 'dotenv';
import transporter from '../config/mailerConfig.js';
import { getTonnagePerTrainingDay } from '../service/trainingService.js';
import { createResetPasswordEmail } from '../service/userService.js';

import { format } from 'date-fns';
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
  const mailOptions = createResetPasswordEmail(user, email, resetUrl);

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

export async function getPermisisons(req: Request, res: Response): Promise<Response> {
  const user = await userService.getUser(req, res);

  const permissions = {
    isTrainingSummaryEmailEnabled: user.isTrainingSummaryEmailEnabled ?? true
  };

  return res.status(200).json(permissions);
}

export async function updatePermissions(req: Request, res: Response): Promise<Response> {
  const user = await userService.getUser(req, res);
  const userDAO = userService.getUserGenericDAO(req);

  user.isTrainingSummaryEmailEnabled = req.body.isTrainingSummaryEmailEnabled;

  await userDAO.update(user);

  return res.status(200).json({ message: 'Einstellungen geupdated' });
}

/**
 * Retrieves the activity calendar for a user, calculating the tonnage (total weight lifted)
 * for each training day and returning a map of dates to tonnages.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A Promise that resolves to void. Sends a JSON response with the activity map.
 */
export async function getActivityCalendar(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);
  const activityMap = user.trainingPlans
    .flatMap(plan => plan.trainingWeeks)
    .flatMap(week => week.trainingDays)
    .filter(day => !!day.endTime)
    .reduce((map, day) => {
      const tonnagePerTrainingDay = getTonnagePerTrainingDay(day);
      const dayIndex = getIndexOfDayPerYearFromDate(day.endTime!);
      map.set(dayIndex, tonnagePerTrainingDay);
      return map;
    }, new Map<number, number>());

  const activityObject = Object.fromEntries(activityMap);
  res.status(200).json(activityObject);
}

/**
 * Retrieves the recent training durations for a user and returns an array of the last 14 durations.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A Promise that resolves to void. Sends a JSON response with the durations array.
 */
export async function getRecentTrainingDurations(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);

  const trainingDurationsWithDate = user.trainingPlans
    .flatMap(plan => plan.trainingWeeks)
    .flatMap(week => week.trainingDays)
    .filter(day => !!day.durationInMinutes)
    .map(day => ({
      durationInMinutes: day.durationInMinutes!,
      date: format(new Date(day.endTime!), 'dd.MM.yyyy')
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 14);

  res.status(200).json(trainingDurationsWithDate);
}
/**
 * Retrieves training day notifications for a user.
 */
export async function getTrainingDayNotifications(req: Request, res: Response): Promise<Response> {
  const userDAO = userService.getUserGenericDAO(req);

  const user = await userService.getUser(req, res);

  await userDAO.update(user);

  return res.status(200).json(user.trainingDayNotifications);
}

/**
 * Deletes a specific training day notification for a user.
 */
export async function deleteTrainingDayNotification(req: Request, res: Response): Promise<Response> {
  const notificationId = req.params.id;

  const userDAO = userService.getUserGenericDAO(req);
  const user = await userService.getUser(req, res);

  const notificationIndex = user.trainingDayNotifications.findIndex(notification => notification.id === notificationId);

  if (notificationIndex === -1) {
    return res.status(404).json({ error: 'Notification with id not found.' });
  }

  user.trainingDayNotifications.splice(notificationIndex, 1);

  await userDAO.update(user);

  return res.status(200).json({ message: 'Notification wurde erfolgreich entfernt' });
}

/**
 * Retrieves a specific training day by its ID along with its plan, week, and day indices.
 */
export async function getTrainingDayById(req: Request, res: Response): Promise<Response> {
  const trainingDayId = req.params.id;

  const user = await userService.getUser(req, res);

  for (const trainingPlan of user.trainingPlans) {
    const trainingPlanId = trainingPlan.id;

    for (let weekIndex = 0; weekIndex < trainingPlan.trainingWeeks.length; weekIndex++) {
      const trainingWeek = trainingPlan.trainingWeeks[weekIndex];

      for (let dayIndex = 0; dayIndex < trainingWeek.trainingDays.length; dayIndex++) {
        const trainingDay = trainingWeek.trainingDays[dayIndex];

        if (trainingDay.id === trainingDayId) {
          return res.status(200).json({
            trainingPlanId,
            weekIndex,
            dayIndex,
            trainingDay
          });
        }
      }
    }
  }

  // If no matching training day is found, return a 404 error
  return res.status(404).json({ error: 'Training day with the specified ID not found.' });
}

function getIndexOfDayPerYearFromDate(date: Date): number {
  const dateObj = new Date(date);

  const startOfYear = new Date(dateObj.getFullYear(), 0, 1);
  return Math.floor((dateObj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
}

export function signOut(req: Request, res: Response): void {
  authService.removeToken(res);
  res.status(200).json({ message: 'Token erfolgreich entfernt' });
}

export async function getAuthState(req: Request, res: Response): Promise<Response> {
  await userService.getUser(req, res);
  return res.status(200).json({ message: 'auth verified' });
}
