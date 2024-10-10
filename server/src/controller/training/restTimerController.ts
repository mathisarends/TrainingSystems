import { Request, Response } from 'express';
import fingerprintService from '../../service/fingerprintService.js';
import restTimerKeepAliveService from '../../service/restTimer/restTimerKeepAliveService.js';
import userManager from '../../service/userManager.js';

export async function setPauseTimerKeepAlive(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);
  const fingerprint = fingerprintService.generateDeviceFingerprint(req);

  restTimerKeepAliveService.startTimer(user.id, fingerprint);

  return res.status(200).json({ message: `Keep Alive Signal for timer started` });
}

export async function stopKeepAliveSignal(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);
  restTimerKeepAliveService.stopTimer(user.id);

  return res.status(200).json({ message: `Stopped timer succesfully` });
}
