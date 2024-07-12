import express from 'express';
import * as trainingController from '../controller/trainingController.js';
import { authService } from '../service/authService.js';

const router = express.Router();

router.get('/plans', authService.authenticationMiddleware, trainingController.getPlans);
router.post('/create', authService.authenticationMiddleware, trainingController.createPlan);
router.delete('/delete/:planId', authService.authenticationMiddleware, trainingController.deletePlan);
router.get('/edit/:id', authService.authenticationMiddleware, trainingController.getPlanForEdit);
router.patch('/edit/:id', authService.authenticationMiddleware, trainingController.updatePlan);
router.get('/plan/:id/:week/:day', authService.authenticationMiddleware, trainingController.getPlanForDay);

export default router;
