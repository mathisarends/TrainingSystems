// gymTicketRouter.js
import express from 'express';
import * as userController from '../../controller/userController.js';
import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const gymTicketRouter = express.Router();

gymTicketRouter.put('/', authService.authenticationMiddleware, asyncHandler(userController.uploadGymTicket));
gymTicketRouter.get('/', authService.authenticationMiddleware, asyncHandler(userController.getGymTicket));

export default gymTicketRouter;
