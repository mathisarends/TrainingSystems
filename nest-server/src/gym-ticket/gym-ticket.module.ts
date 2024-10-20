import { Module } from '@nestjs/common';
import { GymTicketController } from './gym-ticket.controller';
import { GymTicketService } from './gym-ticket.service';

@Module({
  controllers: [GymTicketController],
  providers: [GymTicketService]
})
export class GymTicketModule {}
