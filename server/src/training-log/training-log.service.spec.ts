import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLogService } from './training-log.service';

describe('TrainingLogService', () => {
  let service: TrainingLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingLogService],
    }).compile();

    service = module.get<TrainingLogService>(TrainingLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
