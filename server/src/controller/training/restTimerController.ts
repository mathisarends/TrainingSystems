import { Request, Response } from 'express';
import restTimerKeepAliveService from '../../service/restTimer/restTimerKeepAliveService.js';
import userManager from '../../service/userManager.js';

export async function setPauseTimerKeepAlive(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);
  const pauseTime = req.body.pauseTime;

  restTimerKeepAliveService.startTimer(user.id, pauseTime);

  return res.status(200).json({ message: `Timer running with ${pauseTime} seconds remaining` });
}
