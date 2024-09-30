import express from 'express';
import { authService } from '../../service/authService.js';

import * as trainingSessionController from '../../controller/session/sessionController.js';

const trainingSessionRouter = express.Router();

/**
 * GET /
 *
 * @description Retrieves all sessions.
 * @route {GET} /
 */
trainingSessionRouter.get(
  '/',
  authService.authenticationMiddleware,
  trainingSessionController.getTrainingSessionCardViews
);

/**
 * GET /:id
 *
 * @description Retrieves an existing session.
 * @route {GET} /:id
 * @param {string} id - The ID of the session to retrieve.
 */

trainingSessionRouter.get(
  '/:id',
  authService.authenticationMiddleware,
  trainingSessionController.getTrainingSessionById
);

/**
 * POST /create
 *
 * @description Creates a new session.
 * @route {POST} /create
 */
trainingSessionRouter.post(
  '/create',
  authService.authenticationMiddleware,
  trainingSessionController.createTrainingSession
);

/**
 * POST /edit/:id
 *
 * @description Edits an existing session.
 * @route {POST} /edit/:id
 * @param {string} id - The ID of the session to edit.
 */
trainingSessionRouter.put(
  '/edit/:id',
  authService.authenticationMiddleware,
  trainingSessionController.editTrainingSesssion
);

/**
 * DELETE /:id
 *
 * @description Deletes an existing session.
 * @route {DELETE} /:id
 * @param {string} id - The ID of the session to delete.
 */
trainingSessionRouter.delete(
  '/:id',
  authService.authenticationMiddleware,
  trainingSessionController.deleteTrainingSession
);

/**
 * PATCH /id
 *
 * @description Updates specific data of an existing session.
 * @route {PATCH} /id
 */
trainingSessionRouter.patch(
  '/start/:id',
  authService.authenticationMiddleware,
  trainingSessionController.startTrainingSession
);

trainingSessionRouter.get(
  '/:id/latest-version',
  authService.authenticationMiddleware,
  trainingSessionController.getLatestVersionOfSession
);

/**
 * GET /:id/:version
 *
 * @description Retrieves a specific version of a training session by its ID and version number.
 * @route {GET} /:id/:version
 * @param {string} id - The ID of the training session.
 * @param {number} version - The version number of the training session to retrieve.
 * @middleware `authService.authenticationMiddleware` - Ensures the user is authenticated.
 */
trainingSessionRouter.get(
  '/:id/:version',
  authService.authenticationMiddleware,
  trainingSessionController.getTrainingSessionByVersion
);

/**
 * PATCH /id
 *
 * @description Updates specific data of an existing session.
 * @route {PATCH} /id
 */
trainingSessionRouter.patch(
  '/:id/:version',
  authService.authenticationMiddleware,
  trainingSessionController.updateTrainingSessionVersion
);

export default trainingSessionRouter;
