import { Request, Response } from 'express';
import { UpdateProfilePictureDto } from '../interfaces/updateProfilePictureDto.js';
import { UserProfileDto } from '../interfaces/userProfileDto.js';
import userManager from '../service/userManager.js';
import webSocketService from '../service/webSocket/webSocketService.js';

/**
 * Retrieves the user's profile information and returns a DTO containing the username, email, and picture URL.
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await userManager.getUser(res);

  const userDto: UserProfileDto = {
    id: user.id,
    username: user.username,
    email: user.email,
    pictureUrl: user.pictureUrl
  };

  res.status(200).json(userDto);
}

/**
 * Updates the user's profile picture with the provided URL from the request body.
 */
export async function updateProfilePicture(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);
  const body: UpdateProfilePictureDto = req.body;

  if (!body.profilePicture) {
    return res.status(404).json({ error: 'Profile picture not found in request body' });
  }

  webSocketService.sendTrainingNotificationToUser(user.id, 'Test 123');

  user.pictureUrl = body.profilePicture;
  await userManager.update(user);

  return res.status(200).json({ message: 'Dein Profilbild wurde erfolgreich geupdated' });
}

/**
 * Deletes the user's account and returns a confirmation message.
 */
export async function deleteAccount(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);

  await userManager.deleteById(user.id);

  return res.status(200).json({ message: 'Account gelöscht' });
}
