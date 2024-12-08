import { Test, TestingModule } from '@nestjs/testing';
import { TrainingRoutineController } from './training-routine.controller';

describe('TrainingRoutineController', () => {
  let controller: TrainingRoutineController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingRoutineController],
    }).compile();

    controller = module.get<TrainingRoutineController>(TrainingRoutineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
