import { Body, Controller, Get, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { GetUser } from 'src/decorators/user.decorator';
import { GymTicketDto } from './dto/gym-ticket.dto';
import { GymTicketService } from './gym-ticket.service';

@Controller('gym-ticket')
export class GymTicketController {
  constructor(private readonly gymTicketService: GymTicketService) {}

  @Get()
  async getGymTicketForUser(@GetUser() userId: string, @Res() res: Response) {
    const ticketBase64Str =
      await this.gymTicketService.getGymTicketByUserId(userId);
    return res.status(200).json(ticketBase64Str);
  }

  @Put()
  async updateGymTicketForUser(
    @GetUser() userId: string,
    @Body() gymTicketDto: GymTicketDto,
  ) {
    return await this.gymTicketService.updateGymTicketForUser(
      userId,
      gymTicketDto,
    );
  }
}
