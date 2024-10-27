import { Test, TestingModule } from '@nestjs/testing';
import { UserExerciseRecordController } from './user-exercise-record.controller';

describe('UserExerciseRecordController', () => {
  let controller: UserExerciseRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserExerciseRecordController],
    }).compile();

    controller = module.get<UserExerciseRecordController>(UserExerciseRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
