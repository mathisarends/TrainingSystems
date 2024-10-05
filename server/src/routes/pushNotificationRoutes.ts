import express from 'express';

import { authService } from '../service/authService.js';

const pushNotificationRouter = express.Router();

pushNotificationRouter.post('/', authService.authenticationMiddleware, () => {});

export default pushNotificationRouter;
