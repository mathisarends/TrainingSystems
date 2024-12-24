import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetUser } from '../decorators/user.decorator';
import { BodyWeightService } from './body-weight.service';
import { BodyWeightEntryDto } from './dto/body-weight-entry.dto';

@Controller('body-weight')
export class BodyWeightController {
  constructor(private readonly bodyWeightService: BodyWeightService) {}

  @Get()
  async getBodyWeights(@GetUser() userId: string) {
    return this.bodyWeightService.getBodyWeights(userId);
  }

  @Post()
  async addBodyWeight(@GetUser() userId: string, @Body() weightEntryDto: BodyWeightEntryDto): Promise<void> {
    await this.bodyWeightService.addBodyWeight(userId, weightEntryDto);
  }
}
