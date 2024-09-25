import express from 'express';

import activityRouter from './activityRouter.js';
import authRouter from './authRoutes.js';
import gymTicketRouter from './gymTicketRouter.js';
import permissionRouter from './permissionRouter.js';
import profileRouter from './profileRouter.js';

const userRouter = express.Router();

userRouter.use('/gym-ticket', gymTicketRouter);
userRouter.use('/profile', profileRouter);
userRouter.use('/auth', authRouter);
userRouter.use('/permissions', permissionRouter);
userRouter.use('/activity', activityRouter);

export default userRouter;
