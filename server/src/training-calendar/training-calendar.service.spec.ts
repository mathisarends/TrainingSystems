import { Test, TestingModule } from '@nestjs/testing';
import { TrainingCalendarService } from './training-calendar.service';

describe('TrainingCalendarService', () => {
  let service: TrainingCalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingCalendarService],
    }).compile();

    service = module.get<TrainingCalendarService>(TrainingCalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
