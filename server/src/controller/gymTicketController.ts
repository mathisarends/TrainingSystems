import { Request, Response } from 'express';
import { GymTicketDto } from '../interfaces/gymTicketDto.js';
import userManager from '../service/userManager.js';
import { decrypt, encrypt } from '../utils/cryption.js';

/**
 * Retrieves the user's gym ticket from the database and decrypts it.
 */
export async function getGymTicket(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);

  const decryptedGymTicket = decrypt(user.gymtTicket);

  return res.status(200).json(decryptedGymTicket);
}

/**
 * Encrypts and uploads a new gym ticket for the user.
 */
export async function uploadGymTicket(req: Request, res: Response): Promise<Response> {
  const user = await userManager.getUser(res);

  const body: GymTicketDto = req.body;

  if (!body.gymTicket) {
    return res.status(404).json({ error: 'Gym Ticket was not found in request body' });
  }

  const encryptedGymTicket = encrypt(body.gymTicket);

  user.gymtTicket = encryptedGymTicket;
  await userManager.update(user);

  return res.status(200).json({ message: 'Your Gym Ticket was succesfully updated' });
}
