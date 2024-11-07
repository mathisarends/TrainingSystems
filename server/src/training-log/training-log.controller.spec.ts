import { Test, TestingModule } from '@nestjs/testing';
import { TrainingLogController } from './training-log.controller';

describe('TrainingLogController', () => {
  let controller: TrainingLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingLogController],
    }).compile();

    controller = module.get<TrainingLogController>(TrainingLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
