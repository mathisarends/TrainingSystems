import { Test, TestingModule } from '@nestjs/testing';
import { TrainingRoutineService } from './training-routine.service';

describe('TrainingRoutineService', () => {
  let service: TrainingRoutineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingRoutineService],
    }).compile();

    service = module.get<TrainingRoutineService>(TrainingRoutineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
