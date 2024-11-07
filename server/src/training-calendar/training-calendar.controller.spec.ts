import { Test, TestingModule } from '@nestjs/testing';
import { TrainingCalendarController } from './training-calendar.controller';

describe('TrainingCalendarController', () => {
  let controller: TrainingCalendarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingCalendarController],
    }).compile();

    controller = module.get<TrainingCalendarController>(TrainingCalendarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
