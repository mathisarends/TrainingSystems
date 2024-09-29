import express from 'express';
import { authService } from '../../service/authService.js';

const trainingSessionRouter = express.Router();

/**
 * GET /
 *
 * @description Retrieves all sessions.
 * @route {GET} /
 */
trainingSessionRouter.get('/', authService.authenticationMiddleware, () => {});

/**
 * POST /create
 *
 * @description Creates a new session.
 * @route {POST} /create
 */
trainingSessionRouter.post('/create', authService.authenticationMiddleware, () => {});

/**
 * POST /edit/:id
 *
 * @description Edits an existing session.
 * @route {POST} /edit/:id
 * @param {string} id - The ID of the session to edit.
 */
trainingSessionRouter.post('/edit/:id', authService.authenticationMiddleware, () => {});

/**
 * DELETE /:id
 *
 * @description Deletes an existing session.
 * @route {DELETE} /:id
 * @param {string} id - The ID of the session to delete.
 */
trainingSessionRouter.delete('/:id', authService.authenticationMiddleware, () => {});

/**
 * GET /:id
 *
 * @description Retrieves an existing session.
 * @route {GET} /:id
 * @param {string} id - The ID of the session to retrieve.
 */

trainingSessionRouter.get('/:id', authService.authenticationMiddleware, () => {});

/**
 * PATCH /id
 *
 * @description Updates specific data of an existing session.
 * @route {PATCH} /id
 */
trainingSessionRouter.patch('/id', authService.authenticationMiddleware, () => {});

export default trainingSessionRouter;
