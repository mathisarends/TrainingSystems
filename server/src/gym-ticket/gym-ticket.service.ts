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

  /**
   * Updates the gym ticket for a user. If it does not exist, a new entry will be created.
   */
  async updateGymTicketForUser(
    userId: string,
    gymTicketDto: GymTicketDto,
  ): Promise<GymTicket> {
    return await this.gymTicketModel
      .findOneAndUpdate(
        { userId: userId },
        { $set: { gymTicket: gymTicketDto.gymTicket } },
        { upsert: true, new: true },
      )
      .exec();
  }

  async getGymTicketByUserId(userId: string): Promise<string> {
    const result = await this.gymTicketModel
      .findOne({ userId: userId }, 'gymTicket')
      .lean()
      .exec();

    return result ? result.gymTicket : undefined;
  }
}
