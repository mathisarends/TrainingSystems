import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('training-plan/view')
export class TrainingPlanViewController {
  @Get(':id/:week/:day')
  async getTrainingDayData(
    @Param('id') id: string,
    @Param('week', ParseIntPipe) weekIndex: number,
    @Param('day', ParseIntPipe) dayIndex: number,
  ) {}
}
