import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GymTicketController } from './gym-ticket.controller';
import { GymTicketService } from './gym-ticket.service';
import { GymTicket, GymTicketSchema } from './model/gym-ticket.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GymTicket.name, schema: GymTicketSchema },
    ]),
  ],
  controllers: [GymTicketController],
  providers: [GymTicketService],
})
export class GymTicketModule {}
