import { Request, Response } from 'express';
import { UpdateProfilePictureDto } from '../interfaces/updateProfilePictureDto.js';
import { UserProfileDto } from '../interfaces/userProfileDto.js';
import * as userService from '../service/userService.js';

/**
 * Retrieves the user's profile information and returns a DTO containing the username, email, and picture URL.
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  const user = await userService.getUser(req, res);

  const userDto: UserProfileDto = {
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
  const userDAO = req.app.locals.userDAO;
  const user = await userService.getUser(req, res);

  const body: UpdateProfilePictureDto = req.body;

  if (!body.profilePicture) {
    return res.status(404).json({ error: 'Profile picture not found in request body' });
  }

  user.pictureUrl = body.profilePicture;
  await userDAO.update(user);

  return res.status(200).json({ message: 'Dein Profilbild wurde erfolgreich geupdated' });
}

/**
 * Deletes the user's account and returns a confirmation message.
 */
export async function deleteAccount(req: Request, res: Response): Promise<Response> {
  const userDAO = userService.getUserGenericDAO(req);
  const user = await userService.getUser(req, res);

  await userDAO.delete(user.id);

  return res.status(200).json({ message: 'Account gelöscht' });
}
