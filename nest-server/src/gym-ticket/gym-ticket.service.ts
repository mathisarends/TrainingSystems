import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GymTicketDto } from './dto/gym-ticket.dto';
import { GymTicket } from './model/gym-ticket.model';

@Injectable()
export class GymTicketService {
  constructor(
    @InjectModel(GymTicket.name)
    private readonly gymTicketModel: Model<GymTicket>,
  ) {}

  async updateGymTicketForUser(userId: string, gymTicketDto: GymTicketDto) {
    const gymTicket = new this.gymTicketModel({
      gymTicket: gymTicketDto.gymTicket,
      userId: userId,
    });

    return await gymTicket.save();
  }

  async getGymTicketByUserId(userId: string) {
    return await this.gymTicketModel
      .find({ userId: userId }, 'gymTicket')
      .exec();
  }
}
