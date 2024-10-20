import { IsNotEmpty } from '@nestjs/class-validator';
import { IsString, Matches } from 'class-validator';

/**
 * Data Transfer Object (DTO) used for uploading or retrieving gym tickets.
 * This DTO encapsulates the gym ticket information as a base64-encoded string.
 */
export class GymTicketDto {
  @IsString({ message: 'Gym ticket must be a string' })
  @IsNotEmpty({ message: 'Gym ticket is required' })
  @Matches(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/, {
    message: 'Gym ticket must be a valid Base64 string',
  })
  gymTicket: string;
}
