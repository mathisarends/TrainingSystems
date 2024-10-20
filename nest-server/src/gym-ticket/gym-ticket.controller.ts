import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { GymTicketDto } from './dto/gym-ticket.dto';
import { GymTicketService } from './gym-ticket.service';

@Controller('gym-ticket')
export class GymTicketController {
  constructor(private readonly gymTicketService: GymTicketService) {}

  @Get()
  async getGymTicketForUser(@Req() request: Request) {
    const user = request['user'];
    return await this.gymTicketService.getGymTicketByUserId(user.id);
  }

  @Put()
  async updateGymTicketForUser(
    @Req() request: Request,
    @Body() gymTicketDto: GymTicketDto,
  ) {
    const user = request['user'];
    return await this.gymTicketService.updateGymTicketForUser(
      user.id,
      gymTicketDto,
    );
  }
}
