import { Request, Response } from 'express';
import { PermissionDto } from 'shared/settings/permission.dto.js';
import userManager from '../service/userManager.js';

/**
 * Retrieves the user's current permissions.
 * Specifically checks if the user has enabled or disabled training summary emails.
 */
export async function getPermisisons(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);

  const permissions: PermissionDto = {
    isTrainingSummaryEmailEnabled: user.isTrainingSummaryEmailEnabled ?? true
  };

  return res.status(200).json(permissions);
}

/**
 * Updates the user's permissions based on the request body.
 * In this case, updates whether training summary emails are enabled or disabled.
 */
export async function updatePermissions(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);

  const permissionDto: PermissionDto = req.body;

  user.isTrainingSummaryEmailEnabled = permissionDto.isTrainingSummaryEmailEnabled;

  await userManager.update(user);
  return res.status(200).json({ message: 'Einstellungen geupdated' });
}
