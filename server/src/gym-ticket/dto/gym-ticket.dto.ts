import { IsNotEmpty } from '@nestjs/class-validator';
import { IsString } from 'class-validator';

/**
 * Data Transfer Object (DTO) used for uploading or retrieving gym tickets.
 * This DTO encapsulates the gym ticket information as a base64-encoded string.
 */
export class GymTicketDto {
  @IsString({ message: 'Gym ticket must be a string' })
  @IsNotEmpty({ message: 'Gym ticket is required' })
  gymTicket: string;
}
