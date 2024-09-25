// gymTicketRouter.js
import express from 'express';
import * as gymTicketController from '../../controller/gymTicketController.js';

import { asyncHandler } from '../../middleware/error-handler.js';
import { authService } from '../../service/authService.js';

const gymTicketRouter = express.Router();

gymTicketRouter.put('/', authService.authenticationMiddleware, asyncHandler(gymTicketController.uploadGymTicket));
gymTicketRouter.get('/', authService.authenticationMiddleware, asyncHandler(gymTicketController.getGymTicket));

export default gymTicketRouter;
