import { Body, Controller, Get, Put } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { GymTicketDto } from './dto/gym-ticket.dto';
import { GymTicketService } from './gym-ticket.service';

@Controller('gym-ticket')
export class GymTicketController {
  constructor(private readonly gymTicketService: GymTicketService) {}

  @Get()
  async getGymTicketForUser(@GetUser() userId: string) {
    return await this.gymTicketService.getGymTicketByUserId(userId);
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
