import { format } from 'date-fns';
import { Request, Response } from 'express';
import { getTonnagePerTrainingDay } from '../service/trainingService.js';
import * as userService from '../service/userService.js';

// TODO: Dtos hierfür bauen und die Logik entsprechend ein wenig refactoren?

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
      date: formatDateWithWeekday(new Date(day.endTime!))
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

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

/**
 * Formats a date into the German weekday name and mm.dd format.
 * @param date - The date to format.
 * @returns A string with the format "Montag, 24.08".
 */
export function formatDateWithWeekday(date: Date): string {
  const germanWeekDays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  const dayName = germanWeekDays[date.getDay()];
  const formattedDate = format(date, 'dd.MM');
  return `${dayName}, ${formattedDate}`;
}
