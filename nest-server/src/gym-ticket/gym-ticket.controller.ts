import { Body, Controller, Get, Put } from '@nestjs/common';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/user.model';
import { GymTicketDto } from './dto/gym-ticket.dto';
import { GymTicketService } from './gym-ticket.service';

@Controller('gym-ticket')
export class GymTicketController {
  constructor(private readonly gymTicketService: GymTicketService) {}

  @Get()
  async getGymTicketForUser(@GetUser() user: User) {
    return await this.gymTicketService.getGymTicketByUserId(user.id);
  }

  @Put()
  async updateGymTicketForUser(
    @GetUser() user: User,
    @Body() gymTicketDto: GymTicketDto,
  ) {
    return await this.gymTicketService.updateGymTicketForUser(
      user.id,
      gymTicketDto,
    );
  }
}
