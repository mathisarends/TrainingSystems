import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { GetUser } from '../decorators/user.decorator';
import { BodyWeightService } from './body-weight.service';
import { BodyWeightEntryDto } from './dto/body-weight-entry.dto';
import { UpdateWeightGoalDto } from './dto/body-weight-configuration.dto';

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

  @Get('/configuration')
  async getConfiguration(@GetUser() userId: string) {
    return await this.bodyWeightService.getBodyWeightConfiguration(userId);
  }

  @Put('/configuration')
  async updateConfiguration(@GetUser() userId: string, @Body() updateWeightGoalDto: UpdateWeightGoalDto) {
    return await this.bodyWeightService.saveBodyWeightConfiguration(userId, updateWeightGoalDto);
  }
}
