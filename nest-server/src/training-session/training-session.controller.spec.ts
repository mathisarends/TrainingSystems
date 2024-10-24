import { Test, TestingModule } from '@nestjs/testing';
import { TrainingSessionController } from './training-session.controller';

describe('TrainingSessionController', () => {
  let controller: TrainingSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingSessionController],
    }).compile();

    controller = module.get<TrainingSessionController>(TrainingSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
